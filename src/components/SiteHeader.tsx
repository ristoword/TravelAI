import Link from "next/link";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { LogoutButton } from "@/components/LogoutButton";
import { t } from "@/lib/i18n";

const navLinkClass =
  "rounded-lg px-2.5 py-2 text-sm text-[#4a5f73] transition hover:bg-[#f0f6fb] hover:text-[#0b3d6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] whitespace-nowrap";

const navCtaClass =
  "inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(0,102,179,0.85)] transition hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] whitespace-nowrap";

const ghostBtnClass =
  "rounded-lg px-2.5 py-2 text-sm text-[#4a5f73] transition hover:bg-[#f0f6fb] hover:text-[#0b3d6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] whitespace-nowrap disabled:opacity-50";

export async function SiteHeader() {
  const session = await auth();
  const m = t("it");
  const signedIn = Boolean(session?.user);
  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0] ||
    m.profile;

  return (
    <header className="relative z-30 border-b border-[#e2ebf3] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-8">
        <BrandLogo />

        <nav
          className="hidden items-center gap-0.5 md:flex lg:gap-1"
          aria-label="Principale"
        >
          <Link href="/search/flights" className={navLinkClass}>
            {m.navFlights}
          </Link>
          <Link href="/search/hotels" className={navLinkClass}>
            {m.navHotels}
          </Link>
          <Link href="/search/cars" className={navLinkClass}>
            {m.navCars}
          </Link>
          <Link href="/search/package" className={navLinkClass}>
            {m.navPackages}
          </Link>
          <Link href="/esperienze" className={navLinkClass}>
            {m.navExperiences}
          </Link>
          <Link href="/assistenza" className={navLinkClass}>
            {m.navSupport}
          </Link>
          <Link href="/trips" className={navLinkClass}>
            {m.trips}
          </Link>
          <Link href="/compare" className={navLinkClass}>
            {m.compare}
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {signedIn ? (
            <>
              <Link
                href="/profile"
                className={`${navLinkClass} max-w-[9rem] truncate font-medium text-[#0b3d6e] sm:max-w-[12rem]`}
                title={displayName}
              >
                {displayName}
              </Link>
              <LogoutButton className={ghostBtnClass} />
            </>
          ) : (
            <Link href="/login" className={navCtaClass}>
              {m.loginRegister}
            </Link>
          )}
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-[#eef3f8] px-4 py-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Sezioni"
      >
        <Link href="/search/flights" className={navLinkClass}>
          {m.navFlights}
        </Link>
        <Link href="/search/hotels" className={navLinkClass}>
          {m.navHotels}
        </Link>
        <Link href="/search/cars" className={navLinkClass}>
          {m.navCars}
        </Link>
        <Link href="/search/package" className={navLinkClass}>
          {m.navPackages}
        </Link>
        <Link href="/esperienze" className={navLinkClass}>
          {m.navExperiences}
        </Link>
        <Link href="/assistenza" className={navLinkClass}>
          {m.navSupport}
        </Link>
        <Link href="/trips" className={navLinkClass}>
          {m.trips}
        </Link>
        <Link href="/compare" className={navLinkClass}>
          {m.compare}
        </Link>
      </nav>
    </header>
  );
}
