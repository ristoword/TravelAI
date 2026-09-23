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
      <ProviderEmpty title={m.providerNotConfigured} message={message || ""} />
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
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-3 rounded-xl border border-teal-900/10 bg-white/70 p-4 text-sm">
        <label className="block">
          Categoria
          <input
            className="mt-1 w-full rounded-md border border-teal-900/20 px-2 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Da risultati provider"
          />
        </label>
        <label className="block">
          Cambio
          <input
            className="mt-1 w-full rounded-md border border-teal-900/20 px-2 py-2"
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
          />
        </label>
      </aside>
      <ul className="space-y-3">
        {filtered.map((car) => {
          const price = formatMoney(car.price.amount, car.price.currency);
          return (
            <li
              key={car.externalId}
              className="grid gap-3 rounded-xl border border-teal-900/10 bg-white/80 p-4 md:grid-cols-[160px_1fr_auto]"
            >
              <div className="flex min-h-24 items-center justify-center rounded-lg bg-teal-900/5">
                {car.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={car.imageUrl}
                    alt={car.vehicleName || "Auto"}
                    className="max-h-28 object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs text-stone-500">{m.imageUnavailable}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-teal-950">
                  {car.vehicleName || m.notAvailable}
                </p>
                <p className="text-sm text-stone-600">
                  {car.vendorName || m.notAvailable}
                  {car.category ? ` · ${car.category}` : ""}
                  {car.transmission ? ` · ${car.transmission}` : ""}
                </p>
                <p className="text-xs text-stone-500">
                  Posti: {car.seats ?? m.notAvailable} · Bagagli:{" "}
                  {car.bags ?? m.notAvailable} · Carburante:{" "}
                  {car.fuelType ?? m.notAvailable}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{price ?? m.notAvailable}</p>
                <Link
                  href={`/book?kind=car&externalId=${encodeURIComponent(car.externalId)}`}
                  className="mt-2 inline-block rounded-md bg-teal-900 px-3 py-2 text-xs font-semibold uppercase text-white"
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
