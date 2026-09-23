"use client";

import { useEffect, useId, useRef, useState } from "react";

type Suggestion = {
  iata: string;
  name: string;
  city?: string;
  country?: string;
};

type Props = {
  id: string;
  name: string;
  label: string;
  labelClass: string;
  fieldClass: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
};

/**
 * Airport field with OurAirports-backed autocomplete via /api/airports/autocomplete.
 * On download failure shows "servizio non disponibile" — never invents airports.
 */
export function AirportInput({
  id,
  name,
  label,
  labelClass,
  fieldClass,
  placeholder,
  required,
  defaultValue,
}: Props) {
  const listId = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = value.trim();
    const timer = window.setTimeout(() => {
      void (async () => {
        if (q.length < 2) {
          setSuggestions([]);
          setHint(null);
          setOpen(false);
          return;
        }

        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        try {
          const res = await fetch(
            `/api/airports/autocomplete?q=${encodeURIComponent(q)}`,
            { signal: ac.signal },
          );
          const json = (await res.json()) as {
            status?: string;
            message?: string;
            suggestions?: Suggestion[];
          };
          if (json.status === "ok" && Array.isArray(json.suggestions)) {
            setSuggestions(json.suggestions);
            setHint(null);
            setOpen(true);
          } else {
            setSuggestions([]);
            setHint(
              json.message ||
                "Autocomplete aeroporti: servizio non disponibile.",
            );
            setOpen(false);
          }
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          setSuggestions([]);
          setHint("Autocomplete aeroporti: servizio non disponibile.");
          setOpen(false);
        }
      })();
    }, 280);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [value]);

  return (
    <div className="relative">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        autoComplete="off"
        className={fieldClass}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
        }}
        aria-autocomplete="list"
        aria-controls={listId}
      />
      {hint ? (
        <p className="mt-1 text-xs text-amber-800" role="status">
          {hint}
        </p>
      ) : null}
      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-teal-900/15 bg-white py-1 text-sm shadow-lg"
        >
          {suggestions.map((s) => {
            const labelText = [s.iata, s.name, s.city, s.country]
              .filter(Boolean)
              .join(" — ");
            return (
              <li key={`${s.iata}-${s.name}`}>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-stone-800 hover:bg-teal-900/5"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setValue(s.iata);
                    setSuggestions([]);
                    setOpen(false);
                  }}
                >
                  {labelText}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
