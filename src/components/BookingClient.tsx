"use client";

import { useEffect, useState } from "react";
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
              : data.message || "Stripe: non configurato",
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
    <div className="mx-auto max-w-lg rounded-2xl border border-teal-900/10 bg-white/80 p-6">
      <h1 className="font-display text-2xl text-teal-950">Prenotazione</h1>
      <p className="mt-2 text-sm text-stone-600">
        Tipo: {kind} · ID: {externalId}
      </p>
      <p className="mt-3 text-sm text-stone-600">
        Il booking reale viene eseguito solo se provider viaggio e Stripe sono
        configurati. Nessuna prenotazione o pagamento simulato.
      </p>
      {stripeStatus ? (
        <p className="mt-2 text-xs text-stone-500" role="status">
          {stripeStatus}
        </p>
      ) : null}
      <label className="mt-5 flex items-start gap-2 text-sm">
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
        className="mt-4 w-full rounded-md bg-teal-900 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-50"
      >
        {loading ? "…" : "Avvia prenotazione"}
      </button>
      {result && (
        <p
          className="mt-4 rounded-md border border-amber-700/20 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          role="status"
        >
          {result}
        </p>
      )}
      {paymentHint && (
        <p className="mt-2 text-xs text-stone-600" role="note">
          {paymentHint}
        </p>
      )}
    </div>
  );
}
