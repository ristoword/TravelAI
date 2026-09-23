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
      <div className="relative overflow-hidden rounded-2xl bg-teal-900/10">
        {gallery[activeImage] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gallery[activeImage].url}
            alt={gallery[activeImage].alt || hotel.name}
            className="max-h-[420px] w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-stone-500">
            {m.imageUnavailable}
          </div>
        )}
        {gallery.length > 0 && (
          <button
            type="button"
            className="absolute bottom-3 right-3 rounded-md bg-black/50 px-3 py-1.5 text-xs text-white"
            onClick={() => setFullscreen(true)}
          >
            Gallery
          </button>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border ${
                i === activeImage ? "border-teal-800" : "border-transparent"
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
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          role="dialog"
          aria-modal
          aria-label="Gallery fullscreen"
        >
          <button
            type="button"
            className="mb-3 self-end text-white"
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
          <div className="mt-3 flex justify-center gap-3">
            <button
              type="button"
              className="rounded bg-white/20 px-3 py-1 text-white"
              onClick={() =>
                setActiveImage((i) => (i - 1 + gallery.length) % gallery.length)
              }
            >
              Prec
            </button>
            <button
              type="button"
              className="rounded bg-white/20 px-3 py-1 text-white"
              onClick={() => setActiveImage((i) => (i + 1) % gallery.length)}
            >
              Succ
            </button>
          </div>
        </div>
      )}

      <header className="mt-6">
        <h1 className="font-display text-3xl text-teal-950 sm:text-4xl">
          {hotel.name}
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          {hotel.starRating != null ? `${hotel.starRating}★` : m.notAvailable}
          {hotel.guestRating != null ? ` · ${hotel.guestRating}` : ""}
          {hotel.reviewCount != null ? ` · ${hotel.reviewCount} recensioni` : ""}
        </p>
        <p className="text-sm text-stone-600">
          {hotel.address || hotel.city || m.notAvailable}
        </p>
      </header>

      {hotel.description && (
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-stone-700">
          {hotel.description}
        </p>
      )}

      {hotel.amenities && hotel.amenities.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {hotel.amenities.map((a) => (
            <li
              key={a.code}
              className="rounded-md bg-teal-900/10 px-2 py-1 text-xs text-teal-950"
            >
              {a.name}
            </li>
          ))}
        </ul>
      )}

      <section className="mt-6">
        <h2 className="font-display text-xl text-teal-950">Camere</h2>
        {!hotel.rooms || hotel.rooms.length === 0 ? (
          <p className="mt-2 text-sm text-stone-600">{m.notAvailable}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {hotel.rooms.map((room, idx) => (
              <li
                key={`${room.name}-${idx}`}
                className="rounded-lg border border-teal-900/10 bg-white/70 p-3"
              >
                <p className="font-medium">{room.name}</p>
                {room.description && (
                  <p className="text-sm text-stone-600">{room.description}</p>
                )}
                <p className="text-sm">
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
        <h2 className="font-display text-xl text-teal-950">Posizione</h2>
        {hasCoords ? (
          <p className="mt-2 text-sm text-stone-600">
            Coordinate provider: {hotel.latitude}, {hotel.longitude}
            <span className="block text-xs">
              Marker mostrato solo con coordinate reali del provider (nessuna
              stima).
            </span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-stone-600">
            Mappa non disponibile: coordinate assenti dal provider.
          </p>
        )}
      </section>

      <section className="mt-6 space-y-1 text-sm text-stone-600">
        <p>Cancellazione: {hotel.cancellationPolicy || m.notAvailable}</p>
        <p>Condizioni: {hotel.conditions || m.notAvailable}</p>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-900/10 bg-white/80 p-4">
        <p className="text-2xl font-semibold text-teal-950">
          {formatMoney(hotel.price.amount, hotel.price.currency) ?? m.notAvailable}
        </p>
        <Link
          href={`/book?kind=hotel&externalId=${encodeURIComponent(hotel.externalId)}`}
          className="rounded-md bg-teal-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white"
        >
          {m.book}
        </Link>
      </div>
    </article>
  );
}
