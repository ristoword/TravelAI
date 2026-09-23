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
        className="font-display text-2xl tracking-tight text-teal-950 transition-opacity hover:opacity-80 sm:text-3xl"
      >
        {m.brand}
      </Link>
      <nav className="flex flex-wrap items-center gap-3 text-sm" aria-label="Principale">
        <Link href="/trips" className="underline-offset-4 hover:underline">
          {m.trips}
        </Link>
        <Link href="/compare" className="underline-offset-4 hover:underline">
          {m.compare}
        </Link>
        {signedIn ? (
          <Link href="/profile" className="underline-offset-4 hover:underline">
            {m.profile}
          </Link>
        ) : (
          <>
            <Link href="/login" className="underline-offset-4 hover:underline">
              {m.login}
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-teal-900 px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
            >
              {m.register}
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
