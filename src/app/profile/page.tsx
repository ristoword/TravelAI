import Link from "next/link";
import { ProfileForm } from "@/components/ProfileForm";
import { t } from "@/lib/i18n";

export default function ProfilePage() {
  const m = t("it");
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-6 px-5 py-10">
      <Link href="/" className="font-display text-xl text-teal-950">
        {m.brand}
      </Link>
      <h1 className="text-2xl font-semibold">{m.profile}</h1>
      <ProfileForm />
    </main>
  );
}
