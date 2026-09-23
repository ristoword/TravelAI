"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useMountedFetch } from "@/components/useMountedFetch";
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
      <div className="rounded-xl border border-teal-900/10 bg-white/70 p-6 text-center">
        <p className="text-sm text-stone-700">
          Accedi per salvare Trip e TripItem (anche bozze utente, mai offerte seed).
        </p>
        <Link href="/login" className="mt-3 inline-block underline">
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
        <p className="rounded-md border border-amber-700/20 bg-amber-50 px-3 py-2 text-sm" role="status">
          {message}
        </p>
      )}
      <form
        className="grid gap-3 rounded-xl border border-teal-900/10 bg-white/80 p-4 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          void createTrip();
        }}
      >
        <input
          className="rounded-md border border-teal-900/20 px-3 py-2 text-sm"
          placeholder="Titolo viaggio"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="rounded-md border border-teal-900/20 px-3 py-2 text-sm"
          placeholder="Destinazione (opzionale)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-md bg-teal-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Crea viaggio
        </button>
      </form>

      <ul className="space-y-3">
        {trips.map((trip) => (
          <li
            key={trip.id}
            className="rounded-xl border border-teal-900/10 bg-white/80 p-4"
          >
            <button
              type="button"
              className="text-left"
              onClick={() => setActiveTrip(trip.id)}
            >
              <h2 className="font-display text-lg text-teal-950">{trip.title}</h2>
              <p className="text-sm text-stone-600">
                {trip.destination || "Destinazione non indicata"}
              </p>
            </button>
            {trip.tripItems && trip.tripItems.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-sm text-stone-600">
                {trip.tripItems.map((item) => (
                  <li key={item.id}>
                    [{item.type}] {item.title}
                  </li>
                ))}
              </ul>
            )}
            {activeTrip === trip.id && (
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  className="flex-1 rounded-md border border-teal-900/20 px-3 py-2 text-sm"
                  placeholder="Aggiungi voce bozza"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => void addItem()}
                  className="rounded-md border border-teal-900/30 px-3 py-2 text-sm"
                >
                  Aggiungi
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
