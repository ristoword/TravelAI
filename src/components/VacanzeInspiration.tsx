import Image from "next/image";
import Link from "next/link";
import { t } from "@/lib/i18n";

type InspirationItem = {
  id: string;
  title: string;
  alt: string;
  src: string;
  /** Search tab to open on the homepage — no invented results. */
  tab: "flights" | "package" | "hotels" | "cars";
};

const items: InspirationItem[] = [
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
  {
    id: "mare",
    title: "Mare",
    alt: "Costa rocciosa sul mare azzurro in pomeriggio",
    src: "/vacanze/mare.jpg",
    tab: "package",
  },
  {
    id: "citta",
    title: "Città",
    alt: "Skyline di una città storica all'ora blu",
    src: "/vacanze/citta.jpg",
    tab: "flights",
  },
  {
    id: "laghi",
    title: "Laghi",
    alt: "Lago alpino specchiato tra boschi e vette",
    src: "/vacanze/laghi.jpg",
    tab: "package",
  },
];

export function VacanzeInspiration() {
  const m = t("it");

  return (
    <section
      className="relative z-10 px-4 pb-8 pt-2 sm:px-8 sm:pb-10"
      aria-labelledby="vacanze-inspiration-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {m.inspirationEyebrow}
            </p>
            <h2
              id="vacanze-inspiration-heading"
              className="mt-1 font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl"
            >
              {m.inspirationTitle}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
              {m.inspirationSubtitle}
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={
                index === items.length - 1
                  ? "col-span-2 sm:col-span-1 lg:col-span-1"
                  : undefined
              }
            >
              <Link
                href={`/?tab=${item.tab}#ricerca-viaggio`}
                className="group relative block overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                aria-label={`${m.inspirationExplore} ${item.title}`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--accent-soft)]">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                    priority={index < 4}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a1f38]/75 via-[#0a1f38]/15 to-transparent"
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-3.5">
                    <span className="font-display text-base font-semibold tracking-tight text-white sm:text-lg">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 opacity-90 transition group-hover:opacity-100 sm:text-[11px]">
                      {m.inspirationExplore}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
