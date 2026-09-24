import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { BookingClient } from "@/components/BookingClient";

export const metadata: Metadata = {
  title: "Prenota | TravelAI",
  description: "Flusso prenotazione gated su provider e Stripe reali.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export default async function BookPage({ searchParams }: Props) {
  const sp = await searchParams;
  const kindRaw = one(sp.kind);
  const kind =
    kindRaw === "flight" || kindRaw === "hotel" || kindRaw === "car"
      ? kindRaw
      : null;
  const externalId = one(sp.externalId);
  const amountRaw = one(sp.amount);
  const currency = one(sp.currency) || "EUR";
  const expectedAmount = amountRaw ? Number(amountRaw) : undefined;

  return (
    <main className="min-h-full">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-10">
        {!kind || !externalId ? (
          <p className="text-sm text-stone-600">
            Parametri prenotazione mancanti. Seleziona un&apos;offerta dai risultati.
          </p>
        ) : (
          <BookingClient
            kind={kind}
            externalId={externalId}
            expectedAmount={
              typeof expectedAmount === "number" && Number.isFinite(expectedAmount)
                ? expectedAmount
                : undefined
            }
            currency={currency.length === 3 ? currency : "EUR"}
          />
        )}
      </div>
    </main>
  );
}
