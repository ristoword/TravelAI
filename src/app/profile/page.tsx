import type { Metadata } from "next";
import { auth } from "@/auth";
import { ProfileForm } from "@/components/ProfileForm";
import { SiteHeader } from "@/components/SiteHeader";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Profilo | TravelAI",
  description: "Gestisci il tuo profilo TravelAI.",
};

export default async function ProfilePage() {
  const session = await auth();
  const m = t("it");

  return (
    <main className="min-h-full">
      <SiteHeader signedIn={Boolean(session?.user)} />
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-8 sm:px-10">
        <h1 className="font-display text-3xl text-[var(--ink)]">{m.profile}</h1>
        <ProfileForm />
      </div>
    </main>
  );
}
