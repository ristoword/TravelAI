"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ProviderEmpty,
  SearchSkeleton,
  formatMoney,
} from "@/components/SearchStates";
import { useMountedFetch } from "@/components/useMountedFetch";
import { t } from "@/lib/i18n";

type HotelDetails = {
  externalId: string;
  name: string;
  imageUrl?: string;
  images?: Array<{ url: string; alt?: string }>;
  starRating?: number;
  guestRating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  cancellationPolicy?: string;
  conditions?: string;
  amenities?: Array<{ code: string; name: string }>;
  rooms?: Array<{
    name: string;
    description?: string;
    price?: { amount: number; currency: string };
    available?: boolean;
    cancellationPolicy?: string;
  }>;
  price: { amount: number; currency: string };
};

export function HotelDetailClient({ id }: { id: string }) {
  const m = t("it");
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hotels/${encodeURIComponent(id)}`);
      const data = (await res.json()) as {
        status: string;
        message?: string;
        hotel: HotelDetails | null;
      };
      setStatus(data.status);
      setMessage(data.message ?? null);
      setHotel(data.hotel);
      setActiveImage(0);
    } catch {
      setStatus("error");
      setMessage(m.fetchError);
    } finally {
      setLoading(false);
    }
  }, [id, m.fetchError]);

  const { retry } = useMountedFetch(load, id);

  if (loading) return <SearchSkeleton label={m.searchingHotels} rows={3} />;
  if (status === "provider_not_configured") {
    return <ProviderEmpty title={m.providerNotConfigured} message={message || ""} />;
  }
  if (!hotel) {
    return (
      <ProviderEmpty
        title={m.serviceUnavailable}
        message={message || m.fetchError}
        onRetry={retry}
        retryLabel={m.retry}
      />
    );
  }

  const gallery =
    hotel.images && hotel.images.length > 0
      ? hotel.images
      : hotel.imageUrl
        ? [{ url: hotel.imageUrl, alt: hotel.name }]
        : [];

  const hasCoords =
    typeof hotel.latitude === "number" && typeof hotel.longitude === "number";

  return (
    <article>
      <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--accent-soft)]">
        {gallery[activeImage] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gallery[activeImage].url}
            alt={gallery[activeImage].alt || hotel.name}
            className="max-h-[420px] w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-[var(--muted)]">
            {m.imageUnavailable}
          </div>
        )}
        {gallery.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl bg-black/45 px-3 py-2 text-sm text-white"
              onClick={() =>
                setActiveImage((i) => (i - 1 + gallery.length) % gallery.length)
              }
              aria-label="Foto precedente"
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-black/45 px-3 py-2 text-sm text-white"
              onClick={() => setActiveImage((i) => (i + 1) % gallery.length)}
              aria-label="Foto successiva"
            >
              ›
            </button>
          </>
        )}
        {gallery.length > 0 && (
          <button
            type="button"
            className="absolute bottom-3 right-3 rounded-xl bg-black/50 px-3 py-1.5 text-xs text-white"
            onClick={() => setFullscreen(true)}
          >
            Gallery
          </button>
        )}
      </div>

      {gallery.length > 1 && (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          role="listbox"
          aria-label="Miniature galleria"
        >
          {gallery.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              role="option"
              aria-selected={i === activeImage}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border transition ${
                i === activeImage
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
              onClick={() => setActiveImage(i)}
              aria-label={`Foto ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || `${hotel.name} ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {fullscreen && gallery.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/92 p-4"
          role="dialog"
          aria-modal
          aria-label="Gallery fullscreen"
        >
          <button
            type="button"
            className="mb-3 self-end rounded-xl bg-white/15 px-4 py-2 text-sm text-white"
            onClick={() => setFullscreen(false)}
          >
            Chiudi
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[activeImage].url}
            alt={gallery[activeImage].alt || hotel.name}
            className="mx-auto max-h-[80vh] object-contain"
          />
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              className="rounded-xl bg-white/20 px-4 py-2 text-white"
              onClick={() =>
                setActiveImage((i) => (i - 1 + gallery.length) % gallery.length)
              }
            >
              Prec
            </button>
            <span className="self-center text-sm text-white/80">
              {activeImage + 1} / {gallery.length}
            </span>
            <button
              type="button"
              className="rounded-xl bg-white/20 px-4 py-2 text-white"
              onClick={() => setActiveImage((i) => (i + 1) % gallery.length)}
            >
              Succ
            </button>
          </div>
        </div>
      )}

      <header className="mt-6">
        <h1 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
          {hotel.name}
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {hotel.starRating != null ? `${hotel.starRating}★` : m.notAvailable}
          {hotel.guestRating != null ? ` · ${hotel.guestRating}` : ""}
          {hotel.reviewCount != null ? ` · ${hotel.reviewCount} recensioni` : ""}
        </p>
        <p className="text-sm text-[var(--ink-soft)]">
          {hotel.address || hotel.city || m.notAvailable}
        </p>
      </header>

      {hotel.description && (
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--ink-soft)]">
          {hotel.description}
        </p>
      )}

      {hotel.amenities && hotel.amenities.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {hotel.amenities.map((a) => (
            <li
              key={a.code}
              className="rounded-xl bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--accent)]"
            >
              {a.name}
            </li>
          ))}
        </ul>
      )}

      <section className="mt-6">
        <h2 className="font-display text-xl text-[var(--ink)]">Camere</h2>
        {!hotel.rooms || hotel.rooms.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{m.notAvailable}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {hotel.rooms.map((room, idx) => (
              <li
                key={`${room.name}-${idx}`}
                className="rounded-2xl border border-[var(--line)] bg-white/80 p-4"
              >
                <p className="font-medium text-[var(--ink)]">{room.name}</p>
                {room.description && (
                  <p className="text-sm text-[var(--ink-soft)]">{room.description}</p>
                )}
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {room.price
                    ? formatMoney(room.price.amount, room.price.currency)
                    : m.notAvailable}
                  {room.available == null
                    ? ""
                    : room.available
                      ? " · Disponibile"
                      : " · Non disponibile"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl text-[var(--ink)]">Posizione</h2>
        {hasCoords ? (
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Coordinate provider: {hotel.latitude}, {hotel.longitude}
            <span className="mt-1 block text-xs text-[var(--muted)]">
              Marker mostrato solo con coordinate reali del provider (nessuna stima).
            </span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Mappa non disponibile: coordinate assenti dal provider.
          </p>
        )}
      </section>

      <section className="mt-6 space-y-1 text-sm text-[var(--ink-soft)]">
        <p>Cancellazione: {hotel.cancellationPolicy || m.notAvailable}</p>
        <p>Condizioni: {hotel.conditions || m.notAvailable}</p>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/90 p-5 shadow-[0_18px_50px_-28px_rgba(15,45,55,0.35)]">
        <p className="text-2xl font-semibold text-[var(--ink)]">
          {formatMoney(hotel.price.amount, hotel.price.currency) ?? m.notAvailable}
        </p>
        <Link
          href={`/book?kind=hotel&externalId=${encodeURIComponent(hotel.externalId)}`}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          {m.book}
        </Link>
      </div>
    </article>
  );
}
