import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { CarResultsClient } from "@/components/CarResultsClient";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const pickup = one(sp.pickupLocation);
  const title = pickup ? `Auto a ${pickup} | TravelAI` : "Ricerca auto | TravelAI";
  return { title, openGraph: { title } };
}

export default async function CarSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const pickupLocation = one(sp.pickupLocation);
  const pickupAt = one(sp.pickupAt);
  const dropoffAt = one(sp.dropoffAt);

  return (
    <main className="min-h-full">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10">
        <h1 className="font-display text-3xl text-teal-950">Risultati auto</h1>
        <p className="mt-1 text-sm text-stone-600">
          {pickupLocation || "?"} · {pickupAt || "?"} → {dropoffAt || "?"}
        </p>
        {!pickupLocation || !pickupAt || !dropoffAt ? (
          <p className="mt-6 text-sm text-stone-600">Parametri incompleti.</p>
        ) : (
          <div className="mt-6">
            <CarResultsClient
              pickupLocation={pickupLocation}
              dropoffLocation={one(sp.dropoffLocation) || undefined}
              pickupAt={pickupAt}
              dropoffAt={dropoffAt}
              driverAge={Number(one(sp.driverAge) || 30)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
