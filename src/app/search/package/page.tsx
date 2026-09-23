import type { Metadata } from "next";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { PackageResultsClient } from "@/components/PackageResultsClient";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const destination = one(sp.destination);
  const title = destination
    ? `Volo + Hotel · ${destination} | TravelAI`
    : "Volo + Hotel | TravelAI";
  return { title, openGraph: { title } };
}

export default async function PackageSearchPage({ searchParams }: Props) {
  const session = await auth();
  const sp = await searchParams;
  const origin = one(sp.origin);
  const destination = one(sp.destination);
  const departDate = one(sp.departDate);
  const returnDate = one(sp.returnDate);

  return (
    <main className="min-h-full">
      <SiteHeader signedIn={Boolean(session?.user)} />
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-10">
        <h1 className="font-display text-3xl text-teal-950">Volo + Hotel</h1>
        <p className="mt-1 text-sm text-stone-600">
          {origin || "?"} → {destination || "?"} · {departDate} – {returnDate}
        </p>
        {!origin || !destination || !departDate || !returnDate ? (
          <p className="mt-6 text-sm text-stone-600">Parametri incompleti.</p>
        ) : (
          <div className="mt-6">
            <PackageResultsClient
              origin={origin}
              destination={destination}
              departDate={departDate}
              returnDate={returnDate}
              adults={Number(one(sp.adults) || 2)}
              rooms={Number(one(sp.rooms) || 1)}
              cabinClass={one(sp.cabinClass) || undefined}
              hotelPreferences={one(sp.hotelPreferences) || undefined}
            />
          </div>
        )}
      </div>
    </main>
  );
}
