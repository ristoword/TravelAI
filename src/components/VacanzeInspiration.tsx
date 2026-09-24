import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { t } from "@/lib/i18n";

type InspirationItem = {
  id: string;
  title: string;
  alt: string;
  src: string;
  tab: "flights" | "package" | "hotels" | "cars";
};

/** Four sections that fill the annotated band under the search panel. */
const stripItems: InspirationItem[] = [
  {
    id: "hotel",
    title: "Hotel",
    alt: "Facciata di un hotel moderno al tramonto",
    src: "/vacanze/hotel.jpg",
    tab: "hotels",
  },
  {
    id: "spiagge",
    title: "Spiagge",
    alt: "Spiaggia tropicale con acqua turchese e sabbia chiara",
    src: "/vacanze/spiaggia.jpg",
    tab: "hotels",
  },
  {
    id: "montagne",
    title: "Montagne",
    alt: "Catena montuosa alpina innevata all'alba",
    src: "/vacanze/montagna.jpg",
    tab: "package",
  },
  {
    id: "resort",
    title: "Resort",
    alt: "Piscina di un resort fronte mare al tramonto",
    src: "/vacanze/resort.jpg",
    tab: "hotels",
  },
];

function StripCard({
  item,
  exploreLabel,
}: {
  item: InspirationItem;
  exploreLabel: string;
}) {
  return (
    <Link
      href={`/?tab=${item.tab}#ricerca-viaggio`}
      className="group block min-w-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      aria-label={`${exploreLabel} ${item.title}`}
    >
      <div className="relative h-[120px] w-full overflow-hidden rounded-xl bg-[var(--accent-soft)] sm:h-[130px] md:h-[140px]">
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
          className="object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
        />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2.5 pb-2 pt-8 text-sm font-semibold text-white sm:text-[15px]">
          {item.title}
        </span>
      </div>
    </Link>
  );
}

/**
 * Inspiration strip in the white band under «Cerca voli»:
 * same width as the search panel, four equal tiles, gap 8px.
 * No floating side cards beside the AI block.
 */
export function VacanzeInspiration({ children }: { children: ReactNode }) {
  const m = t("it");

  return (
    <div className="relative z-10 w-full">
      <section
        className="px-4 pt-1 pb-3 sm:px-8 sm:pb-4"
        aria-labelledby="vacanze-inspiration-heading"
      >
        <div className="mx-auto w-full max-w-5xl xl:max-w-6xl">
          <h2 id="vacanze-inspiration-heading" className="sr-only">
            {m.inspirationTitle}
          </h2>
          <ul
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            aria-label={m.inspirationEyebrow}
          >
            {stripItems.map((item) => (
              <li key={item.id} className="min-w-0">
                <StripCard item={item} exploreLabel={m.inspirationExplore} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </section>
    </div>
  );
}
