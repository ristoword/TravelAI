/** Marketing illustration only — not an issued payment product. */

type Variant = "midnight" | "gold" | "silver";

const VARIANT_STYLES: Record<
  Variant,
  { face: string; ink: string; muted: string; chip: string; accent: string }
> = {
  midnight: {
    face: "bg-[linear-gradient(145deg,#0a1f3d_0%,#123a6b_42%,#0d284f_100%)]",
    ink: "text-white",
    muted: "text-white/70",
    chip: "from-[#d4af37] via-[#f0e0a0] to-[#b8860b]",
    accent: "opacity-40",
  },
  gold: {
    face: "bg-[linear-gradient(145deg,#c9a227_0%,#e8c547_45%,#a67c1a_100%)]",
    ink: "text-[#1a1205]",
    muted: "text-[#1a1205]/70",
    chip: "from-[#8a7010] via-[#f5e6a3] to-[#6b5510]",
    accent: "opacity-35",
  },
  silver: {
    face: "bg-[linear-gradient(145deg,#c8d0d8_0%,#eef2f5_48%,#9aa5b0_100%)]",
    ink: "text-[#1a2430]",
    muted: "text-[#1a2430]/65",
    chip: "from-[#8a929a] via-[#f4f6f8] to-[#6a727a]",
    accent: "opacity-30",
  },
};

function PlaneMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M4.5 17.2 27 8.8l-1.1 3.4-8.2 2.1 1.4 6.2-2.6.7-2.1-5.4-5.8 1.5-.3-2.1 2.8-.7-2.6-1.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ContactlessIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 8.2c1.6 1.5 1.6 6.1 0 7.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11 6c2.6 2.4 2.6 9.6 0 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 3.8c3.6 3.4 3.6 13 0 16.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmvChip({ gradient }: { gradient: string }) {
  return (
    <div
      className={`relative h-8 w-11 overflow-hidden rounded-[5px] bg-gradient-to-br ${gradient} shadow-inner sm:h-9 sm:w-12`}
      aria-hidden
    >
      <div className="absolute inset-[3px] grid grid-cols-3 grid-rows-2 gap-px rounded-[3px] border border-black/20">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="bg-black/10" />
        ))}
      </div>
      <div className="absolute inset-y-[28%] left-0 right-0 border-y border-black/15" />
      <div className="absolute inset-x-[38%] top-0 bottom-0 border-x border-black/15" />
    </div>
  );
}

function TravelCard({
  variant,
  className = "",
  showDetails = false,
}: {
  variant: Variant;
  className?: string;
  showDetails?: boolean;
}) {
  const s = VARIANT_STYLES[variant];

  return (
    <div
      className={`travelai-card relative aspect-[1.586/1] w-[min(100%,220px)] overflow-hidden rounded-2xl border border-white/20 p-3.5 shadow-[0_28px_50px_-24px_rgba(8,24,48,0.85)] sm:w-[min(100%,280px)] sm:p-4 md:w-[300px] md:p-5 ${s.face} ${s.ink} ${className}`}
      aria-hidden={!showDetails}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl ${s.accent}`}
      />
      <div
        className={`pointer-events-none absolute -bottom-12 left-6 h-36 w-36 rounded-full bg-black/10 blur-2xl ${s.accent}`}
      />

      {variant === "midnight" && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
          viewBox="0 0 320 202"
          fill="none"
          aria-hidden
        >
          <circle cx="220" cy="110" r="70" stroke="white" strokeWidth="0.6" />
          <circle cx="220" cy="110" r="48" stroke="white" strokeWidth="0.5" />
          <path d="M40 130c60-40 120-55 200-40" stroke="white" strokeWidth="0.8" opacity="0.7" />
          <path d="M150 95l55-18 4 8-40 22z" fill="white" opacity="0.55" />
        </svg>
      )}
      {variant === "gold" && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
          viewBox="0 0 320 202"
          fill="none"
          aria-hidden
        >
          <path d="M210 150V70l18 35 18-35v80" stroke="#1a1205" strokeWidth="1.2" />
          <path d="M40 160c20-30 40-40 55-20 10 14 28 10 40-5" stroke="#1a1205" strokeWidth="1" />
        </svg>
      )}
      {variant === "silver" && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
          viewBox="0 0 320 202"
          fill="none"
          aria-hidden
        >
          <path
            d="M30 170c25-45 45-55 60-25 12 22 35 18 50-10 8-15 22-20 35-8"
            stroke="#1a2430"
            strokeWidth="1.1"
          />
          <path d="M250 155c8-35 22-50 38-55" stroke="#1a2430" strokeWidth="1" />
        </svg>
      )}

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-1.5">
            <PlaneMark className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm font-bold tracking-tight sm:text-base">TravelAI</span>
          </div>
          <ContactlessIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${s.muted}`} />
        </div>

        <div className="mt-3">
          <EmvChip gradient={s.chip} />
        </div>

        {showDetails ? (
          <div className="mt-auto space-y-1.5 pt-3">
            <p
              className={`font-mono text-[13px] tracking-[0.18em] sm:text-sm ${s.muted}`}
              title="Maschera grafica fittizia — non un numero di carta reale"
            >
              •••• •••• •••• 4821
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-xs">
              Paolo Basile
            </p>
          </div>
        ) : (
          <div className="mt-auto pt-6" />
        )}
      </div>
    </div>
  );
}

export function TravelAiCards({ className = "" }: { className?: string }) {
  return (
    <div
      className={`travelai-card-stack relative mx-auto h-[168px] w-full max-w-[280px] sm:h-[220px] sm:max-w-[340px] md:h-[260px] md:max-w-[380px] ${className}`}
      role="img"
      aria-label="Illustrazione marketing di tre carte TravelAI stilizzate. Non è un prodotto di pagamento emesso."
    >
      <TravelCard
        variant="silver"
        className="absolute left-[8%] top-[6%] z-[1] -rotate-[14deg] scale-[0.92] sm:left-[4%]"
      />
      <TravelCard
        variant="gold"
        className="absolute left-[16%] top-[14%] z-[2] -rotate-[6deg] scale-[0.96] sm:left-[14%]"
      />
      <TravelCard
        variant="midnight"
        showDetails
        className="absolute left-[22%] top-[22%] z-[3] rotate-[4deg] sm:left-[24%]"
      />
    </div>
  );
}
