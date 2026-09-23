"use client";

import { btnGhostClass, cardClass } from "@/components/ui";

type Props = {
  label: string;
  rows?: number;
};

export function SearchSkeleton({ label, rows = 4 }: Props) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <p className="text-sm font-medium text-[var(--accent)]">{label}</p>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-pulse h-28 rounded-2xl"
          style={{ animationDelay: `${i * 80}ms` }}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function ProviderEmpty({
  title,
  message,
  onRetry,
  retryLabel,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className={`${cardClass} px-6 py-10 text-center`} role="status">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 8v5M12 15.5v.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h2 className="font-display text-2xl text-[var(--ink)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[var(--ink-soft)]">
        {message}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${btnGhostClass} mt-5`}>
          {retryLabel ?? "Riprova"}
        </button>
      )}
    </div>
  );
}

export function formatMoney(
  amount?: number | null,
  currency?: string | null,
): string | null {
  if (amount == null || !currency) return null;
  try {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
