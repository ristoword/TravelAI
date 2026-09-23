"use client";

type Props = {
  label: string;
  rows?: number;
};

export function SearchSkeleton({ label, rows = 4 }: Props) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <p className="text-sm font-medium text-teal-900">{label}</p>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl bg-teal-900/10"
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
    <div
      className="rounded-xl border border-teal-900/15 bg-white/70 px-5 py-8 text-center"
      role="status"
    >
      <h2 className="font-display text-xl text-teal-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-stone-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-teal-900/30 px-4 py-2 text-sm font-medium text-teal-950 hover:bg-teal-900/5"
        >
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
