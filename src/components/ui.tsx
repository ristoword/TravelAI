import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Shared premium OTA surface classes — no fake data, visual only. */
export const fieldClass =
  "min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 text-sm text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] placeholder:text-[var(--muted)] transition focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25";

export const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)]";

export const cardClass =
  "rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_50px_-28px_rgba(15,45,55,0.45)]";

export const btnPrimaryClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[var(--accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhostClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white/80 px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

export function IconPlane({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10.5 19.5 9 22l-1.5-1 2-4.5L3 14l.5-1.5L9 14l2-6.5L5.5 5 6 3.5 12.5 6 15 2l1.5 1-1.5 4.5L21 10l-.5 1.5L15 10l-2 6.5L19 19l-.5 1.5-6-2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconHotel({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 20V8.5A1.5 1.5 0 0 1 4.5 7H9V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7h4.5A1.5 1.5 0 0 1 21 8.5V20H3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M8 20v-4h8v4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 11h2M11 11h2M15 11h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconPackage({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M12 12v8M4 8.5l8 3.5 8-3.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconCar({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14.5 5.5 9.2A2 2 0 0 1 7.4 8h9.2a2 2 0 0 1 1.9 1.2L20 14.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M4 14.5h16v2.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 17V14.5Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="17.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="17.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconSpark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5 13.2 8.8 18.5 10 13.2 11.2 12 16.5 10.8 11.2 5.5 10 10.8 8.8 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M18 14.5 18.6 16.4 20.5 17 18.6 17.6 18 19.5 17.4 17.6 15.5 17 17.4 16.4 18 14.5Z" fill="currentColor" />
    </svg>
  );
}

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 py-8 sm:px-10 ${className}`}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${btnPrimaryClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}
