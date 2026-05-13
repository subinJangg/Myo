const MOON_PHASES = [
  { label: "New Moon", emoji: "🌑" },
  { label: "Waxing Crescent", emoji: "🌒" },
  { label: "First Quarter", emoji: "🌓" },
  { label: "Waxing Gibbous", emoji: "🌔" },
  { label: "Full Moon", emoji: "🌕" },
  { label: "Waning Gibbous", emoji: "🌖" },
  { label: "Last Quarter", emoji: "🌗" },
  { label: "Waning Crescent", emoji: "🌘" },
];

interface MoonPhaseBarProps {
  activeIndex: number;
}

export function MoonPhaseBar({ activeIndex }: MoonPhaseBarProps) {
  const clamped = Math.max(0, Math.min(7, activeIndex));

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2.5">
        {MOON_PHASES.map((phase, i) => (
          <span
            key={i}
            className={`text-lg transition-all ${
              i === clamped
                ? "scale-125 drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]"
                : "opacity-30 grayscale"
            }`}
            title={phase.label}
          >
            {phase.emoji}
          </span>
        ))}
      </div>
      <p
        className="text-[10px] text-primary/70 mt-2 tracking-[2px] uppercase"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {MOON_PHASES[clamped].label}
      </p>
    </div>
  );
}
