"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
        router.push("/profile");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>{m.name}</span>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-stone-300 bg-white px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{m.email}</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-stone-300 bg-white px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{m.password}</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-stone-300 bg-white px-3 py-2"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="text-sm text-teal-900">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-teal-800 px-4 py-2 text-white disabled:opacity-60"
      >
        {m.submitRegister}
      </button>
    </form>
  );
}
