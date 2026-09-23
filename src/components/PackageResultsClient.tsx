"use client";

import { useCallback, useState } from "react";
import {
  ProviderEmpty,
  SearchSkeleton,
  formatMoney,
} from "@/components/SearchStates";
import { useMountedFetch } from "@/components/useMountedFetch";
import { t } from "@/lib/i18n";

type Money = { amount: number; currency: string };

type FlightOffer = {
  externalId: string;
  airline?: string;
  flightNumber?: string;
  price: Money;
};

type HotelOffer = {
  externalId: string;
  name: string;
  price: Money;
};

type Props = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  adults: number;
  rooms: number;
  cabinClass?: string;
  hotelPreferences?: string;
};

export function PackageResultsClient(props: Props) {
  const m = t("it");
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<{
    flight: {
      configured: boolean;
      status: string;
      message?: string;
      offers: FlightOffer[];
      selected: FlightOffer | null;
    };
    hotel: {
      configured: boolean;
      status: string;
      message?: string;
      offers: HotelOffer[];
      selected: HotelOffer | null;
    };
    total: Money | null;
    totalNote?: string;
  } | null>(null);
  const [flightIdx, setFlightIdx] = useState(0);
  const [hotelIdx, setHotelIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const depsKey = [
    props.origin,
    props.destination,
    props.departDate,
    props.returnDate,
    props.adults,
    props.rooms,
    props.cabinClass ?? "",
    props.hotelPreferences ?? "",
  ].join("|");

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      if (!res.ok) {
        setError(m.fetchError);
        return;
      }
      const data = await res.json();
      setPayload(data);
      setFlightIdx(0);
      setHotelIdx(0);
    } catch {
      setError(m.fetchError);
    } finally {
      setLoading(false);
    }
  }, [props, m.fetchError]);

  const { retry } = useMountedFetch(search, depsKey);

  if (loading) {
    return (
      <div className="space-y-4">
        <SearchSkeleton label={m.searchingFlights} rows={2} />
        <SearchSkeleton label={m.searchingHotels} rows={2} />
      </div>
    );
  }

  if (error || !payload) {
    return (
      <ProviderEmpty
        title={m.serviceUnavailable}
        message={error || m.fetchError}
        onRetry={retry}
        retryLabel={m.retry}
      />
    );
  }

  const selectedFlight = payload.flight.offers[flightIdx] ?? payload.flight.selected;
  const selectedHotel = payload.hotel.offers[hotelIdx] ?? payload.hotel.selected;

  let total: Money | null = null;
  if (selectedFlight?.price && selectedHotel?.price) {
    if (selectedFlight.price.currency === selectedHotel.price.currency) {
      total = {
        amount: selectedFlight.price.amount + selectedHotel.price.amount,
        currency: selectedFlight.price.currency,
      };
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-teal-900/10 bg-white/80 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl text-teal-950">Volo</h2>
          {payload.flight.offers.length > 1 && (
            <button
              type="button"
              className="text-sm underline"
              onClick={() =>
                setFlightIdx((i) => (i + 1) % payload.flight.offers.length)
              }
            >
              {m.changeFlight}
            </button>
          )}
        </div>
        {!payload.flight.configured ? (
          <p className="text-sm text-amber-900">
            {m.providerNotConfigured}: {payload.flight.message}
          </p>
        ) : selectedFlight ? (
          <p className="text-sm">
            {selectedFlight.airline || m.notAvailable}
            {selectedFlight.flightNumber ? ` · ${selectedFlight.flightNumber}` : ""}{" "}
            —{" "}
            {formatMoney(selectedFlight.price.amount, selectedFlight.price.currency) ??
              m.notAvailable}
          </p>
        ) : (
          <p className="text-sm text-stone-600">
            {payload.flight.message || "Nessun volo dal provider."}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-teal-900/10 bg-white/80 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl text-teal-950">Hotel</h2>
          {payload.hotel.offers.length > 1 && (
            <button
              type="button"
              className="text-sm underline"
              onClick={() =>
                setHotelIdx((i) => (i + 1) % payload.hotel.offers.length)
              }
            >
              {m.changeHotel}
            </button>
          )}
        </div>
        {!payload.hotel.configured ? (
          <p className="text-sm text-amber-900">
            {m.providerNotConfigured}: {payload.hotel.message}
          </p>
        ) : selectedHotel ? (
          <p className="text-sm">
            {selectedHotel.name} —{" "}
            {formatMoney(selectedHotel.price.amount, selectedHotel.price.currency) ??
              m.notAvailable}
          </p>
        ) : (
          <p className="text-sm text-stone-600">
            {payload.hotel.message || "Nessun hotel dal provider."}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-teal-900/15 bg-teal-900/5 p-4">
        <h2 className="font-display text-xl text-teal-950">{m.total}</h2>
        <p className="mt-1 text-2xl font-semibold">
          {total
            ? formatMoney(total.amount, total.currency)
            : "Totale non disponibile"}
        </p>
        <p className="mt-1 text-xs text-stone-600">
          {payload.totalNote ||
            "Il totale è la somma solo se entrambi i prezzi arrivano dal provider."}
        </p>
      </section>
    </div>
  );
}
