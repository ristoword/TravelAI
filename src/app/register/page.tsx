import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { cardClass } from "@/components/ui";
import { t } from "@/lib/i18n";

export default function RegisterPage() {
  const m = t("it");
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-6 px-5 py-10">
      <Link
        href="/"
        className="font-display text-2xl text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        {m.brand}
      </Link>
      <div className={`${cardClass} p-6 sm:p-8`}>
        <h1 className="font-display text-3xl text-[var(--ink)]">{m.register}</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Crea un account per salvare viaggi e preferenze.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
      <p className="text-sm text-[var(--ink-soft)]">
        <Link href="/login" className="underline-offset-4 hover:underline">
          {m.login}
        </Link>
      </p>
    </main>
  );
}
