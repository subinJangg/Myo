import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, Check, Copy } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { FULL_DECK, interpretSingleCard } from "@/lib/tarot";
import type { TarotCard } from "@/types";
import { loadDailyTarot, saveDailyTarot } from "@/lib/store";
type Phase = "loading" | "draw" | "reveal" | "reading" | "result";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function SparkleField() {
  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      viewBox="0 0 480 800"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <g fill="#C8A96B" opacity="0.5">
        <circle cx="65" cy="90" r="1" />
        <circle cx="410" cy="130" r="0.8" />
        <circle cx="85" cy="270" r="1" />
        <circle cx="420" cy="320" r="1.1" />
        <circle cx="55" cy="500" r="0.9" />
        <circle cx="410" cy="560" r="1" />
        <polygon points="45,180 46,183 49,184 46,185 45,188 44,185 41,184 44,183" />
        <polygon points="425,400 426,403 429,404 426,405 425,408 424,405 421,404 424,403" />
      </g>
    </svg>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-2.5 my-4">
      <span className="w-14 h-[0.5px] bg-primary/40" />
      <svg className="text-primary/60" width="8" height="8" viewBox="0 0 32 32">
        <polygon
          points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7"
          fill="currentColor"
        />
      </svg>
      <span className="w-14 h-[0.5px] bg-primary/40" />
    </div>
  );
}

const SUIT_STYLES: Record<string, { bg: string; accent: string }> = {
  Wands: { bg: "#1a1510", accent: "#D4A855" },
  Cups: { bg: "#101520", accent: "#6B9BC8" },
  Swords: { bg: "#13151a", accent: "#9BAAB8" },
  Pentacles: { bg: "#111810", accent: "#6BAA7B" },
};

function getSuit(name: string): string | null {
  if (name.includes("Wands")) return "Wands";
  if (name.includes("Cups")) return "Cups";
  if (name.includes("Swords")) return "Swords";
  if (name.includes("Pentacles")) return "Pentacles";
  return null;
}

function SuitIcon({ suit, color, size = 36 }: { suit: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {suit === "Wands" && (
        <g fill={color}>
          <polygon points="16,2 19,11 13,11" />
          <rect x="14.8" y="11" width="2.4" height="17" rx="1.2" />
        </g>
      )}
      {suit === "Cups" && (
        <g fill={color}>
          <path d="M10 7H22L19.5 19H12.5Z" />
          <rect x="14.5" y="19" width="3" height="4" />
          <rect x="11.5" y="23" width="9" height="2" rx="1" />
        </g>
      )}
      {suit === "Swords" && (
        <g fill={color}>
          <polygon points="16,2 17.8,6 16.4,6 16.4,20 15.6,20 15.6,6 14.2,6" />
          <rect x="11.5" y="20" width="9" height="2" rx="1" />
          <rect x="14.2" y="22" width="3.6" height="5" rx="0.8" />
        </g>
      )}
      {suit === "Pentacles" && (
        <g>
          <circle cx="16" cy="16" r="11" fill="none" stroke={color} strokeWidth="1.2" />
          <polygon points="16,6.5 18,12.5 24.5,12.5 19.3,16.3 21.2,22.5 16,18.8 10.8,22.5 12.7,16.3 7.5,12.5 14,12.5" fill={color} />
        </g>
      )}
    </svg>
  );
}

function MinorCardFace({ card }: { card: TarotCard }) {
  const suit = getSuit(card.name);
  if (!suit) return null;
  const s = SUIT_STYLES[suit];

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{ backgroundColor: s.bg }}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ background: `radial-gradient(circle at center, ${s.accent}, transparent 70%)` }}
      />
      <div className="relative z-[1] flex flex-col items-center">
        <SuitIcon suit={suit} color={s.accent} size={40} />
        <p className="text-[16px] font-serif mt-2 tracking-[2px]" style={{ color: s.accent }}>
          {card.symbol}
        </p>
        <p
          className="text-[8px] mt-1 tracking-[2px] uppercase opacity-60"
          style={{ color: s.accent, fontFamily: "'Cinzel', serif" }}
        >
          {suit}
        </p>
      </div>
    </div>
  );
}

function ArcDecoration() {
  const rays = Array.from({ length: 35 }, (_, i) => {
    const angle = Math.PI * (0.05 + (i / 34) * 0.9);
    const r1 = 20;
    const r2 = 55 + (i % 3 === 0 ? 40 : i % 2 === 0 ? 25 : 15);
    return { x1: 160 - Math.cos(angle) * r1, y1: 165 - Math.sin(angle) * r1, x2: 160 - Math.cos(angle) * r2, y2: 165 - Math.sin(angle) * r2 };
  });
  const dots = Array.from({ length: 40 }, (_, i) => {
    const angle = Math.PI * (i / 39);
    const r = 128;
    return { cx: 160 - Math.cos(angle) * r, cy: 165 - Math.sin(angle) * r };
  });

  return (
    <svg className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-0" style={{ bottom: 120, width: 320, height: 180 }} viewBox="0 0 320 180">
      <path d="M 8 165 A 152 152 0 0 1 312 165" fill="none" stroke="#C8A96B" strokeWidth="0.5" strokeOpacity="0.18" strokeDasharray="2 6" />
      {dots.map((d, i) => <circle key={`d${i}`} cx={d.cx} cy={d.cy} r="0.5" fill="#C8A96B" fillOpacity="0.12" />)}
      {rays.map((r, i) => <line key={`r${i}`} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#C8A96B" strokeWidth="0.3" strokeOpacity="0.08" />)}
      <polygon points="160,30 161.8,36 168,37 161.8,38 160,44 158.2,38 152,37 158.2,36" fill="#C8A96B" fillOpacity="0.35" />
      <circle cx="90" cy="65" r="0.7" fill="#C8A96B" fillOpacity="0.2" />
      <circle cx="230" cy="55" r="0.5" fill="#C8A96B" fillOpacity="0.15" />
      <circle cx="60" cy="110" r="0.4" fill="#C8A96B" fillOpacity="0.12" />
      <circle cx="260" cy="100" r="0.6" fill="#C8A96B" fillOpacity="0.15" />
    </svg>
  );
}

export function TarotPage() {
  const { preferences, setView } = useAppStore();

  const [phase, setPhase] = useState<Phase>("loading");
  const [card, setCard] = useState<TarotCard | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [headline, setHeadline] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [advice, setAdvice] = useState("");
  const [readingMsg, setReadingMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const readingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const shuffledIndices = useMemo(() => {
    const arr = Array.from({ length: FULL_DECK.length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const readingMessages = [
    "카드가 당신에게 말을 걸고 있어요...",
    "고대의 지혜를 불러오는 중...",
    "카드 속 그림이 움직이기 시작했어요...",
    "숨겨진 의미를 찾고 있어요...",
    "별빛 아래 카드를 펼치는 중...",
    "카드의 에너지를 읽어내는 중...",
  ];

  useEffect(() => {
    loadDailyTarot(getToday()).then((saved) => {
      if (saved) {
        const found = FULL_DECK.find((c) => c.id === saved.cardId);
        if (found) {
          setCard(found);
          setHeadline(saved.headline);
          setInterpretation(saved.interpretation);
          setAdvice(saved.advice);
          setPhase("result");
          return;
        }
      }
      setPhase("draw");
    });
  }, []);

  useEffect(() => {
    if (phase === "reading") {
      setReadingMsg(readingMessages[Math.floor(Math.random() * readingMessages.length)]);
      readingTimer.current = setInterval(() => {
        setReadingMsg(readingMessages[Math.floor(Math.random() * readingMessages.length)]);
      }, 3000);
    } else {
      if (readingTimer.current) {
        clearInterval(readingTimer.current);
        readingTimer.current = null;
      }
    }
    return () => {
      if (readingTimer.current) clearInterval(readingTimer.current);
    };
  }, [phase]);

  const saveTarot = async (c: TarotCard, h: string, i: string, a: string) => {
    await saveDailyTarot(getToday(), {
      cardId: c.id,
      headline: h,
      interpretation: i,
      advice: a,
      drawCount: 0,
    });
  };

  const handleSelectCard = (displayIndex: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(displayIndex);

    const actualIndex = shuffledIndices[displayIndex];
    const drawn = FULL_DECK[actualIndex];
    setCard(drawn);
    setHeadline("");
    setInterpretation("");
    setAdvice("");
    setCopied(false);

    const apiPromise = interpretSingleCard(drawn, preferences.jobRole, preferences.tone);

    setTimeout(() => {
      setPhase("reveal");

      setTimeout(async () => {
        setPhase("reading");
        try {
          const resultJson = await apiPromise;
          const result = JSON.parse(resultJson);
          setHeadline(result.headline);
          setInterpretation(result.interpretation);
          setAdvice(result.advice);
          await saveTarot(drawn, result.headline, result.interpretation, result.advice);
          setPhase("result");
        } catch {
          setPhase("result");
        }
      }, 1800);
    }, 700);
  };

  const handleReset = () => {
    setPhase("draw");
    setCard(null);
    setSelectedIndex(null);
    setHeadline("");
    setInterpretation("");
    setAdvice("");
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!card) return;
    const text = `✦ 묘한 카드 — ${card.nameKo} (${card.name})

"${headline}"

${interpretation}

${advice}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (phase === "loading") return null;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="ornate-frame relative h-full">
          <SparkleField />
          <div className="relative z-[1] px-[30px] py-[22px] flex flex-col h-full">

          {/* Navbar */}
          <div className="flex items-center justify-between mt-3 mb-3">
            <button
              onClick={() => setView("home")}
              className="text-primary/60 hover:text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setView("settings")}
              className="text-primary/60 hover:text-primary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2.5">
              <span className="w-[45px] h-[1px] bg-primary/70" />
              <svg className="text-primary" width="9" height="9" viewBox="0 0 32 32">
                <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
              </svg>
              <span
                className="text-[18px] text-primary-light tracking-[3px]"
                style={{ fontFamily: "'Spectral SC', serif" }}
              >
                myo card
              </span>
              <svg className="text-primary" width="9" height="9" viewBox="0 0 32 32">
                <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
              </svg>
              <span className="w-[45px] h-[1px] bg-primary/70" />
            </div>
            <p
              className="text-[15px] text-foreground/80 mt-2 tracking-[2px]"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              묘한 카드
            </p>
          </div>

          {/* Draw phase */}
          {phase === "draw" && (
            <div className="flex-1 flex flex-col items-center overflow-hidden animate-fade-in">
              {/* Arc decoration */}
              <img
                src="/arc-decoration.png"
                alt=""
                className="pointer-events-none shrink-0 select-none opacity-80"
                style={{ width: 360, height: 185 }}
                draggable={false}
              />

              {/* Choose your card + moon divider */}
              <div className="text-center mb-3 shrink-0 -mt-10">
                <p
                  className="text-[13px] text-subtext/60 tracking-[4px] uppercase"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  choose your card
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span className="w-16 h-[1px] bg-primary/40" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#C8A96B" fillOpacity="0.7" />
                  </svg>
                  <span className="w-16 h-[1px] bg-primary/40" />
                </div>
              </div>

              {/* Card fan — angle-based hover detection */}
              <div
                className="relative w-full shrink-0 cursor-pointer"
                style={{ height: 165 }}
                onMouseMove={(e) => {
                  if (selectedIndex !== null) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mx = e.clientX - rect.left;
                  const my = e.clientY - rect.top;
                  const pivotX = rect.width / 2;
                  const pivotY = rect.height + 175;
                  const dx = mx - pivotX;
                  const dy = my - pivotY;
                  const deg = Math.atan2(dx, -dy) * (180 / Math.PI);
                  if (deg < -34 || deg > 34) { setHoveredIndex(null); return; }
                  const idx = Math.round(((deg + 28) / 56) * 21);
                  setHoveredIndex(Math.max(0, Math.min(21, idx)));
                }}
                onMouseLeave={() => { if (selectedIndex === null) setHoveredIndex(null); }}
                onClick={() => { if (hoveredIndex !== null && selectedIndex === null) handleSelectCard(hoveredIndex); }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: 74, height: 108 }}>
                  {Array.from({ length: 22 }).map((_, i) => {
                    const t = (i / 21) * 2 - 1;
                    const angle = t * 28;
                    const isSelected = selectedIndex === i;
                    const isHovered = hoveredIndex === i;

                    return (
                      <div
                        key={i}
                        className={`absolute bottom-0 left-0 w-[74px] h-[108px] rounded-[5px] border bg-[#131c26] overflow-hidden pointer-events-none ${
                          isSelected
                            ? "border-primary shadow-[0_0_20px_rgba(200,169,107,0.6)]"
                            : selectedIndex !== null
                              ? "border-primary/15 opacity-25"
                              : isHovered
                                ? "border-primary/80"
                                : "border-primary/30"
                        }`}
                        style={{
                          transformOrigin: "center 270px",
                          transform: isSelected
                            ? "rotate(0deg) translateY(-22px) scale(1.15)"
                            : isHovered
                              ? `rotate(${angle * 0.3}deg) translateY(-16px) scale(1.08)`
                              : `rotate(${angle}deg)`,
                          zIndex: isSelected ? 50 : isHovered ? 45 : i,
                          transition: "transform 0.3s ease, opacity 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                          boxShadow: isSelected
                            ? undefined
                            : isHovered
                              ? "0 6px 20px rgba(200,169,107,0.3)"
                              : "0 2px 4px rgba(0,0,0,0.4)",
                        }}
                      >
                        <div className="absolute inset-[2px] border border-dashed border-primary/15 rounded-[3px]" />
                        <img
                          src="/moon-cat.png"
                          alt=""
                          className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[34px] opacity-30"
                        />
                        <span
                          className="absolute bottom-[2px] left-1/2 -translate-x-1/2 text-[4px] text-foreground/25"
                          style={{ fontFamily: "'Spectral SC', serif" }}
                        >
                          myo
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex-[3]" />
            </div>
          )}

          {/* Reveal / Reading / Result */}
          {(phase === "reveal" || phase === "reading" || phase === "result") && card && (
            <div className="flex-1 overflow-y-auto animate-fade-in">
              <Divider />

              {/* Card + Side info */}
              <div className="flex gap-4 items-start">
                {/* Flip card — image only */}
                <div className="shrink-0" style={{ perspective: 800 }}>
                  <div
                    className={phase === "reveal" ? "animate-flip-card" : "preserve-3d"}
                    style={{
                      width: 120,
                      height: 180,
                      position: "relative",
                      transform: phase !== "reveal" ? "rotateY(180deg)" : undefined,
                      transformStyle: phase !== "reveal" ? "preserve-3d" : undefined,
                    }}
                  >
                    {/* Back face */}
                    <div
                      className="absolute inset-0 rounded-lg border-[0.7px] border-primary/80 bg-[#131c26]"
                      style={{ backfaceVisibility: "hidden", boxShadow: "0 0 0 2px rgba(212,175,55,0.2)" }}
                    >
                      <div className="absolute inset-1 border border-dashed border-primary/25 rounded pointer-events-none" />
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <img src="/moon-cat.png" alt="" className="w-[50px] pointer-events-none opacity-50" />
                        <span
                          className="text-[8px] text-foreground/50 mt-2"
                          style={{ fontFamily: "'Spectral SC', serif" }}
                        >
                          myo
                        </span>
                      </div>
                    </div>
                    {/* Front face — image only */}
                    <div
                      className="absolute inset-0 rounded-lg border-[0.7px] border-primary/80 bg-[#131c26] p-[5px] overflow-hidden"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: "0 0 0 2px rgba(212,175,55,0.2)" }}
                    >
                      <div className="absolute inset-[3px] border border-dashed border-primary/30 rounded pointer-events-none z-10" />
                      <img src={card.image} alt={card.nameKo} className="w-full h-full object-cover rounded" />
                    </div>
                  </div>
                </div>

                {/* Side info */}
                {phase !== "reveal" && (
                  <div className="flex flex-col justify-center pt-1 animate-fade-in min-w-0">
                    <p
                      className="text-[9px] text-primary/60 tracking-[3px] uppercase"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      today's card
                    </p>
                    <p className="text-[17px] text-foreground font-medium mt-1.5 tracking-[1px]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                      {card.nameKo}
                    </p>
                    <p
                      className="text-[10px] text-subtext/70 mt-0.5 tracking-[0.5px]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {card.name}
                    </p>
                    {card.keywords && (
                      <div className="flex gap-1 flex-wrap mt-3">
                        {card.keywords.split(", ").map((kw) => (
                          <span
                            key={kw}
                            className="px-1.5 py-[2px] border border-primary/30 rounded-full text-[9px] text-primary/80 tracking-[0.5px]"
                            style={{ fontFamily: "'Noto Serif KR', serif" }}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Interpretation section */}
              {phase === "reading" && (
                <div className="mt-4 animate-fade-in">
                  <div className="flex items-center justify-center gap-2.5 my-3">
                    <span className="w-10 h-[0.5px] bg-primary/30" />
                    <svg className="text-primary/50" width="7" height="7" viewBox="0 0 32 32">
                      <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
                    </svg>
                    <span className="w-10 h-[0.5px] bg-primary/30" />
                  </div>
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary/70" />
                      <span
                        className="text-[11px] text-primary/70 tracking-[2px]"
                        style={{ fontFamily: "'Cinzel', serif" }}
                      >
                        reading...
                      </span>
                    </div>
                    <p
                      className="text-[11px] text-subtext/50 italic animate-pulse text-center"
                      style={{ fontFamily: "'Noto Serif KR', serif" }}
                    >
                      {readingMsg}
                    </p>
                  </div>
                </div>
              )}

              {phase === "result" && (
                <div className="mt-3 animate-fade-in">
                  {/* Divider */}
                  <div className="flex items-center justify-center gap-2.5 mb-4">
                    <span className="w-10 h-[0.5px] bg-primary/30" />
                    <span
                      className="text-[9px] text-primary/50 tracking-[3px] uppercase"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      reading
                    </span>
                    <span className="w-10 h-[0.5px] bg-primary/30" />
                  </div>

                  {/* Headline */}
                  {headline && (
                    <p
                      className="text-[15px] text-primary-light font-medium leading-[1.5] mb-3 text-center tracking-[0.5px]"
                      style={{ fontFamily: "'Noto Serif KR', serif" }}
                    >
                      &ldquo;{headline}&rdquo;
                    </p>
                  )}

                  {/* Interpretation */}
                  {interpretation && (
                    <p
                      className="text-[11.5px] text-foreground/75 leading-[2]"
                      style={{ fontFamily: "'Noto Serif KR', serif" }}
                    >
                      {interpretation}
                    </p>
                  )}

                  {/* Advice card */}
                  {advice && (
                    <div className="mt-4 px-3 py-2.5 border border-primary/25 rounded-md bg-primary/[0.04]">
                      <div className="flex items-start gap-2">
                        <svg className="text-primary/60 mt-[2px] shrink-0" width="12" height="12" viewBox="0 0 32 32">
                          <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
                        </svg>
                        <div>
                          <p
                            className="text-[9px] text-primary/50 tracking-[2px] uppercase mb-1"
                            style={{ fontFamily: "'Cinzel', serif" }}
                          >
                            today's advice
                          </p>
                          <p
                            className="text-[11.5px] text-foreground/85 leading-[1.7]"
                            style={{ fontFamily: "'Noto Serif KR', serif" }}
                          >
                            {advice}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-2 mt-5 pb-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2.5 rounded-md border border-primary/30 text-subtext/80 text-[11px] tracking-[1px] hover:border-primary/60 hover:text-foreground transition-all"
                      style={{ fontFamily: "'Noto Serif KR', serif" }}
                    >
                      다시 뽑기
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex-1 py-2.5 rounded-md bg-primary/90 text-background text-[11px] font-medium tracking-[1px] hover:bg-primary transition-all flex items-center justify-center gap-1.5"
                      style={{ fontFamily: "'Noto Serif KR', serif" }}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "복사됨" : "복사"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  );
}
