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

function FanRow({ count, offset, selectedIndex, onSelect }: { count: number; offset: number; selectedIndex: number | null; onSelect: (i: number) => void }) {
  const mid = (count - 1) / 2;
  const fanAngle = 50;

  return (
    <div className="relative h-[140px] flex items-end justify-center">
      <div className="relative" style={{ width: 56, height: 82 }}>
        {Array.from({ length: count }).map((_, i) => {
          const globalIndex = offset + i;
          const angle = mid === 0 ? 0 : ((i - mid) / mid) * (fanAngle / 2);
          const isSelected = selectedIndex === globalIndex;

          return (
            <button
              key={i}
              onClick={() => onSelect(globalIndex)}
              className={`absolute bottom-0 left-0 w-[56px] h-[82px] rounded-[4px] border bg-[#131c26] overflow-hidden transition-all duration-300 ${
                isSelected
                  ? "border-primary shadow-[0_0_16px_rgba(200,169,107,0.5)] z-20"
                  : selectedIndex !== null
                    ? "border-primary/25 opacity-40"
                    : "border-primary/60 hover:border-primary hover:z-20"
              }`}
              style={{
                transformOrigin: "center 240px",
                transform: isSelected
                  ? "rotate(0deg) translateY(-20px) scale(1.15)"
                  : `rotate(${angle}deg)`,
                zIndex: isSelected ? 20 : i,
                boxShadow: isSelected ? undefined : "0 2px 8px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={(e) => {
                if (selectedIndex === null) e.currentTarget.style.transform = `rotate(${angle}deg) translateY(-14px)`;
              }}
              onMouseLeave={(e) => {
                if (selectedIndex === null) e.currentTarget.style.transform = `rotate(${angle}deg)`;
              }}
            >
              <div className="absolute inset-[2px] border border-dashed border-primary/25 rounded-[2px] pointer-events-none" />
              <img
                src="/moon-cat.png"
                alt=""
                className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[34px] pointer-events-none opacity-50"
              />
              <span
                className="absolute bottom-[4px] left-1/2 -translate-x-1/2 text-[6px] text-foreground/50"
                style={{ fontFamily: "'Spectral SC', serif" }}
              >
                myo
              </span>
            </button>
          );
        })}
      </div>
    </div>
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
          <div className="flex items-center justify-between mt-2 mb-1">
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
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-3">
              <span className="w-[50px] h-[1px] bg-primary/70" />
              <svg className="text-primary" width="10" height="10" viewBox="0 0 32 32">
                <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
              </svg>
              <span
                className="text-[20px] text-primary-light tracking-[3px]"
                style={{ fontFamily: "'Spectral SC', serif" }}
              >
                myo
              </span>
              <svg className="text-primary" width="10" height="10" viewBox="0 0 32 32">
                <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
              </svg>
              <span className="w-[50px] h-[1px] bg-primary/70" />
            </div>
            <p className="font-serif text-[14px] text-foreground/80 mt-2 tracking-[2px]">
              묘한 카드
            </p>
            <p
              className="text-[10px] text-subtext mt-1 tracking-[2px]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              today's one card
            </p>
          </div>

          {/* Draw phase - 2-row grid */}
          {phase === "draw" && (
            <div className="flex-1 flex flex-col justify-center animate-fade-in">
              <p
                className="text-center text-[10px] text-subtext/70 mb-2 tracking-[2px]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                choose your card
              </p>
              <FanRow count={39} offset={0} selectedIndex={selectedIndex} onSelect={handleSelectCard} />
              <div className="h-2" />
              <FanRow count={39} offset={39} selectedIndex={selectedIndex} onSelect={handleSelectCard} />
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
              <div className="mt-4">
                {phase === "reading" ? (
                  <div className="flex flex-col items-center gap-3 py-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-[11px] text-subtext tracking-[1px]" style={{ fontFamily: "'Noto Serif KR', serif" }}>해석 중...</span>
                    </div>
                    <p className="text-[11px] text-subtext/50 italic animate-pulse text-center" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                      {readingMsg}
                    </p>
                  </div>
                ) : phase === "result" ? (
                  <div className="animate-fade-in">
                    {headline && (
                      <p className="text-[14px] text-foreground font-medium leading-[1.5] mb-2.5" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                        "{headline}"
                      </p>
                    )}
                    {interpretation && (
                      <p className="text-[11.5px] text-foreground/80 leading-[1.9]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                        {interpretation}
                      </p>
                    )}
                    {advice && (
                      <p className="text-[11px] text-primary/70 mt-3 leading-[1.6] tracking-[0.3px]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                        ✦ {advice}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              {phase === "result" && (
                <div className="flex gap-2 mt-5 pb-2 animate-fade-in">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 rounded-md border border-primary/40 text-subtext text-[11px] tracking-[1px] hover:border-primary hover:text-foreground transition-all"
                    style={{ fontFamily: "'Noto Serif KR', serif" }}
                  >
                    다시 뽑기
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-2.5 rounded-md bg-primary text-background text-[11px] font-medium tracking-[1px] hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
                    style={{ fontFamily: "'Noto Serif KR', serif" }}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "복사됨" : "복사"}
                  </button>
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
