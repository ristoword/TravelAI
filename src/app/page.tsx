import { SiteHeader } from "@/components/SiteHeader";
import { SearchTabs } from "@/components/SearchTabs";
import { AiPromptSection } from "@/components/AiPromptSection";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { IconCar, IconHotel, IconPlane } from "@/components/ui";
import { isStripeConfigured } from "@/lib/stripe";
import { t } from "@/lib/i18n";
import Link from "next/link";

function IconStar({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5 14.2 9.1 20 9.6l-4.4 3.8 1.4 5.7L12 16.4l-5 2.7 1.4-5.7L4 9.6l5.8-.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShield({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5 19 6.5v5.2c0 4.4-2.9 7.8-7 9.3-4.1-1.5-7-4.9-7-9.3V6.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.5 12.2 11.2 14l3.5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconChart({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 16V11M12 16V8M17 16v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconSupport({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4a7 7 0 0 0-7 7v2.5A2.5 2.5 0 0 0 7.5 16H9v-4H6.2A5.8 5.8 0 0 1 12 6a5.8 5.8 0 0 1 5.8 6H15v4h1.5a2.5 2.5 0 0 0 2.5-2.5V11a7 7 0 0 0-7-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default async function HomePage() {
  const m = t("it");
  const stripeReady = isStripeConfigured();

  const iconLinks = [
    {
      href: "/search/flights",
      label: m.navFlights,
      copy: m.iconFlightsCopy,
      icon: <IconPlane className="h-5 w-5" />,
    },
    {
      href: "/search/hotels",
      label: m.navHotels,
      copy: m.iconHotelsCopy,
      icon: <IconHotel className="h-5 w-5" />,
    },
    {
      href: "/search/cars",
      label: m.navCars,
      copy: m.iconCarsCopy,
      icon: <IconCar className="h-5 w-5" />,
    },
    {
      href: "/esperienze",
      label: m.navExperiences,
      copy: m.iconExperiencesCopy,
      icon: <IconStar className="h-5 w-5" />,
    },
  ];

  const trustItems = [
    {
      icon: <IconShield className="h-5 w-5" />,
      label: stripeReady ? m.trustStripe : m.trustStripePending,
    },
    {
      icon: <IconChart className="h-5 w-5" />,
      label: m.trustTrips,
    },
    {
      icon: <IconSupport className="h-5 w-5" />,
      label: m.trustSupport,
    },
  ];

  return (
    <main className="relative flex min-h-full flex-1 flex-col bg-[#f4f7fb]">
      <SiteHeader />

      <section className="relative isolate min-h-[min(88vh,720px)] overflow-hidden text-white">
        <HeroBackdrop />

        <div className="relative z-10 mx-auto flex min-h-[min(88vh,720px)] max-w-6xl flex-col justify-end px-4 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14">
          <div className="max-w-2xl">
            <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
              {m.brand}
            </p>
            <h1 className="animate-fade-up mt-3 font-display text-[clamp(2rem,6vw,3.75rem)] leading-[1.05] tracking-tight">
              {m.heroTitle}
            </h1>
            <p className="animate-fade-up-delay mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {m.heroSubtitle}
            </p>
          </div>

          <ul className="animate-fade-up-delay mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {iconLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex flex-col gap-2 rounded-2xl border border-white/25 bg-white/10 px-3 py-3.5 backdrop-blur-sm transition hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition group-hover:border-white">
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="text-xs leading-snug text-white/80">{item.copy}</span>
                </Link>
              </li>
            ))}
          </ul>

          <ul
            className="animate-fade-up-delay-2 mt-6 flex flex-wrap gap-x-6 gap-y-3 rounded-2xl border border-white/15 bg-[#0a1f38]/45 px-4 py-3.5 text-sm text-white/90 backdrop-blur-md sm:px-5"
            aria-label="Affidabilità"
          >
            {trustItems.map((item) => (
              <li key={item.label} className="inline-flex items-center gap-2">
                <span className="text-sky-200">{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative z-20 -mt-6 px-4 pb-6 sm:-mt-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <SearchTabs />
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">
            {m.homeCtaHonest}
          </p>
        </div>
      </section>

      <AiPromptSection />
    </main>
  );
}
