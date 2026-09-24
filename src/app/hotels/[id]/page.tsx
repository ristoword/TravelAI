import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { HotelDetailClient } from "@/components/HotelDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Hotel ${decodeURIComponent(id)} | TravelAI`,
    description: "Dettaglio hotel da provider — solo dati reali.",
    openGraph: {
      title: `Hotel ${decodeURIComponent(id)} | TravelAI`,
    },
  };
}

export default async function HotelDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="min-h-full">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-10">
        <HotelDetailClient id={decodeURIComponent(id)} />
      </div>
    </main>
  );
}
