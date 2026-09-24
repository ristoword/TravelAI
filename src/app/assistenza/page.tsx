import { SiteHeader } from "@/components/SiteHeader";
import { PageShell, cardClass } from "@/components/ui";
import { t } from "@/lib/i18n";

export const metadata = {
  title: "Assistenza",
};

function supportContact(): string | null {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) return null;
  // Show only a contact address if configured — never invent tickets or chat.
  const match = from.match(/<([^>]+)>/) || from.match(/([\w.+-]+@[\w.-]+\.\w+)/);
  return match?.[1] ?? (from.includes("@") ? from : null);
}

export default function AssistenzaPage() {
  const m = t("it");
  const email = supportContact();

  return (
    <main className="min-h-full flex-1 bg-[#f4f7fb]">
      <SiteHeader />
      <PageShell>
        <div className={`${cardClass} p-6 sm:p-8`}>
          <h1 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
            {m.navSupport}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)] sm:text-base">
            {m.supportIntro}
          </p>
          {email ? (
            <p className="mt-6 text-sm text-[var(--ink)]">
              {m.supportContactLabel}{" "}
              <a
                href={`mailto:${email}`}
                className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                {email}
              </a>
            </p>
          ) : (
            <p
              className="mt-6 rounded-xl border border-amber-700/25 bg-[var(--warn-bg)] px-4 py-3 text-sm text-[var(--warn-ink)]"
              role="status"
            >
              {m.supportComingSoon}
            </p>
          )}
        </div>
      </PageShell>
    </main>
  );
}
