interface CategoryCardProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  summary: string;
  onClick?: () => void;
}

export function CategoryCard({ icon, eyebrow, title, summary, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="ornate-mini w-full bg-card/50 border border-primary/30 rounded-md p-4 text-left hover:border-primary/50 active:scale-[0.98] transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="text-primary mt-0.5 shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] text-primary/70 tracking-[2px] uppercase mb-1"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {eyebrow}
          </p>
          <p className="text-[14px] text-foreground font-medium font-serif leading-snug">
            {title}
          </p>
          <p className="text-[11px] text-subtext mt-1.5 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        </div>
        <span className="text-subtext/50 text-xs mt-1 shrink-0">›</span>
      </div>
    </button>
  );
}
