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
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(42,122,124,0.35), transparent), radial-gradient(ellipse 60% 40% at 90% 0%, rgba(196,165,116,0.35), transparent)",
        }}
      />
      <SiteHeader signedIn={Boolean(session?.user)} />

      <section className="relative px-5 pb-10 pt-6 sm:px-10 sm:pt-10">
        <div className="mx-auto max-w-5xl">
          <p className="font-display animate-fade-up text-5xl leading-none tracking-tight text-teal-950 sm:text-6xl md:text-7xl">
            {m.brand}
          </p>
          <h1 className="animate-fade-up mt-4 max-w-3xl font-display text-3xl leading-tight text-teal-950/90 sm:text-4xl md:text-5xl">
            {m.heroTitle}
          </h1>
          <p className="animate-fade-up-delay mt-4 max-w-xl text-base text-stone-700 sm:text-lg">
            {m.heroSubtitle}
          </p>
          <div className="mt-8">
            <SearchTabs />
          </div>
          <p className="mt-4 max-w-2xl text-xs text-stone-600">{m.homeCtaHonest}</p>
        </div>
      </section>

      <AiPromptSection />
    </main>
  );
}
