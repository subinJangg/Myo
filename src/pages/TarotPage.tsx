import { useState, useEffect, useRef } from "react";
import { Loader2, Check, Copy } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { drawCard, MAJOR_ARCANA, interpretSingleCard } from "@/lib/tarot";
import type { TarotCard } from "@/types";
import { loadDailyTarot, saveDailyTarot } from "@/lib/store";
type Phase = "loading" | "draw" | "flipping" | "reading" | "result";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function SparkleField() {
  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      viewBox="0 0 480 1100"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <g fill="#D4AF37" opacity="0.5">
        <circle cx="65" cy="90" r="1" />
        <circle cx="410" cy="130" r="0.8" />
        <circle cx="85" cy="270" r="1" />
        <circle cx="420" cy="320" r="1.1" />
        <circle cx="55" cy="500" r="0.9" />
        <circle cx="410" cy="560" r="1" />
        <circle cx="75" cy="720" r="0.9" />
        <circle cx="400" cy="780" r="0.9" />
        <polygon points="45,180 46,183 49,184 46,185 45,188 44,185 41,184 44,183" />
        <polygon points="425,400 426,403 429,404 426,405 425,408 424,405 421,404 424,403" />
        <polygon points="60,620 61,623 64,624 61,625 60,628 59,625 56,624 59,623" />
      </g>
    </svg>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-2.5 my-5">
      <span className="w-16 h-[0.3px] bg-primary/40" />
      <svg className="text-primary/60" width="9" height="9" viewBox="0 0 32 32">
        <polygon
          points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7"
          fill="currentColor"
        />
      </svg>
      <span className="w-16 h-[0.3px] bg-primary/40" />
    </div>
  );
}

function CardBack({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-[200px] h-[300px] rounded-[10px] border-[0.8px] border-primary bg-[#131c26] p-2.5 cursor-pointer hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-shadow"
      style={{ boxShadow: "0 0 0 2px rgba(212,175,55,0.18), 0 16px 36px rgba(0,0,0,0.5)" }}
    >
      <div className="absolute inset-[5px] border border-dashed border-primary/45 rounded-[6px] pointer-events-none" />
      <svg className="w-full h-full" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#D4AF37" strokeWidth="0.5" fill="none">
          <path d="M 14 24 L 24 14" />
          <path d="M 176 14 L 186 24" />
          <path d="M 14 276 L 24 286" />
          <path d="M 176 286 L 186 276" />
        </g>
        <g fill="#D4AF37">
          <circle cx="35" cy="50" r="1.1" />
          <polygon points="160,45 161,48 164,49 161,50 160,53 159,50 156,49 159,48" />
          <circle cx="170" cy="100" r="1" />
          <circle cx="30" cy="220" r="1.2" />
          <polygon points="170,225 171,228 174,229 171,230 170,233 169,230 166,229 169,228" />
          <circle cx="40" cy="260" r="0.9" />
        </g>
        <text
          x="100" y="270"
          textAnchor="middle"
          fontFamily="'Spectral SC', serif"
          fontSize="18"
          fill="#F6EEDB"
          fontStyle="italic"
          fontWeight="500"
        >
          myo
        </text>
      </svg>
      <img
        src="/moon-cat.png"
        alt=""
        className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[130px] pointer-events-none animate-float"
      />
    </button>
  );
}

export function TarotPage() {
  const { preferences, setView } = useAppStore();

  const [phase, setPhase] = useState<Phase>("loading");
  const [card, setCard] = useState<TarotCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [headline, setHeadline] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [advice, setAdvice] = useState("");
  const [readingMsg, setReadingMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const readingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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
        const found = MAJOR_ARCANA.find((c) => c.id === saved.cardId);
        if (found) {
          setCard(found);
          setFlipped(true);
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

  const handleDraw = () => {
    const drawn = drawCard();
    setCard(drawn);
    setFlipped(false);
    setHeadline("");
    setInterpretation("");
    setAdvice("");
    setCopied(false);
    setPhase("flipping");
  };

  const handleFlip = async () => {
    if (flipped || !card) return;
    setFlipped(true);

    setTimeout(async () => {
      setPhase("reading");
      try {
        const resultJson = await interpretSingleCard(card, preferences.jobRole, preferences.tone);
        const result = JSON.parse(resultJson);
        setHeadline(result.headline);
        setInterpretation(result.interpretation);
        setAdvice(result.advice);
        await saveTarot(card, result.headline, result.interpretation, result.advice);
        setPhase("result");
      } catch {
        setPhase("result");
      }
    }, 800);
  };

  const handleReset = () => {
    setPhase("draw");
    setCard(null);
    setFlipped(false);
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
      <div className="flex-1 overflow-y-auto">
        <div className="ornate-frame relative min-h-full">
          <SparkleField />
          <div className="relative z-[1] px-[18px] py-[22px]">

          {/* Navbar */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setView("home")}
              className="text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setView("settings")}
              className="text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              ⚙
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-3">
              <span className="w-10 h-[0.5px] bg-primary" />
              <span
                className="text-[18px] text-primary/80 tracking-[1px]"
                style={{ fontFamily: "'Spectral SC', serif" }}
              >
                myo · card
              </span>
              <span className="w-10 h-[0.5px] bg-primary" />
            </div>
            <p className="text-[18px] text-foreground font-serif font-medium mt-3.5 tracking-[1px]">
              묘한 카드
            </p>
            <p
              className="text-[12px] text-subtext mt-1.5 tracking-[2px]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              today's one card
            </p>
          </div>

          {/* Draw phase */}
          {phase === "draw" && (
            <div className="flex flex-col items-center gap-6 py-6 animate-fade-in">
              <CardBack onClick={handleDraw} />
              <p
                className="text-[12px] text-subtext tracking-[2px]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                tap to draw ↓
              </p>
            </div>
          )}

          {/* Flipping - card back, tap to flip */}
          {phase === "flipping" && card && !flipped && (
            <div className="flex flex-col items-center gap-4 py-6 animate-fade-in">
              <CardBack onClick={handleFlip} />
              <p className="text-[12px] text-subtext animate-pulse tracking-[2px]" style={{ fontFamily: "'Cinzel', serif" }}>
                tap to reveal ↓
              </p>
            </div>
          )}

          {/* Reading / Result */}
          {(phase === "reading" || phase === "result" || (phase === "flipping" && flipped)) && card && (
            <div className="animate-fade-in">
              <Divider />

              {/* Card + interpretation side by side */}
              <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                {/* Card image */}
                <div
                  className="relative bg-[#131c26] rounded-lg border-[0.7px] border-primary/80 p-2"
                  style={{ boxShadow: "0 0 0 2px rgba(212,175,55,0.2)" }}
                >
                  <div className="absolute inset-1 border border-dashed border-primary/40 rounded pointer-events-none" />
                  <div className="w-full aspect-[2/3] rounded overflow-hidden">
                    <img src={card.image} alt={card.nameKo} className="w-full h-full object-cover" />
                  </div>
                  <p
                    className="text-center text-[10px] text-primary/70 mt-2 tracking-[2px]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {card.id <= 9 ? card.symbol : `${card.symbol}`}
                  </p>
                  <p className="text-center text-[12px] text-primary/90 mt-0.5 font-serif">
                    {card.nameKo}
                  </p>
                </div>

                {/* Content */}
                <div className="pt-1">
                  <p
                    className="text-[11px] text-primary/70 tracking-[3px] mb-1.5"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    today's card
                  </p>

                  {phase === "reading" ? (
                    <div className="flex flex-col gap-3 py-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-[12px] text-subtext">해석 중...</span>
                      </div>
                      <p className="text-[11px] text-subtext/60 italic animate-pulse font-serif">
                        {readingMsg}
                      </p>
                    </div>
                  ) : (
                    <>
                      {headline && (
                        <p className="text-[17px] text-foreground font-serif font-medium leading-[1.4] mb-3">
                          "{headline}"
                        </p>
                      )}
                      {interpretation && (
                        <p className="text-[12px] text-foreground/85 leading-[1.7] font-serif mb-3">
                          {interpretation}
                        </p>
                      )}
                      {card.keywords && (
                        <div className="flex gap-1.5 flex-wrap">
                          {card.keywords.split(", ").map((kw) => (
                            <span
                              key={kw}
                              className="px-2.5 py-1 border border-primary/40 rounded-full text-[10px] text-primary tracking-[1px]"
                              style={{ fontFamily: "'Cinzel', serif" }}
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {phase === "result" && (
                <div className="flex gap-2.5 mt-6">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-md border border-primary/50 text-subtext text-[13px] font-serif tracking-[1px] hover:border-primary hover:text-foreground transition-all"
                  >
                    다시 뽑기
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-3 rounded-md bg-primary text-background text-[13px] font-serif font-medium tracking-[1px] hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
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
