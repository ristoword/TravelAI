"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

type Tab = "flights" | "package" | "hotels" | "cars";

const fieldClass =
  "w-full rounded-md border border-teal-900/20 bg-white/80 px-3 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30";

const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-teal-900/70";

export function SearchTabs() {
  const m = t("it");
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("flights");
  const baseId = "search-tabs";
  const airportHint = m.autocompleteNotConfigured;

  const tabs: { id: Tab; label: string }[] = [
    { id: "flights", label: m.tabFlights },
    { id: "package", label: m.tabPackage },
    { id: "hotels", label: m.tabHotels },
    { id: "cars", label: m.tabCars },
  ];

  function go(path: string, params: Record<string, string>) {
    const qs = new URLSearchParams(params);
    router.push(`${path}?${qs.toString()}`);
  }

  return (
    <section
      className="animate-fade-up rounded-2xl border border-teal-900/10 bg-white/70 p-4 shadow-[0_20px_60px_-30px_rgba(15,61,62,0.45)] backdrop-blur-md sm:p-6"
      aria-label="Ricerca viaggio"
    >
      <div role="tablist" aria-label="Tipo di ricerca" className="mb-5 flex flex-wrap gap-2">
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              className={`rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 ${
                selected
                  ? "bg-teal-900 text-white"
                  : "bg-teal-900/5 text-teal-950 hover:bg-teal-900/10"
              }`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-${tab}`}>
        {tab === "flights" && (
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              go("/search/flights", {
                origin: String(fd.get("origin") || ""),
                destination: String(fd.get("destination") || ""),
                departDate: String(fd.get("departDate") || ""),
                returnDate: String(fd.get("returnDate") || ""),
                adults: String(fd.get("adults") || "1"),
                cabinClass: String(fd.get("cabinClass") || ""),
                baggage: String(fd.get("baggage") || ""),
                tripType: String(fd.get("tripType") || "roundtrip"),
              });
            }}
          >
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-xs text-stone-600" role="note">
                {airportHint}
              </p>
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-origin`}>
                {m.from}
              </label>
              <input
                id={`${baseId}-origin`}
                name="origin"
                required
                autoComplete="off"
                className={fieldClass}
                placeholder="FCO / Roma"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-dest`}>
                {m.to}
              </label>
              <input
                id={`${baseId}-dest`}
                name="destination"
                required
                autoComplete="off"
                className={fieldClass}
                placeholder="LIS / Lisbona"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-depart`}>
                {m.depart}
              </label>
              <input
                id={`${baseId}-depart`}
                name="departDate"
                type="date"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-return`}>
                {m.return}
              </label>
              <input
                id={`${baseId}-return`}
                name="returnDate"
                type="date"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-pax`}>
                {m.passengers}
              </label>
              <input
                id={`${baseId}-pax`}
                name="adults"
                type="number"
                min={1}
                max={9}
                defaultValue={1}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-cabin`}>
                {m.cabinClass}
              </label>
              <select id={`${baseId}-cabin`} name="cabinClass" className={fieldClass}>
                <option value="economy">Economy</option>
                <option value="premium">Premium</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-bag`}>
                {m.baggage}
              </label>
              <input
                id={`${baseId}-bag`}
                name="baggage"
                className={fieldClass}
                placeholder="Cabina / Stiva"
              />
            </div>
            <fieldset className="sm:col-span-2">
              <legend className={labelClass}>Tipo viaggio</legend>
              <div className="flex flex-wrap gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" name="tripType" value="roundtrip" defaultChecked />
                  {m.roundTrip}
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="tripType" value="oneway" />
                  {m.oneWay}
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="tripType" value="multicity" />
                  {m.multiCity}
                </label>
              </div>
            </fieldset>
            <div className="flex items-end sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="w-full rounded-md bg-teal-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 sm:w-auto"
              >
                {m.searchFlights}
              </button>
            </div>
          </form>
        )}

        {tab === "package" && (
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              go("/search/package", {
                origin: String(fd.get("origin") || ""),
                destination: String(fd.get("destination") || ""),
                departDate: String(fd.get("departDate") || ""),
                returnDate: String(fd.get("returnDate") || ""),
                adults: String(fd.get("adults") || "2"),
                rooms: String(fd.get("rooms") || "1"),
                cabinClass: String(fd.get("cabinClass") || ""),
                hotelPreferences: String(fd.get("hotelPreferences") || ""),
              });
            }}
          >
            <div>
              <label className={labelClass} htmlFor={`${baseId}-p-origin`}>
                {m.from}
              </label>
              <input id={`${baseId}-p-origin`} name="origin" required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-p-dest`}>
                {m.destination}
              </label>
              <input
                id={`${baseId}-p-dest`}
                name="destination"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-p-depart`}>
                {m.depart}
              </label>
              <input
                id={`${baseId}-p-depart`}
                name="departDate"
                type="date"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-p-return`}>
                {m.return}
              </label>
              <input
                id={`${baseId}-p-return`}
                name="returnDate"
                type="date"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-p-adults`}>
                {m.guests}
              </label>
              <input
                id={`${baseId}-p-adults`}
                name="adults"
                type="number"
                min={1}
                defaultValue={2}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-p-rooms`}>
                {m.rooms}
              </label>
              <input
                id={`${baseId}-p-rooms`}
                name="rooms"
                type="number"
                min={1}
                defaultValue={1}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-p-cabin`}>
                {m.cabinClass}
              </label>
              <select id={`${baseId}-p-cabin`} name="cabinClass" className={fieldClass}>
                <option value="economy">Economy</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor={`${baseId}-p-prefs`}>
                {m.hotelPrefs}
              </label>
              <input
                id={`${baseId}-p-prefs`}
                name="hotelPreferences"
                className={fieldClass}
                placeholder="Centro, colazione, piscina…"
              />
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="w-full rounded-md bg-teal-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white sm:w-auto"
              >
                {m.searchPackage}
              </button>
            </div>
          </form>
        )}

        {tab === "hotels" && (
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              go("/search/hotels", {
                destination: String(fd.get("destination") || ""),
                checkIn: String(fd.get("checkIn") || ""),
                checkOut: String(fd.get("checkOut") || ""),
                adults: String(fd.get("adults") || "2"),
                rooms: String(fd.get("rooms") || "1"),
              });
            }}
          >
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor={`${baseId}-h-dest`}>
                {m.destination}
              </label>
              <input
                id={`${baseId}-h-dest`}
                name="destination"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-h-in`}>
                {m.checkIn}
              </label>
              <input
                id={`${baseId}-h-in`}
                name="checkIn"
                type="date"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-h-out`}>
                {m.checkOut}
              </label>
              <input
                id={`${baseId}-h-out`}
                name="checkOut"
                type="date"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-h-guests`}>
                {m.guests}
              </label>
              <input
                id={`${baseId}-h-guests`}
                name="adults"
                type="number"
                min={1}
                defaultValue={2}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-h-rooms`}>
                {m.rooms}
              </label>
              <input
                id={`${baseId}-h-rooms`}
                name="rooms"
                type="number"
                min={1}
                defaultValue={1}
                className={fieldClass}
              />
            </div>
            <div className="flex items-end sm:col-span-2">
              <button
                type="submit"
                className="w-full rounded-md bg-teal-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white sm:w-auto"
              >
                {m.searchHotels}
              </button>
            </div>
          </form>
        )}

        {tab === "cars" && (
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const pickupDate = String(fd.get("pickupDate") || "");
              const pickupTime = String(fd.get("pickupTime") || "10:00");
              const dropoffDate = String(fd.get("dropoffDate") || "");
              const dropoffTime = String(fd.get("dropoffTime") || "10:00");
              go("/search/cars", {
                pickupLocation: String(fd.get("pickupLocation") || ""),
                dropoffLocation: String(fd.get("dropoffLocation") || ""),
                pickupAt: `${pickupDate}T${pickupTime}`,
                dropoffAt: `${dropoffDate}T${dropoffTime}`,
                driverAge: String(fd.get("driverAge") || "30"),
              });
            }}
          >
            <div>
              <label className={labelClass} htmlFor={`${baseId}-c-pick`}>
                {m.pickup}
              </label>
              <input
                id={`${baseId}-c-pick`}
                name="pickupLocation"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-c-drop`}>
                {m.dropoff}
              </label>
              <input id={`${baseId}-c-drop`} name="dropoffLocation" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-c-pd`}>
                Data ritiro
              </label>
              <input
                id={`${baseId}-c-pd`}
                name="pickupDate"
                type="date"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-c-pt`}>
                {m.pickupTime}
              </label>
              <input
                id={`${baseId}-c-pt`}
                name="pickupTime"
                type="time"
                defaultValue="10:00"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-c-dd`}>
                Data riconsegna
              </label>
              <input
                id={`${baseId}-c-dd`}
                name="dropoffDate"
                type="date"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-c-dt`}>
                {m.dropoffTime}
              </label>
              <input
                id={`${baseId}-c-dt`}
                name="dropoffTime"
                type="time"
                defaultValue="10:00"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${baseId}-c-age`}>
                {m.driverAge}
              </label>
              <input
                id={`${baseId}-c-age`}
                name="driverAge"
                type="number"
                min={18}
                defaultValue={30}
                className={fieldClass}
              />
            </div>
            <div className="flex items-end sm:col-span-2">
              <button
                type="submit"
                className="w-full rounded-md bg-teal-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white sm:w-auto"
              >
                {m.searchCars}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
