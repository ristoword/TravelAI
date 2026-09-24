import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { FlightResultsClient } from "@/components/FlightResultsClient";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const origin = one(sp.origin);
  const destination = one(sp.destination);
  const departDate = one(sp.departDate);
  const title =
    origin && destination
      ? `Voli ${origin} → ${destination}${departDate ? ` · ${departDate}` : ""} | TravelAI`
      : "Ricerca voli | TravelAI";
  return {
    title,
    description: `Ricerca voli${origin && destination ? ` da ${origin} a ${destination}` : ""} su TravelAI.`,
    openGraph: {
      title,
      description: "Risultati solo da provider configurati — nessun dato inventato.",
    },
  };
}

export default async function FlightSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const origin = one(sp.origin);
  const destination = one(sp.destination);
  const departDate = one(sp.departDate);

  return (
    <main className="min-h-full">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 xl:max-w-7xl">
        <h1 className="font-display text-2xl text-[var(--ink)] sm:text-3xl">Risultati voli</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {origin || "?"} → {destination || "?"}
          {departDate ? ` · ${departDate}` : ""}
        </p>
        {!origin || !destination || !departDate ? (
          <p className="mt-6 text-sm text-stone-600">
            Parametri di ricerca incompleti. Torna alla home e compila il form.
          </p>
        ) : (
          <div className="mt-6">
            <FlightResultsClient
              origin={origin}
              destination={destination}
              departDate={departDate}
              returnDate={one(sp.returnDate) || undefined}
              adults={Number(one(sp.adults) || 1)}
              cabinClass={one(sp.cabinClass) || undefined}
              baggage={one(sp.baggage) || undefined}
              tripType={one(sp.tripType) || "roundtrip"}
            />
          </div>
        )}
      </div>
    </main>
  );
}
