import type { Metadata } from "next";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { TripsClient } from "@/components/TripsClient";

export const metadata: Metadata = {
  title: "I miei viaggi | TravelAI",
  description: "Trip builder: salva solo selezioni reali dell'utente.",
};

export default async function TripsPage() {
  const session = await auth();
  return (
    <main className="min-h-full">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-10">
        <h1 className="font-display text-3xl text-teal-950">I miei viaggi</h1>
        <p className="mt-1 text-sm text-stone-600">
          Bozze e selezioni utente sono consentite; mai offerte seed inventate.
        </p>
        <div className="mt-6">
          <TripsClient signedIn={Boolean(session?.user)} />
        </div>
      </div>
    </main>
  );
}
