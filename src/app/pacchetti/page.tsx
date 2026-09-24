import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { PageShell, cardClass } from "@/components/ui";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Pacchetti vacanze | TravelAI",
  description: "Pacchetti vacanze — lavori in corso. Nessuna offerta inventata.",
};

export default function PacchettiPage() {
  const m = t("it");

  return (
    <main className="min-h-full flex-1 bg-[#f4f7fb]">
      <SiteHeader />
      <PageShell>
        <p className="mb-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            ← {m.home}
          </Link>
        </p>

        <div className={`${cardClass} p-4 sm:p-6 md:p-8`}>
          <h1 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
            {m.packagesHolidayTitle}
          </h1>
          <h2 className="mt-2 text-lg font-semibold text-[var(--ink-soft)] sm:text-xl">
            {m.weeklyOffersTitle}
          </h2>
          <p
            className="mt-6 rounded-xl border border-[var(--line)] bg-[#f0f6fb] px-4 py-3 text-sm text-[var(--ink-soft)]"
            role="status"
          >
            {m.workInProgress}
          </p>
        </div>
      </PageShell>
    </main>
  );
}
