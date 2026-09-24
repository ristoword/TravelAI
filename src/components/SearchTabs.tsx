"use client";

import { type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AirportInput } from "@/components/AirportInput";
import {
  IconCar,
  IconHotel,
  IconPackage,
  IconPlane,
  btnPrimaryClass,
  cardClass,
  fieldClass,
  labelClass,
} from "@/components/ui";
import { t } from "@/lib/i18n";

type Tab = "flights" | "package" | "hotels" | "cars";

const VALID_TABS: readonly Tab[] = ["flights", "package", "hotels", "cars"];

function parseTab(value: string | null): Tab | null {
  if (!value) return null;
  return VALID_TABS.includes(value as Tab) ? (value as Tab) : null;
}

export function SearchTabs() {
  const m = t("it");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab")) ?? "flights";
  const baseId = "search-tabs";
  const airportHint = m.autocompleteNotConfigured;

  function selectTab(next: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "flights") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "flights", label: m.tabFlights, icon: <IconPlane /> },
    { id: "package", label: m.tabPackage, icon: <IconPackage /> },
    { id: "hotels", label: m.tabHotels, icon: <IconHotel /> },
    { id: "cars", label: m.tabCars, icon: <IconCar /> },
  ];

  function go(path: string, params: Record<string, string>) {
    const qs = new URLSearchParams(params);
    router.push(`${path}?${qs.toString()}`);
  }

  return (
    <section
      id="ricerca-viaggio"
      className={`${cardClass} scroll-mt-24 p-4 backdrop-blur-md sm:p-6`}
      aria-label="Ricerca viaggio"
    >
      <div
        role="tablist"
        aria-label="Tipo di ricerca"
        className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
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
              className={`tab-pill inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                selected
                  ? "bg-[var(--accent)] text-white shadow-[0_10px_24px_-12px_rgba(0,102,179,0.8)]"
                  : "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[rgba(0,102,179,0.16)]"
              }`}
              onClick={() => selectTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
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
              <p className="text-xs text-[var(--muted)]" role="note">
                {airportHint}
              </p>
            </div>
            <AirportInput
              id={`${baseId}-origin`}
              name="origin"
              label={m.from}
              labelClass={labelClass}
              fieldClass={fieldClass}
              placeholder="FCO / Roma"
              required
            />
            <AirportInput
              id={`${baseId}-dest`}
              name="destination"
              label={m.to}
              labelClass={labelClass}
              fieldClass={fieldClass}
              placeholder="LIS / Lisbona"
              required
            />
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
              <div className="flex flex-wrap gap-4 text-sm text-[var(--ink-soft)]">
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
              <button type="submit" className={`${btnPrimaryClass} w-full sm:w-auto`}>
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
            <AirportInput
              id={`${baseId}-p-origin`}
              name="origin"
              label={m.from}
              labelClass={labelClass}
              fieldClass={fieldClass}
              required
            />
            <AirportInput
              id={`${baseId}-p-dest`}
              name="destination"
              label={m.destination}
              labelClass={labelClass}
              fieldClass={fieldClass}
              required
            />
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
              <button type="submit" className={`${btnPrimaryClass} w-full sm:w-auto`}>
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
              <button type="submit" className={`${btnPrimaryClass} w-full sm:w-auto`}>
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
            <AirportInput
              id={`${baseId}-c-pick`}
              name="pickupLocation"
              label={m.pickup}
              labelClass={labelClass}
              fieldClass={fieldClass}
              required
            />
            <AirportInput
              id={`${baseId}-c-drop`}
              name="dropoffLocation"
              label={m.dropoff}
              labelClass={labelClass}
              fieldClass={fieldClass}
            />
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
              <button type="submit" className={`${btnPrimaryClass} w-full sm:w-auto`}>
                {m.searchCars}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
