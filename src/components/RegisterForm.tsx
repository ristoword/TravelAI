"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { btnPrimaryClass, fieldClass } from "@/components/ui";
import { t } from "@/lib/i18n";

export function RegisterForm() {
  const router = useRouter();
  const m = t("it");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "Registrazione non riuscita");
        return;
      }

      if (data.emailVerification?.status === "email_provider_not_configured") {
        setMessage(
          `${m.emailNotConfigured}. Account creato; verifica email non inviata.`,
        );
      } else {
        setMessage("Account creato.");
      }

      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!login?.error) {
        router.push("/");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-[var(--ink-soft)]">
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {m.name}
        </span>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-[var(--ink-soft)]">
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {m.email}
        </span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-[var(--ink-soft)]">
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {m.password}
        </span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-[var(--accent)]">
          {message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={btnPrimaryClass}>
        {m.submitRegister}
      </button>
    </form>
  );
}
