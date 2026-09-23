import Link from "next/link";
import { t } from "@/lib/i18n";

type Props = {
  signedIn?: boolean;
};

export function SiteHeader({ signedIn }: Props) {
  const m = t("it");
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-5 py-5 sm:px-10">
      <Link
        href="/"
        className="font-display text-2xl tracking-tight text-[var(--accent)] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:text-3xl"
      >
        {m.brand}
      </Link>
      <nav
        className="flex flex-wrap items-center gap-1 text-sm sm:gap-2"
        aria-label="Principale"
      >
        <Link
          href="/trips"
          className="rounded-lg px-3 py-2 text-[var(--ink-soft)] transition hover:bg-white/60 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          {m.trips}
        </Link>
        <Link
          href="/compare"
          className="rounded-lg px-3 py-2 text-[var(--ink-soft)] transition hover:bg-white/60 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          {m.compare}
        </Link>
        {signedIn ? (
          <Link
            href="/profile"
            className="rounded-xl bg-[var(--accent)] px-3.5 py-2 font-medium text-white transition hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {m.profile}
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-[var(--ink-soft)] transition hover:bg-white/60 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {m.login}
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[var(--accent)] px-3.5 py-2 font-medium text-white transition hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {m.register}
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
