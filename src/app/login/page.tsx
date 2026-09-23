import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const m = t("it");
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-6 px-5 py-10">
      <Link href="/" className="font-display text-xl text-teal-950">
        {m.brand}
      </Link>
      <h1 className="text-2xl font-semibold">{m.login}</h1>
      <LoginForm />
      <p className="text-sm text-stone-600">
        <Link href="/register" className="underline">
          {m.register}
        </Link>
        {" · "}
        <Link href="/reset-password" className="underline">
          {m.resetPassword}
        </Link>
      </p>
    </main>
  );
}
