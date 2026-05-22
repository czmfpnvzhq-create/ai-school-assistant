export function LandingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="landing-grid-bg absolute inset-0" />
      <div className="landing-dot-bg absolute inset-0" />
      <div
        className="absolute -left-32 top-1/4 h-[480px] w-[480px] rounded-full bg-blue-500/20 blur-[120px] animate-orb-drift"
        style={{ filter: "blur(120px)" }}
      />
      <div
        className="absolute -right-24 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-400/15 blur-[100px] animate-orb-drift"
        style={{ animationDelay: "-6s", filter: "blur(100px)" }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[320px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px] animate-glow-pulse"
        style={{ filter: "blur(100px)" }}
      />
    </div>
  );
}
