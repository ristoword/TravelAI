"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ProviderEmpty,
  SearchSkeleton,
  formatMoney,
} from "@/components/SearchStates";
import { useMountedFetch } from "@/components/useMountedFetch";
import { t } from "@/lib/i18n";

type HotelOffer = {
  externalId: string;
  name: string;
  imageUrl?: string;
  starRating?: number;
  guestRating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
  distanceKm?: number;
  amenities?: Array<{ code: string; name: string }>;
  price: { amount: number; currency: string };
};

type Props = {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
};

const AMENITY_FILTERS = [
  { code: "breakfast", label: "Colazione" },
  { code: "pool", label: "Piscina" },
  { code: "parking", label: "Parcheggio" },
  { code: "wifi", label: "Wi‑Fi" },
  { code: "spa", label: "Spa" },
  { code: "free_cancellation", label: "Cancellazione" },
  { code: "pets", label: "Animali" },
] as const;

export function HotelResultsClient(props: Props) {
  const m = t("it");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [offers, setOffers] = useState<HotelOffer[]>([]);
  const [retryable, setRetryable] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minStars, setMinStars] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const depsKey = [
    props.destination,
    props.checkIn,
    props.checkOut,
    props.adults,
    props.rooms,
  ].join("|");

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      if (!res.ok) {
        setError(m.fetchError);
        setRetryable(true);
        return;
      }
      const data = (await res.json()) as {
        status: string;
        message?: string;
        offers?: HotelOffer[];
        retryable?: boolean;
      };
      setStatus(data.status);
      setMessage(data.message ?? null);
      setOffers(data.offers ?? []);
      setRetryable(Boolean(data.retryable));
    } catch {
      setError(m.fetchError);
      setRetryable(true);
    } finally {
      setLoading(false);
    }
  }, [props, m.fetchError]);

  const { retry } = useMountedFetch(search, depsKey);

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      if (minStars > 0 && (o.starRating ?? 0) < minStars) return false;
      if (selectedAmenities.length === 0) return true;
      const codes = new Set((o.amenities ?? []).map((a) => a.code));
      return selectedAmenities.every((c) => codes.has(c));
    });
  }, [offers, minStars, selectedAmenities]);

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 6),
    );
  }

  if (loading) return <SearchSkeleton label={m.searchingHotels} />;
  if (error) {
    return (
      <ProviderEmpty
        title={m.serviceUnavailable}
        message={error}
        onRetry={retryable ? retry : undefined}
        retryLabel={m.retry}
      />
    );
  }
  if (status === "provider_not_configured") {
    return (
      <ProviderEmpty title={m.providerNotConfigured} message={message || ""} />
    );
  }
  if (offers.length === 0) {
    return (
      <ProviderEmpty
        title="Nessun hotel"
        message={message || "Nessuna offerta restituita dal provider."}
        onRetry={retryable ? retry : undefined}
        retryLabel={m.retry}
      />
    );
  }

  const filterPanel = (
    <div className="space-y-4 text-sm">
      <div>
        <p className="mb-2 font-medium">Categoria (stelle min)</p>
        <input
          type="range"
          min={0}
          max={5}
          value={minStars}
          onChange={(e) => setMinStars(Number(e.target.value))}
          aria-label="Stelle minime"
        />
        <p className="text-xs text-stone-500">{minStars}+</p>
      </div>
      <fieldset>
        <legend className="mb-2 font-medium">Servizi</legend>
        <div className="space-y-2">
          {AMENITY_FILTERS.map((a) => (
            <label key={a.code} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(a.code)}
                onChange={(e) => {
                  setSelectedAmenities((prev) =>
                    e.target.checked
                      ? [...prev, a.code]
                      : prev.filter((x) => x !== a.code),
                  );
                }}
              />
              {a.label}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="text-xs text-stone-500">
        I filtri si applicano solo ai risultati del provider, non a liste inventate.
      </p>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="hidden rounded-xl border border-teal-900/10 bg-white/70 p-4 lg:block">
        {filterPanel}
      </aside>
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className="rounded-md border border-teal-900/20 bg-white/80 px-3 py-2 text-sm lg:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            {m.filters}
          </button>
          {compareIds.length >= 2 && (
            <Link
              href={`/compare?ids=${compareIds.map(encodeURIComponent).join(",")}`}
              className="rounded-md bg-teal-900 px-3 py-2 text-xs font-semibold uppercase text-white"
            >
              {m.compare} ({compareIds.length})
            </Link>
          )}
        </div>

        {filtersOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 p-4 lg:hidden" role="dialog" aria-modal>
            <div className="mt-auto rounded-t-2xl bg-[var(--sand)] p-4">
              <button type="button" className="mb-3 text-sm" onClick={() => setFiltersOpen(false)}>
                Chiudi
              </button>
              {filterPanel}
            </div>
          </div>
        )}

        <ul className="space-y-4">
          {filtered.map((hotel) => {
            const price = formatMoney(hotel.price.amount, hotel.price.currency);
            return (
              <li
                key={hotel.externalId}
                className="grid overflow-hidden rounded-2xl border border-teal-900/10 bg-white/80 shadow-sm md:grid-cols-[280px_1fr]"
              >
                <div className="relative min-h-44 bg-teal-900/10">
                  {hotel.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full min-h-44 items-center justify-center px-4 text-center text-sm text-stone-500">
                      {m.imageUnavailable}
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between gap-3 p-4">
                  <div>
                    <h2 className="font-display text-xl text-teal-950">{hotel.name}</h2>
                    <p className="text-sm text-stone-600">
                      {hotel.starRating != null
                        ? `${hotel.starRating}★`
                        : m.notAvailable}
                      {hotel.guestRating != null
                        ? ` · Rating ${hotel.guestRating}`
                        : ""}
                      {hotel.reviewCount != null
                        ? ` · ${hotel.reviewCount} recensioni`
                        : ""}
                    </p>
                    <p className="text-sm text-stone-600">
                      {hotel.address || hotel.city || m.notAvailable}
                      {hotel.distanceKm != null
                        ? ` · ${hotel.distanceKm} km`
                        : ""}
                    </p>
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <p className="mt-1 text-xs text-stone-500">
                        {hotel.amenities.map((a) => a.name).join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-semibold">{price ?? m.notAvailable}</p>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={compareIds.includes(hotel.externalId)}
                          onChange={() => toggleCompare(hotel.externalId)}
                        />
                        Confronta
                      </label>
                      <Link
                        href={`/hotels/${encodeURIComponent(hotel.externalId)}`}
                        className="rounded-md border border-teal-900/30 px-3 py-2 text-xs font-semibold uppercase"
                      >
                        {m.seeHotel}
                      </Link>
                      <Link
                        href={`/book?kind=hotel&externalId=${encodeURIComponent(hotel.externalId)}`}
                        className="rounded-md bg-teal-900 px-3 py-2 text-xs font-semibold uppercase text-white"
                      >
                        {m.book}
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
