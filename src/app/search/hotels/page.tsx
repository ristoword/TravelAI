import type { Metadata } from "next";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { HotelResultsClient } from "@/components/HotelResultsClient";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const destination = one(sp.destination);
  const checkIn = one(sp.checkIn);
  const title = destination
    ? `Hotel a ${destination}${checkIn ? ` · ${checkIn}` : ""} | TravelAI`
    : "Ricerca hotel | TravelAI";
  return {
    title,
    description: `Ricerca hotel${destination ? ` a ${destination}` : ""} su TravelAI.`,
    openGraph: { title, description: "Solo offerte provider reali." },
  };
}

export default async function HotelSearchPage({ searchParams }: Props) {
  const session = await auth();
  const sp = await searchParams;
  const destination = one(sp.destination);
  const checkIn = one(sp.checkIn);
  const checkOut = one(sp.checkOut);

  return (
    <main className="min-h-full">
      <SiteHeader signedIn={Boolean(session?.user)} />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10">
        <h1 className="font-display text-3xl text-teal-950">Risultati hotel</h1>
        <p className="mt-1 text-sm text-stone-600">
          {destination || "?"}
          {checkIn ? ` · ${checkIn}` : ""}
          {checkOut ? ` → ${checkOut}` : ""}
        </p>
        {!destination || !checkIn || !checkOut ? (
          <p className="mt-6 text-sm text-stone-600">Parametri incompleti.</p>
        ) : (
          <div className="mt-6">
            <HotelResultsClient
              destination={destination}
              checkIn={checkIn}
              checkOut={checkOut}
              adults={Number(one(sp.adults) || 2)}
              rooms={Number(one(sp.rooms) || 1)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
