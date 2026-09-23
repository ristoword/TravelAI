"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ProviderEmpty, SearchSkeleton, formatMoney } from "@/components/SearchStates";
import { useMountedFetch } from "@/components/useMountedFetch";
import { btnGhostClass, cardClass } from "@/components/ui";
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
    return <SearchSkeleton label="Caricamento confronto…" rows={3} />;
  }

  if (rows.length === 0) {
    return (
      <ProviderEmpty
        title={m.providerNotConfigured}
        message={
          message ||
          "Nessun dato provider disponibile per il confronto. Nessuna offerta inventata."
        }
      />
    );
  }

  const columns = [
    { key: "starRating", label: "Stelle" },
    { key: "guestRating", label: "Rating ospiti" },
    { key: "reviewCount", label: "Recensioni" },
    { key: "distanceKm", label: "Distanza (km)" },
    { key: "price", label: "Prezzo" },
  ] as const;

  return (
    <div>
      {message && (
        <p
          className="mb-4 rounded-xl border border-amber-700/25 bg-[var(--warn-bg)] px-4 py-3 text-sm text-[var(--warn-ink)]"
          role="status"
        >
          {message}
        </p>
      )}
      <div className="flex gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rows.map((row, i) => {
          const price = row.price as { amount?: number; currency?: string } | undefined;
          const amenities = row.amenities as Array<{ name?: string }> | undefined;
          return (
            <article
              key={String(row.externalId ?? i)}
              className={`${cardClass} w-[min(100%,280px)] shrink-0 overflow-hidden`}
            >
              <div className="flex h-36 items-center justify-center bg-[var(--accent-soft)]">
                {typeof row.imageUrl === "string" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.imageUrl}
                    alt={field(row, "name", "Hotel")}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="px-3 text-center text-xs text-[var(--muted)]">
                    {m.imageUnavailable}
                  </span>
                )}
              </div>
              <div className="space-y-2 p-4">
                <h2 className="font-display text-lg text-[var(--ink)]">
                  {field(row, "name", m.notAvailable)}
                </h2>
                {columns.map((col) => {
                  let value = m.notAvailable;
                  if (col.key === "price") {
                    value =
                      formatMoney(price?.amount, price?.currency) ?? m.notAvailable;
                  } else if (row[col.key] != null && row[col.key] !== "") {
                    value = String(row[col.key]);
                  }
                  return (
                    <p key={col.key} className="flex justify-between gap-3 text-sm">
                      <span className="text-[var(--muted)]">{col.label}</span>
                      <span className="font-medium text-[var(--ink)]">{value}</span>
                    </p>
                  );
                })}
                <p className="text-xs text-[var(--muted)]">
                  Servizi:{" "}
                  {amenities && amenities.length > 0
                    ? amenities.map((a) => a.name).filter(Boolean).join(", ")
                    : m.notAvailable}
                </p>
                {typeof row.externalId === "string" ? (
                  <Link
                    href={`/hotels/${encodeURIComponent(row.externalId)}`}
                    className={`${btnGhostClass} mt-2 w-full text-xs`}
                  >
                    Vedi offerta
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
