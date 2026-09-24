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

/** Primary set — fits the marked horizontal band. */
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

/** Side gutters (desktop) — only when the flanking zones have room. */
const leftRailItems: InspirationItem[] = [
  {
    id: "mare",
    title: "Mare",
    alt: "Costa rocciosa sul mare azzurro in pomeriggio",
    src: "/vacanze/mare.jpg",
    tab: "package",
  },
  {
    id: "laghi",
    title: "Laghi",
    alt: "Lago alpino specchiato tra boschi e vette",
    src: "/vacanze/laghi.jpg",
    tab: "package",
  },
];

const rightRailItems: InspirationItem[] = [
  {
    id: "citta",
    title: "Città",
    alt: "Skyline di una città storica all'ora blu",
    src: "/vacanze/citta.jpg",
    tab: "flights",
  },
];

function MiniCard({
  item,
  exploreLabel,
  orientation = "horizontal",
}: {
  item: InspirationItem;
  exploreLabel: string;
  orientation?: "horizontal" | "vertical";
}) {
  const shell =
    orientation === "vertical"
      ? "w-full max-w-[7.25rem]"
      : "w-[6.75rem] shrink-0 sm:w-[7.25rem]";

  return (
    <Link
      href={`/?tab=${item.tab}#ricerca-viaggio`}
      className={`group ${shell} rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`}
      aria-label={`${exploreLabel} ${item.title}`}
    >
      <div className="relative h-[72px] w-full overflow-hidden rounded-lg bg-[var(--accent-soft)] sm:h-[84px] xl:h-[96px]">
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="116px"
          className="object-cover transition duration-300 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <span className="mt-1 block truncate text-center text-[11px] font-semibold leading-tight text-[var(--ink)] sm:text-xs">
        {item.title}
      </span>
    </Link>
  );
}

function CardRail({
  items,
  exploreLabel,
  label,
}: {
  items: InspirationItem[];
  exploreLabel: string;
  label: string;
}) {
  return (
    <ul
      className="flex flex-col items-center gap-2.5"
      aria-label={label}
    >
      {items.map((item) => (
        <li key={item.id} className="w-full">
          <MiniCard item={item} exploreLabel={exploreLabel} orientation="vertical" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Small inspiration cards in the three annotated zones:
 * 1) thin band under the search box
 * 2–3) left/right gutters beside the AI block (lg+)
 * Mobile: one compact horizontal scroll in the band only.
 */
export function VacanzeInspiration({ children }: { children: ReactNode }) {
  const m = t("it");

  return (
    <div className="relative z-10 w-full">
      {/* Zone 1 — horizontal strip between search and AI */}
      <section
        className="px-4 pt-1 pb-3 sm:px-8 sm:pb-4"
        aria-labelledby="vacanze-inspiration-heading"
      >
        <div className="mx-auto max-w-5xl">
          <h2 id="vacanze-inspiration-heading" className="sr-only">
            {m.inspirationTitle}
          </h2>
          <ul
            className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center sm:gap-3 sm:overflow-visible [&::-webkit-scrollbar]:hidden"
            aria-label={m.inspirationEyebrow}
          >
            {stripItems.map((item) => (
              <li key={item.id}>
                <MiniCard item={item} exploreLabel={m.inspirationExplore} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Zones 2–3 — side gutters flanking AI; strip-only below lg */}
      <section className="px-4 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-4 lg:grid-cols-[6.75rem_minmax(0,1fr)_6.75rem] lg:gap-5 xl:max-w-7xl xl:grid-cols-[7.5rem_minmax(0,42rem)_7.5rem] xl:justify-center xl:gap-6 2xl:max-w-[90rem]">
          <aside className="hidden lg:block lg:pt-1" aria-label="Ispirazione sinistra">
            <CardRail
              items={leftRailItems}
              exploreLabel={m.inspirationExplore}
              label="Idee viaggio a sinistra"
            />
          </aside>

          <div className="min-w-0 w-full justify-self-center lg:max-w-3xl xl:max-w-none">
            {children}
          </div>

          <aside className="hidden lg:block lg:pt-1" aria-label="Ispirazione destra">
            <CardRail
              items={rightRailItems}
              exploreLabel={m.inspirationExplore}
              label="Idee viaggio a destra"
            />
          </aside>
        </div>
      </section>
    </div>
  );
}
