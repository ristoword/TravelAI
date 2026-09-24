import Link from "next/link";
import { t } from "@/lib/i18n";

type Props = {
  className?: string;
  /** Compact mark for dark hero overlays */
  tone?: "light" | "dark";
};

export function BrandLogo({ className = "", tone = "dark" }: Props) {
  const m = t("it");
  const ink = tone === "light" ? "text-white" : "text-[#0b3d6e]";
  const sub = tone === "light" ? "text-white/75" : "text-[#5a7a9a]";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${className}`}
      aria-label={m.brand}
    >
      <span
        className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-[0_8px_20px_-10px_rgba(0,102,179,0.9)]"
        aria-hidden
      >
        <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
          <path
            d="M6 18.5c6.5-1.2 12.2-3.8 17.2-8.2l1.6 1.1c-3.2 4.8-8.4 8.2-14.6 9.6L6 18.5Z"
            fill="currentColor"
            opacity="0.35"
          />
          <path
            d="M4.5 17.2 27 8.8l-1.1 3.4-8.2 2.1 1.4 6.2-2.6.7-2.1-5.4-5.8 1.5-.3-2.1 2.8-.7-2.6-1.3Z"
            fill="currentColor"
          />
          <circle cx="25.2" cy="9.4" r="1.6" fill="currentColor" opacity="0.55" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block text-lg font-bold tracking-tight sm:text-xl ${ink}`}>
          {m.brand}
        </span>
        <span className={`mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em] ${sub}`}>
          Global
        </span>
      </span>
    </Link>
  );
}
