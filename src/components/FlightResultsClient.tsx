"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ProviderEmpty,
  SearchSkeleton,
  formatMoney,
} from "@/components/SearchStates";
import { useMountedFetch } from "@/components/useMountedFetch";
import { btnGhostClass, btnPrimaryClass, cardClass, fieldClass } from "@/components/ui";
import { t } from "@/lib/i18n";

type FlightOffer = {
  externalId: string;
  airline?: string;
  airlineLogoUrl?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departAt?: string;
  arriveAt?: string;
  durationMinutes?: number;
  stops?: number;
  baggage?: string;
  conditions?: string;
  price: { amount: number; currency: string };
};

type Props = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  cabinClass?: string;
  baggage?: string;
  tripType?: string;
};

export function FlightResultsClient(props: Props) {
  const m = t("it");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [retryable, setRetryable] = useState(false);
  const [sort, setSort] = useState<"priceAsc" | "priceDesc" | "duration">("priceAsc");
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const depsKey = [
    props.origin,
    props.destination,
    props.departDate,
    props.returnDate ?? "",
    props.adults,
    props.cabinClass ?? "",
    props.baggage ?? "",
    props.tripType ?? "",
  ].join("|");

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: props.origin,
          destination: props.destination,
          departDate: props.departDate,
          returnDate: props.returnDate || undefined,
          adults: props.adults,
          cabinClass: props.cabinClass,
          baggage: props.baggage,
          tripType: props.tripType || "roundtrip",
        }),
      });
      if (!res.ok) {
        setError(m.fetchError);
        setRetryable(true);
        setOffers([]);
        return;
      }
      const data = (await res.json()) as {
        status: string;
        message?: string;
        offers?: FlightOffer[];
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
    let list = [...offers];
    if (maxStops != null) {
      list = list.filter((o) => (o.stops ?? 0) <= maxStops);
    }
    list.sort((a, b) => {
      if (sort === "priceAsc") return a.price.amount - b.price.amount;
      if (sort === "priceDesc") return b.price.amount - a.price.amount;
      return (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0);
    });
    return list;
  }, [offers, maxStops, sort]);

  if (loading) return <SearchSkeleton label={m.searchingFlights} />;

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
      <ProviderEmpty
        title={m.providerNotConfigured}
        message={message || m.homeCtaHonest}
      />
    );
  }

  if (offers.length === 0) {
    return (
      <ProviderEmpty
        title="Nessun risultato"
        message={message || "Nessuna offerta restituita dal provider."}
        onRetry={retryable ? retry : undefined}
        retryLabel={m.retry}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block" aria-label={m.filters}>
        <Filters
          sort={sort}
          setSort={setSort}
          maxStops={maxStops}
          setMaxStops={setMaxStops}
          labels={m}
        />
      </aside>

      <div>
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            type="button"
            className={btnGhostClass}
            onClick={() => setFiltersOpen(true)}
            aria-haspopup="dialog"
          >
            {m.filters}
          </button>
          <p className="text-xs text-[var(--muted)]">{filtered.length} risultati</p>
        </div>

        {filtersOpen && (
          <div
            className="fixed inset-0 z-40 flex items-end bg-black/45 p-0 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={m.filters}
            onClick={() => setFiltersOpen(false)}
          >
            <div
              className="bottom-sheet animate-sheet max-h-[80vh] w-full overflow-auto bg-[var(--bg-b)] p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl">{m.filters}</h2>
                <button type="button" className={btnGhostClass} onClick={() => setFiltersOpen(false)}>
                  Chiudi
                </button>
              </div>
              <Filters
                sort={sort}
                setSort={setSort}
                maxStops={maxStops}
                setMaxStops={setMaxStops}
                labels={m}
              />
            </div>
          </div>
        )}

        <ul className="space-y-3">
          {filtered.map((offer) => {
            const price = formatMoney(offer.price.amount, offer.price.currency);
            return (
              <li key={offer.externalId} className={`offer-card ${cardClass} p-4 sm:p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {offer.airlineLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={offer.airlineLogoUrl}
                        alt={offer.airline ? `Logo ${offer.airline}` : "Logo compagnia"}
                        className="h-10 w-10 rounded-lg object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]"
                        aria-hidden
                      >
                        {(offer.airline || "?").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-[var(--ink)]">
                        {offer.airline || m.notAvailable}
                        {offer.flightNumber ? ` · ${offer.flightNumber}` : ""}
                      </p>
                      <p className="text-sm text-[var(--ink-soft)]">
                        {offer.origin || "?"} → {offer.destination || "?"}
                      </p>
                      <p className="text-sm text-[var(--ink-soft)]">
                        {offer.departAt || m.notAvailable}
                        {offer.arriveAt ? ` – ${offer.arriveAt}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Durata:{" "}
                        {offer.durationMinutes != null
                          ? `${offer.durationMinutes} min`
                          : m.notAvailable}{" "}
                        · Scali: {offer.stops != null ? offer.stops : m.notAvailable}
                        {offer.baggage ? ` · Bagaglio: ${offer.baggage}` : ""}
                      </p>
                      {offer.conditions && (
                        <p className="mt-1 text-xs text-[var(--muted)]">{offer.conditions}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-[var(--ink)]">
                      {price ?? m.notAvailable}
                    </p>
                    <Link
                      href={`/book?kind=flight&externalId=${encodeURIComponent(offer.externalId)}`}
                      className={`${btnPrimaryClass} mt-3 !px-4 !py-2 text-xs`}
                    >
                      {m.select}
                    </Link>
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

function Filters({
  sort,
  setSort,
  maxStops,
  setMaxStops,
  labels,
}: {
  sort: "priceAsc" | "priceDesc" | "duration";
  setSort: (v: "priceAsc" | "priceDesc" | "duration") => void;
  maxStops: number | null;
  setMaxStops: (v: number | null) => void;
  labels: ReturnType<typeof t>;
}) {
  return (
    <div className={`${cardClass} space-y-4 p-4 text-sm`}>
      <div>
        <p className="mb-2 font-medium text-[var(--ink)]">Ordina</p>
        <select
          className={fieldClass}
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as "priceAsc" | "priceDesc" | "duration")
          }
        >
          <option value="priceAsc">{labels.sortPriceAsc}</option>
          <option value="priceDesc">{labels.sortPriceDesc}</option>
          <option value="duration">{labels.sortDuration}</option>
        </select>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Nessuna etichetta &quot;Consigliato&quot;: ordinamento solo su campi provider.
        </p>
      </div>
      <div>
        <p className="mb-2 font-medium text-[var(--ink)]">Scali max</p>
        <select
          className={fieldClass}
          value={maxStops ?? ""}
          onChange={(e) =>
            setMaxStops(e.target.value === "" ? null : Number(e.target.value))
          }
        >
          <option value="">Tutti</option>
          <option value="0">Diretto</option>
          <option value="1">Max 1</option>
          <option value="2">Max 2</option>
        </select>
      </div>
    </div>
  );
}
