"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { btnGhostClass, btnPrimaryClass, cardClass, fieldClass } from "@/components/ui";
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
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data?.error?.message ?? "Errore profilo");
          return;
        }
        if (!cancelled) {
          setUser(data.user);
          setName(data.user.name ?? "");
          setLocale(data.user.locale ?? "it");
        }
      } catch {
        if (!cancelled) setError("Impossibile caricare il profilo.");
      } finally {
        if (!cancelled) setLoading(false);
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
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || null, locale }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error?.message ?? "Aggiornamento non riuscito");
        return;
      }
      setUser(data.user);
      setStatus("Profilo aggiornato.");
    } catch {
      setError("Aggiornamento non riuscito. Riprova.");
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    setError(null);
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Always leave the session UI even if the request fails.
    } finally {
      router.push("/");
      router.refresh();
      setLoggingOut(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)]">Caricamento…</p>;
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="text-sm text-red-700">
          {error ?? "Profilo non disponibile"}
        </p>
        <Link href="/" className={btnPrimaryClass}>
          {m.searchTrip}
        </Link>
      </div>
    );
  }

  return (
    <div className={`${cardClass} flex w-full max-w-md flex-col gap-6 p-6`}>
      <div className="space-y-1 text-sm text-[var(--ink-soft)]">
        <p>
          <span className="font-semibold text-[var(--ink)]">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-semibold text-[var(--ink)]">Ruolo:</span> {user.role}
        </p>
        <p>
          <span className="font-semibold text-[var(--ink)]">Email verificata:</span>{" "}
          {user.emailVerified ? "sì" : "no"}
        </p>
      </div>
      <nav
        className="flex flex-wrap gap-2 text-sm"
        aria-label="Scorciatoie profilo"
      >
        <Link href="/" className={btnGhostClass}>
          {m.searchTrip}
        </Link>
        <Link href="/trips" className={btnGhostClass}>
          {m.trips}
        </Link>
      </nav>
      <form onSubmit={onSave} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
            {m.name}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            disabled={saving}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
            Locale
          </span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className={fieldClass}
            disabled={saving}
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
          <p role="status" className="text-sm text-[var(--accent)]">
            {status}
          </p>
        ) : null}
        <button type="submit" disabled={saving} className={btnPrimaryClass}>
          {saving ? "Salvataggio…" : m.updateProfile}
        </button>
      </form>
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        className={btnGhostClass}
      >
        {loggingOut ? "Uscita…" : m.logout}
      </button>
    </div>
  );
}
