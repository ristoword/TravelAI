"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { locales, t } from "@/lib/i18n";

type ProfileUser = {
  id: string;
  email: string;
  name: string | null;
  locale: string;
  role: string;
  emailVerified: string | null;
};

export function ProfileForm() {
  const router = useRouter();
  const m = t("it");
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [locale, setLocale] = useState("it");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/profile");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        if (!cancelled) setError(data?.error?.message ?? "Errore profilo");
        if (!cancelled) setLoading(false);
        return;
      }
      if (!cancelled) {
        setUser(data.user);
        setName(data.user.name ?? "");
        setLocale(data.user.locale ?? "it");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || null, locale }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? "Aggiornamento non riuscito");
      return;
    }
    setUser(data.user);
    setStatus("Profilo aggiornato.");
  }

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <p className="text-sm text-stone-600">Caricamento…</p>;
  }

  if (!user) {
    return (
      <p role="alert" className="text-sm text-red-700">
        {error ?? "Profilo non disponibile"}
      </p>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="text-sm text-stone-700">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Ruolo:</strong> {user.role}
        </p>
        <p>
          <strong>Email verificata:</strong>{" "}
          {user.emailVerified ? "sì" : "no"}
        </p>
      </div>
      <form onSubmit={onSave} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{m.name}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-stone-300 bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Locale</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="rounded border border-stone-300 bg-white px-3 py-2"
          >
            {locales.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {status ? (
          <p role="status" className="text-sm text-teal-900">
            {status}
          </p>
        ) : null}
        <button
          type="submit"
          className="rounded bg-teal-800 px-4 py-2 text-white"
        >
          {m.updateProfile}
        </button>
      </form>
      <button
        type="button"
        onClick={onLogout}
        className="rounded border border-stone-400 px-4 py-2 text-sm"
      >
        {m.logout}
      </button>
    </div>
  );
}
