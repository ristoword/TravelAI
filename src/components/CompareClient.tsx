"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ProviderEmpty, formatMoney } from "@/components/SearchStates";
import { useMountedFetch } from "@/components/useMountedFetch";
import { t } from "@/lib/i18n";

type Row = Record<string, unknown>;

function field(row: Row, key: string, fallback: string): string {
  const v = row[key];
  if (v == null || v === "") return fallback;
  return String(v);
}

export function CompareClient({ ids }: { ids: string[] }) {
  const m = t("it");
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(ids.length >= 2);

  const depsKey = ids.join(",");

  const run = useCallback(async () => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/hotels/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: ids.map((externalId) => ({ externalId })),
        }),
      });
      const data = (await res.json()) as {
        rows?: Row[];
        message?: string;
      };
      setRows(data.rows ?? []);
      setMessage(data.message ?? null);
    } catch {
      setMessage(m.fetchError);
    } finally {
      setLoading(false);
    }
  }, [ids, m.fetchError]);

  useMountedFetch(run, depsKey);

  if (ids.length < 2) {
    return (
      <ProviderEmpty
        title="Confronto hotel"
        message="Seleziona almeno 2 hotel dai risultati di una ricerca reale per confrontarli."
      />
    );
  }

  if (loading) {
    return <p className="text-sm text-stone-600">Caricamento confronto…</p>;
  }

  const columns = [
    "name",
    "starRating",
    "guestRating",
    "reviewCount",
    "distanceKm",
    "price",
  ] as const;

  return (
    <div className="overflow-x-auto">
      {message && (
        <p className="mb-3 text-sm text-amber-900" role="status">
          {message}
        </p>
      )}
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-teal-900/10 bg-teal-900/5 p-2 text-left">
              Campo
            </th>
            {rows.map((row, i) => (
              <th
                key={String(row.externalId ?? i)}
                className="border border-teal-900/10 bg-teal-900/5 p-2 text-left"
              >
                {field(row, "name", m.notAvailable)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-teal-900/10 p-2">Foto</td>
            {rows.map((row, i) => (
              <td key={`img-${i}`} className="border border-teal-900/10 p-2">
                {typeof row.imageUrl === "string" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.imageUrl}
                    alt={field(row, "name", "Hotel")}
                    className="h-20 w-28 object-cover"
                    loading="lazy"
                  />
                ) : (
                  m.imageUnavailable
                )}
              </td>
            ))}
          </tr>
          {columns.map((col) => (
            <tr key={col}>
              <td className="border border-teal-900/10 p-2 font-medium">{col}</td>
              {rows.map((row, i) => {
                let value = m.notAvailable;
                if (col === "price") {
                  const price = row.price as
                    | { amount?: number; currency?: string }
                    | undefined;
                  value =
                    formatMoney(price?.amount, price?.currency) ?? m.notAvailable;
                } else if (row[col] != null && row[col] !== "") {
                  value = String(row[col]);
                }
                return (
                  <td key={`${col}-${i}`} className="border border-teal-900/10 p-2">
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className="border border-teal-900/10 p-2">Servizi</td>
            {rows.map((row, i) => {
              const amenities = row.amenities as
                | Array<{ name?: string }>
                | undefined;
              return (
                <td key={`am-${i}`} className="border border-teal-900/10 p-2">
                  {amenities && amenities.length > 0
                    ? amenities.map((a) => a.name).filter(Boolean).join(", ")
                    : m.notAvailable}
                </td>
              );
            })}
          </tr>
          <tr>
            <td className="border border-teal-900/10 p-2">Offerta</td>
            {rows.map((row, i) => (
              <td key={`link-${i}`} className="border border-teal-900/10 p-2">
                {typeof row.externalId === "string" ? (
                  <Link
                    href={`/hotels/${encodeURIComponent(row.externalId)}`}
                    className="underline"
                  >
                    Vedi offerta
                  </Link>
                ) : (
                  m.notAvailable
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
