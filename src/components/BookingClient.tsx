"use client";

import { useEffect, useState } from "react";
import { btnPrimaryClass, cardClass } from "@/components/ui";
import { t } from "@/lib/i18n";

type Props = {
  kind: "flight" | "hotel" | "car";
  externalId: string;
  expectedAmount?: number;
  currency?: string;
};

export function BookingClient({
  kind,
  externalId,
  expectedAmount,
  currency = "EUR",
}: Props) {
  const m = t("it");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [paymentHint, setPaymentHint] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch("/api/payments/config");
          const data = (await res.json()) as {
            status?: string;
            message?: string;
            webhook?: string;
          };
          setStripeStatus(
            data.status === "configured"
              ? `Stripe: configured (webhook: ${data.webhook ?? "n/d"})`
              : data.message ||
                  "Checkout non disponibile: manca STRIPE_PUBLISHABLE_KEY (e/o secret). Nessun pagamento simulato.",
          );
        } catch {
          setStripeStatus("Stripe: stato non verificabile");
        }
      })();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function start() {
    if (!confirmed) {
      setResult("Conferma esplicita richiesta prima di procedere.");
      return;
    }
    setLoading(true);
    setResult(null);
    setPaymentHint(null);
    try {
      const res = await fetch("/api/booking/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          externalId,
          confirmedByUser: true,
          ...(typeof expectedAmount === "number"
            ? { expectedAmount, currency }
            : {}),
        }),
      });
      const data = (await res.json()) as {
        status?: string;
        message?: string;
        booking?: unknown;
        payment?: {
          clientSecret?: string;
          publishableKey?: string;
          status?: string;
          paymentIntentId?: string;
        } | null;
      };
      setResult(
        data.message ||
          (data.status === "payment_pending"
            ? "PaymentIntent in pending."
            : "Prenotazione non disponibile."),
      );
      if (data.payment?.clientSecret && data.payment.publishableKey) {
        setPaymentHint(
          `PaymentIntent creato (status=${data.payment.status}). Usa publishable key + client_secret nel checkout Stripe Elements. Nessun pagamento marked succeeded qui.`,
        );
      }
    } catch {
      setResult(m.fetchError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${cardClass} mx-auto max-w-lg p-6 sm:p-8`}>
      <h1 className="font-display text-3xl text-[var(--ink)]">Prenotazione</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Tipo: {kind} · ID: {externalId}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
        Il booking reale viene eseguito solo se provider viaggio e Stripe sono
        configurati. Nessuna prenotazione o pagamento simulato.
      </p>
      {stripeStatus ? (
        <p
          className="mt-3 rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 text-xs text-[var(--muted)]"
          role="status"
        >
          {stripeStatus}
        </p>
      ) : null}
      <label className="mt-6 flex items-start gap-3 text-sm text-[var(--ink-soft)]">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1"
        />
        Confermo di voler avviare il flusso di prenotazione/pagamento.
      </label>
      <button
        type="button"
        disabled={loading || !confirmed}
        onClick={() => void start()}
        className={`${btnPrimaryClass} mt-5 w-full`}
      >
        {loading ? "…" : "Avvia prenotazione"}
      </button>
      {result && (
        <p
          className="mt-4 rounded-xl border border-amber-700/25 bg-[var(--warn-bg)] px-4 py-3 text-sm text-[var(--warn-ink)]"
          role="status"
        >
          {result}
        </p>
      )}
      {paymentHint && (
        <p className="mt-2 text-xs text-[var(--muted)]" role="note">
          {paymentHint}
        </p>
      )}
    </div>
  );
}
