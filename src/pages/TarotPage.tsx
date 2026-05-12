import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RefreshCw, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import { drawCard, MAJOR_ARCANA, interpretSingleCard } from "@/lib/tarot";
import type { TarotCard } from "@/types";
import { loadDailyTarot, saveDailyTarot } from "@/lib/store";

type Phase = "loading" | "draw" | "flipping" | "reading" | "result";

function getToday() {
  return new Date().toISOString().split("T")[0];
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
    "타로 마스터가 카드를 응시하는 중...",
    "숨겨진 의미를 찾고 있어요...",
    "별빛 아래 카드를 펼치는 중...",
    "카드의 에너지를 읽어내는 중...",
    "직감의 안테나를 세우는 중...",
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
    const text = `🃏 오늘의 타로 — ${card.nameKo} (${card.name})

"${headline}"

${interpretation}

${advice}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (phase === "loading") return null;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-3 border-b border-border/50"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => setView("home")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-semibold text-sm">타로 카드 뒤집기</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Draw phase */}
        {phase === "draw" && (
          <div className="flex flex-col items-center justify-center h-full gap-5 animate-fade-in">
            <div className="w-28 aspect-[2/3] rounded-2xl bg-gradient-to-br from-[#1A2430] via-[#223041] to-[#1A2430] border border-primary/30 flex items-center justify-center shadow-xl shadow-primary/10">
              <div className="text-primary/30 text-4xl">✦</div>
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-base">오늘의 카드를 뽑아보세요</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                하루에 한 장, 오늘 당신에게<br />
                전해지는 메시지를 확인하세요
              </p>
            </div>
            <Button
              onClick={handleDraw}
              className="rounded-xl bg-gold/90 hover:bg-gold text-background font-semibold shadow-lg shadow-black/20 px-8 hover:shadow-xl transition-all"
            >
              카드 뽑기
            </Button>
          </div>
        )}

        {/* Card display */}
        {(phase === "flipping" || phase === "reading" || phase === "result") && card && (
          <div className="space-y-4">
            {!flipped ? (
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={handleFlip}
                  className="w-32 aspect-[2/3] rounded-2xl transition-all"
                  style={{ perspective: "800px" }}
                >
                  <div className="w-full h-full relative" style={{ transformStyle: "preserve-3d" }}>
                    <div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1A2430] via-[#223041] to-[#1A2430] border border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/10 cursor-pointer hover:scale-[1.03] transition-all"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="text-primary/30 text-4xl">✦</div>
                    </div>
                  </div>
                </button>
                <p className="text-xs text-muted-foreground animate-pulse">
                  카드를 탭해서 뒤집어 보세요
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Card + info horizontal */}
                <div className="rounded-2xl bg-gradient-to-br from-[#1A2430] via-[#223041] to-[#1A2430] p-4 shadow-lg shadow-primary/5 border border-primary/15 flex gap-4">
                  <div className="w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-lg shrink-0 ring-1 ring-primary/20">
                    <img src={card.image} alt={card.nameKo} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <p className="text-lg font-bold text-foreground">{card.nameKo}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{card.name} · {card.symbol}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {card.keywords.split(", ").map((kw) => (
                        <span key={kw} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-medium backdrop-blur-sm">
                          #{kw}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {phase === "reading" ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                          <span className="text-[11px] text-muted-foreground">해석 중...</span>
                        </div>
                      ) : phase === "result" ? (
                        <>
                          <button
                            onClick={handleReset}
                            className="h-7 px-3 rounded-lg text-[11px] font-medium bg-gold/90 hover:bg-gold text-background transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            다시 뽑기
                          </button>
                          <button
                            onClick={handleCopy}
                            className="h-7 px-3 rounded-lg text-[11px] font-medium bg-primary/10 hover:bg-primary/20 text-primary/80 transition-colors flex items-center gap-1 border border-primary/20"
                          >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? "복사됨" : "복사"}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Reading animation */}
                {phase === "reading" && (
                  <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/3 border border-primary/10 p-5 flex flex-col items-center gap-3 animate-fade-in">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full bg-primary/15 animate-pulse" />
                      <div className="absolute inset-2 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xl animate-float">🔮</span>
                      </div>
                      <div className="absolute -inset-1 rounded-full border border-primary/15 animate-spin" style={{ animationDuration: "6s" }} />
                    </div>
                    <p className="text-[11px] text-muted-foreground italic text-center animate-pulse leading-relaxed">
                      {readingMsg}
                    </p>
                  </div>
                )}

                {/* Interpretation result */}
                {phase === "result" && (
                  <div className="space-y-3 animate-fade-in">
                    {headline && (
                      <div className="py-2 text-center">
                        <p className="text-[15px] font-bold leading-snug gradient-text">
                          "{headline}"
                        </p>
                      </div>
                    )}
                    {interpretation && (
                      <div className="glass-strong rounded-2xl p-4">
                        <p className="text-[13px] leading-[1.8] text-foreground/85">{interpretation}</p>
                      </div>
                    )}
                    {advice && (
                      <div className="rounded-xl p-3.5 bg-primary/8 border border-primary/15">
                        <p className="text-[12px] text-primary font-medium leading-relaxed">{advice}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
