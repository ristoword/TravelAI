import Link from "next/link";
import { ProfileForm } from "@/components/ProfileForm";
import { t } from "@/lib/i18n";

export default function ProfilePage() {
  const m = t("it");
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-6 px-5 py-10">
      <Link
        href="/"
        className="font-display text-2xl text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        {m.brand}
      </Link>
      <h1 className="font-display text-3xl text-[var(--ink)]">{m.profile}</h1>
      <ProfileForm />
    </main>
  );
}
