"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ProviderEmpty,
  SearchSkeleton,
  formatMoney,
} from "@/components/SearchStates";
import { useMountedFetch } from "@/components/useMountedFetch";
import { btnPrimaryClass, cardClass, fieldClass } from "@/components/ui";
import { t } from "@/lib/i18n";

type CarOffer = {
  externalId: string;
  vendorName?: string;
  vehicleName?: string;
  category?: string;
  transmission?: string;
  seats?: number;
  bags?: number;
  fuelType?: string;
  imageUrl?: string;
  price: { amount: number; currency: string };
};

type Props = {
  pickupLocation: string;
  dropoffLocation?: string;
  pickupAt: string;
  dropoffAt: string;
  driverAge?: number;
};

export function CarResultsClient(props: Props) {
  const m = t("it");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [offers, setOffers] = useState<CarOffer[]>([]);
  const [retryable, setRetryable] = useState(false);
  const [category, setCategory] = useState("");
  const [transmission, setTransmission] = useState("");

  const depsKey = [
    props.pickupLocation,
    props.dropoffLocation ?? "",
    props.pickupAt,
    props.dropoffAt,
    props.driverAge ?? "",
  ].join("|");

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search/cars", {
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
        offers?: CarOffer[];
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
      if (category && o.category !== category) return false;
      if (transmission && o.transmission !== transmission) return false;
      return true;
    });
  }, [offers, category, transmission]);

  if (loading) return <SearchSkeleton label={m.searchingCars} />;
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
      <ProviderEmpty title={m.providerNotConfigured} message={message || m.homeCtaHonest} />
    );
  }
  if (offers.length === 0) {
    return (
      <ProviderEmpty
        title="Nessuna auto"
        message={message || "Nessuna offerta restituita dal provider."}
        onRetry={retryable ? retry : undefined}
        retryLabel={m.retry}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className={`${cardClass} space-y-3 p-4 text-sm`}>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
            Categoria
          </span>
          <input
            className={fieldClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Da risultati provider"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
            Cambio
          </span>
          <input
            className={fieldClass}
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
          />
        </label>
        <p className="text-xs text-[var(--muted)]">
          Filtri solo sui risultati reali del provider.
        </p>
      </aside>
      <ul className="space-y-3">
        {filtered.map((car) => {
          const price = formatMoney(car.price.amount, car.price.currency);
          return (
            <li
              key={car.externalId}
              className={`offer-card grid gap-3 ${cardClass} p-4 md:grid-cols-[160px_1fr_auto]`}
            >
              <div className="flex min-h-24 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                {car.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={car.imageUrl}
                    alt={car.vehicleName || "Auto"}
                    className="max-h-28 object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs text-[var(--muted)]">{m.imageUnavailable}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-[var(--ink)]">
                  {car.vehicleName || m.notAvailable}
                </p>
                <p className="text-sm text-[var(--ink-soft)]">
                  {car.vendorName || m.notAvailable}
                  {car.category ? ` · ${car.category}` : ""}
                  {car.transmission ? ` · ${car.transmission}` : ""}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Posti: {car.seats ?? m.notAvailable} · Bagagli:{" "}
                  {car.bags ?? m.notAvailable} · Carburante:{" "}
                  {car.fuelType ?? m.notAvailable}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-[var(--ink)]">
                  {price ?? m.notAvailable}
                </p>
                <Link
                  href={`/book?kind=car&externalId=${encodeURIComponent(car.externalId)}`}
                  className={`${btnPrimaryClass} mt-3 !px-4 !py-2 text-xs`}
                >
                  {m.select}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
