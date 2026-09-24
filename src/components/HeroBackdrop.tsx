/** Original sunset coastal scene — generated asset, not a stock photo URL. */
export function HeroBackdrop() {
  return (
    <div className="hero-sky absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/hero-sunset.jpg)" }}
      />
      {/* Readable text overlay without flattening the scene */}
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(8,24,48,0.62)_0%,rgba(8,24,48,0.38)_42%,rgba(8,24,48,0.18)_68%,rgba(8,24,48,0.28)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,40,0.35)_0%,transparent_28%,transparent_72%,rgba(8,20,40,0.45)_100%)]" />
    </div>
  );
}
