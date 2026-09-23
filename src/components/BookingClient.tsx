"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

type Props = {
  kind: "flight" | "hotel" | "car";
  externalId: string;
};

export function BookingClient({ kind, externalId }: Props) {
  const m = t("it");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function start() {
    if (!confirmed) {
      setResult("Conferma esplicita richiesta prima di procedere.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/booking/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          externalId,
          confirmedByUser: true,
        }),
      });
      const data = (await res.json()) as {
        status?: string;
        message?: string;
        booking?: unknown;
      };
      setResult(
        data.message ||
          (data.status === "ok"
            ? "Flusso avviato."
            : "Prenotazione non disponibile."),
      );
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
        Il booking reale viene eseguito solo se provider e Stripe sono configurati.
        Nessuna prenotazione simulata.
      </p>
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
        <p className="mt-4 rounded-md border border-amber-700/20 bg-amber-50 px-3 py-2 text-sm text-amber-950" role="status">
          {result}
        </p>
      )}
    </div>
  );
}
