"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useMountedFetch } from "@/components/useMountedFetch";
import { btnGhostClass, btnPrimaryClass, cardClass, fieldClass } from "@/components/ui";
import { t } from "@/lib/i18n";

type Trip = {
  id: string;
  title: string;
  destination?: string | null;
  tripItems?: Array<{ id: string; title: string; type: string }>;
};

export function TripsClient({ signedIn }: { signedIn: boolean }) {
  const m = t("it");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [activeTrip, setActiveTrip] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!signedIn) return;
    try {
      const res = await fetch("/api/trips");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error?.message || "Impossibile caricare i viaggi.");
        return;
      }
      setTrips(data.trips ?? []);
    } catch {
      setMessage(m.fetchError);
    }
  }, [signedIn, m.fetchError]);

  useMountedFetch(load, signedIn ? "in" : "out");

  if (!signedIn) {
    return (
      <div className={`${cardClass} p-8 text-center`}>
        <p className="text-sm text-[var(--ink-soft)]">
          Accedi per salvare Trip e TripItem (anche bozze utente, mai offerte seed).
        </p>
        <Link href="/login" className={`${btnPrimaryClass} mt-4 inline-flex`}>
          {m.login}
        </Link>
      </div>
    );
  }

  async function createTrip() {
    setMessage(null);
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, destination: destination || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data?.error?.message || "Creazione fallita.");
      return;
    }
    setTitle("");
    setDestination("");
    await load();
  }

  async function addItem() {
    if (!activeTrip || !itemTitle.trim()) return;
    setMessage(null);
    const res = await fetch(`/api/trips/${activeTrip}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "CUSTOM",
        title: itemTitle.trim(),
        draftPayload: { source: "user_draft" },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data?.error?.message || "Aggiunta fallita.");
      return;
    }
    setItemTitle("");
    await load();
  }

  return (
    <div className="space-y-6">
      {message && (
        <p
          className="rounded-xl border border-amber-700/25 bg-[var(--warn-bg)] px-4 py-3 text-sm text-[var(--warn-ink)]"
          role="status"
        >
          {message}
        </p>
      )}
      <form
        className={`grid gap-3 ${cardClass} p-4 sm:grid-cols-3`}
        onSubmit={(e) => {
          e.preventDefault();
          void createTrip();
        }}
      >
        <input
          className={fieldClass}
          placeholder="Titolo viaggio"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          aria-label="Titolo viaggio"
        />
        <input
          className={fieldClass}
          placeholder="Destinazione (opzionale)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          aria-label="Destinazione"
        />
        <button type="submit" className={btnPrimaryClass}>
          Crea viaggio
        </button>
      </form>

      {trips.length === 0 ? (
        <div className={`${cardClass} p-8 text-center text-sm text-[var(--ink-soft)]`}>
          Nessun viaggio salvato. Crea una bozza con i tuoi dati — niente seed automatici.
        </div>
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id} className={`${cardClass} p-5`}>
              <button
                type="button"
                className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                onClick={() => setActiveTrip(trip.id)}
                aria-expanded={activeTrip === trip.id}
              >
                <h2 className="font-display text-xl text-[var(--ink)]">{trip.title}</h2>
                <p className="text-sm text-[var(--ink-soft)]">
                  {trip.destination || "Destinazione non indicata"}
                </p>
              </button>
              {trip.tripItems && trip.tripItems.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-[var(--ink-soft)]">
                  {trip.tripItems.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg bg-[var(--accent-soft)] px-3 py-2"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                        {item.type}
                      </span>{" "}
                      {item.title}
                    </li>
                  ))}
                </ul>
              )}
              {activeTrip === trip.id && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <input
                    className={`${fieldClass} flex-1`}
                    placeholder="Aggiungi voce bozza"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    aria-label="Nuova voce bozza"
                  />
                  <button
                    type="button"
                    onClick={() => void addItem()}
                    className={btnGhostClass}
                  >
                    Aggiungi
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
