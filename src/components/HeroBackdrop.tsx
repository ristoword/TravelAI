/** Original CSS/SVG sky scene — not a stock destination photo. */
export function HeroBackdrop() {
  return (
    <div className="hero-sky absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#1a3a6e_0%,#2a5f9e_28%,#6b8fc4_52%,#e8a06a_78%,#f0c48a_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_20%,rgba(255,200,120,0.45),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_15%_30%,rgba(120,180,255,0.25),transparent_55%)]" />

      <svg
        className="absolute inset-x-0 bottom-0 h-[55%] w-full"
        viewBox="0 0 1440 520"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <path
          d="M0 320c120-40 220-90 340-70 140 24 200 110 340 100 160-12 220-100 380-90 140 8 220 70 380 50v210H0V320Z"
          fill="rgba(12,40,70,0.35)"
        />
        <path
          d="M0 360c100-30 180-70 280-55 130 20 190 85 320 78 150-8 210-78 360-70 130 7 200 55 340 40 80-8 100 20 140 35v132H0V360Z"
          fill="rgba(8,28,52,0.55)"
        />
        <path
          d="M720 220c8-40 28-70 52-70 18 0 28 18 34 42 4-22 14-38 30-38 26 0 48 48 56 98H720Z"
          fill="rgba(255,255,255,0.88)"
        />
        <path
          d="M780 252c4-22 16-38 32-38 22 0 40 36 46 78h-78c2-16 6-28 0-40Z"
          fill="rgba(240,250,255,0.92)"
        />
        <ellipse cx="768" cy="178" rx="18" ry="10" fill="#4a90c8" opacity="0.85" />
        <ellipse cx="820" cy="198" rx="14" ry="8" fill="#4a90c8" opacity="0.75" />
        <path
          d="M0 430h1440v90H0Z"
          fill="url(#heroWater)"
        />
        <defs>
          <linearGradient id="heroWater" x1="0" y1="430" x2="0" y2="520">
            <stop stopColor="#1e4a7a" />
            <stop offset="1" stopColor="#0d2a4a" />
          </linearGradient>
        </defs>
        <path
          d="M0 440c180 12 360-8 540 6 180 14 360 4 540-6 120-6 240 8 360 18v62H0V440Z"
          fill="rgba(255,255,255,0.06)"
        />
      </svg>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,24,48,0.55)_0%,rgba(8,24,48,0.25)_45%,rgba(8,24,48,0.15)_100%)]" />
    </div>
  );
}
