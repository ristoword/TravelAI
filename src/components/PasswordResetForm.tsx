"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

export function PasswordResetForm() {
  const m = t("it");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? "Richiesta non riuscita");
      return;
    }
    if (data.email?.status === "email_provider_not_configured") {
      setMessage(m.emailNotConfigured);
    } else {
      setMessage("Se l’account esiste, la richiesta è stata registrata.");
    }
    if (data.developmentOnlyResetToken) {
      setToken(data.developmentOnlyResetToken);
      setMessage(
        "Provider email non configurato. Token disponibile solo in development (campo token).",
      );
    }
  }

  async function confirmReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? "Reset non riuscito");
      return;
    }
    setMessage("Password aggiornata.");
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <form onSubmit={requestReset} className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">{m.requestReset}</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span>{m.email}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-stone-300 bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-teal-800 px-4 py-2 text-white"
        >
          {m.requestReset}
        </button>
      </form>
      <form onSubmit={confirmReset} className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">{m.confirmReset}</h2>
        <label className="flex flex-col gap-1 text-sm">
          <span>Token</span>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="rounded border border-stone-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{m.password}</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-stone-300 bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-teal-800 px-4 py-2 text-white"
        >
          {m.confirmReset}
        </button>
      </form>
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
    </div>
  );
}
