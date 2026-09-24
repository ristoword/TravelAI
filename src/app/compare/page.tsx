import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { CompareClient } from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "Confronta hotel | TravelAI",
  description: "Confronto multi-hotel solo con campi presenti nei dati provider.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.ids) ? sp.ids.join(",") : sp.ids ?? "";
  const ids = raw
    .split(",")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean);

  return (
    <main className="min-h-full">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10">
        <h1 className="font-display text-3xl text-teal-950">Confronta hotel</h1>
        <p className="mt-1 text-sm text-stone-600">
          Campi assenti = &quot;non disponibile&quot;. Nessun valore stimato.
        </p>
        <div className="mt-6">
          <CompareClient ids={ids} />
        </div>
      </div>
    </main>
  );
}
