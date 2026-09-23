import Link from "next/link";
import { auth } from "@/auth";
import { t } from "@/lib/i18n";

export default async function HomePage() {
  const session = await auth();
  const m = t("it");

  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f3d3e' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <p className="font-display text-2xl tracking-tight text-teal-950 sm:text-3xl">
          {m.brand}
        </p>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {session?.user ? (
            <>
              <Link href="/profile" className="underline-offset-4 hover:underline">
                {m.profile}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="underline-offset-4 hover:underline">
                {m.login}
              </Link>
              <Link
                href="/register"
                className="rounded bg-teal-900 px-3 py-1.5 text-white"
              >
                {m.register}
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="flex flex-1 flex-col justify-center gap-6 px-5 pb-16 pt-8 sm:px-10 sm:pt-4">
        <h1 className="font-display max-w-3xl text-4xl leading-tight text-teal-950 sm:text-5xl md:text-6xl">
          {m.heroTitle}
        </h1>
        <p className="max-w-xl text-base text-stone-700 sm:text-lg">
          {m.heroSubtitle}
        </p>
        <p className="max-w-xl text-sm text-stone-600">{m.notAvailableYet}</p>
        <p className="max-w-xl text-sm text-stone-600">{m.homeCtaHonest}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          {!session?.user ? (
            <>
              <Link
                href="/register"
                className="rounded bg-teal-900 px-5 py-2.5 text-sm text-white"
              >
                {m.register}
              </Link>
              <Link
                href="/login"
                className="rounded border border-teal-900/40 px-5 py-2.5 text-sm"
              >
                {m.login}
              </Link>
            </>
          ) : (
            <Link
              href="/profile"
              className="rounded bg-teal-900 px-5 py-2.5 text-sm text-white"
            >
              {m.profile}
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
