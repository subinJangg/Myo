interface OrnateButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export function OrnateButton({ onClick, children }: OrnateButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2.5 px-6 py-2 border border-primary/70 rounded-md font-serif text-[12px] text-primary-light tracking-[2px] hover:bg-primary/10 active:scale-[0.97] transition-all"
    >
      <svg width="8" height="8" viewBox="0 0 32 32" className="text-primary">
        <polygon
          points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7"
          fill="currentColor"
        />
      </svg>
      <span>{children}</span>
      <svg width="8" height="8" viewBox="0 0 32 32" className="text-primary">
        <polygon
          points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}
