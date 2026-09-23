"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export function LoginForm() {
  const router = useRouter();
  const m = t("it");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [oauthMessage, setOauthMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Credenziali non valide o database non configurato.");
        return;
      }
      router.push("/profile");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function onOAuth(provider: "google" | "github") {
    setOauthMessage(null);
    const res = await fetch("/api/auth/oauth-status");
    const data = await res.json();
    if (!data.configured || data.providers?.[provider] !== "configured") {
      setOauthMessage(m.oauthNotConfigured);
      return;
    }
    await signIn(provider, { callbackUrl: "/profile" });
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4">
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
          autoComplete="current-password"
          required
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
      {oauthMessage ? (
        <p role="status" className="text-sm text-amber-800">
          {oauthMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-teal-800 px-4 py-2 text-white disabled:opacity-60"
      >
        {m.submitLogin}
      </button>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onOAuth("google")}
          className="rounded border border-stone-300 px-4 py-2 text-sm"
        >
          Google
        </button>
        <button
          type="button"
          onClick={() => onOAuth("github")}
          className="rounded border border-stone-300 px-4 py-2 text-sm"
        >
          GitHub
        </button>
      </div>
    </form>
  );
}
