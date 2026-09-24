import { SiteHeader } from "@/components/SiteHeader";
import { PageShell, cardClass } from "@/components/ui";
import { t } from "@/lib/i18n";

export const metadata = {
  title: "Esperienze",
};

export default function EsperienzePage() {
  const m = t("it");

  return (
    <main className="min-h-full flex-1 bg-[#f4f7fb]">
      <SiteHeader />
      <PageShell>
        <div className={`${cardClass} p-6 sm:p-8`}>
          <h1 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
            {m.navExperiences}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)] sm:text-base">
            {m.experiencesIntro}
          </p>
          <p
            className="mt-6 rounded-xl border border-amber-700/25 bg-[var(--warn-bg)] px-4 py-3 text-sm text-[var(--warn-ink)]"
            role="status"
          >
            {m.providerNotConfigured}
          </p>
        </div>
      </PageShell>
    </main>
  );
}
