import { auth } from "@/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SearchTabs } from "@/components/SearchTabs";
import { AiPromptSection } from "@/components/AiPromptSection";
import { t } from "@/lib/i18n";

export default async function HomePage() {
  const session = await auth();
  const m = t("it");

  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70vh] overflow-hidden"
      >
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#7eb8c2]/35 blur-3xl" />
        <div className="absolute right-[-4rem] top-0 h-80 w-80 rounded-full bg-[#a8cfd6]/40 blur-3xl" />
      </div>

      <SiteHeader signedIn={Boolean(session?.user)} />

      <section className="relative px-5 pb-8 pt-4 sm:px-10 sm:pt-8">
        <div className="mx-auto max-w-5xl">
          <p className="font-display animate-fade-up text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.92] tracking-tight text-[var(--accent)]">
            {m.brand}
          </p>
          <h1 className="animate-fade-up mt-5 max-w-3xl font-display text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.12] text-[var(--ink)]">
            {m.heroTitle}
          </h1>
          <p className="animate-fade-up-delay mt-4 max-w-xl text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">
            {m.heroSubtitle}
          </p>
          <div className="animate-fade-up-delay-2 mt-8">
            <SearchTabs />
          </div>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">
            {m.homeCtaHonest}
          </p>
        </div>
      </section>

      <AiPromptSection />
    </main>
  );
}
