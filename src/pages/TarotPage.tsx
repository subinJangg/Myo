import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import { drawCard, interpretSingleCard } from "@/lib/tarot";
import type { TarotCard } from "@/types";

type Phase = "draw" | "flipping" | "reading" | "result";

export function TarotPage() {
  const { preferences, detached, setView } = useAppStore();
  const [phase, setPhase] = useState<Phase>("draw");
  const [card, setCard] = useState<TarotCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [headline, setHeadline] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [advice, setAdvice] = useState("");
  const [readingMsg, setReadingMsg] = useState("");
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

  const handleDraw = () => {
    const drawn = drawCard();
    setCard(drawn);
    setFlipped(false);
    setHeadline("");
    setInterpretation("");
    setAdvice("");
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
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-3 border-b border-border/50"
        {...(detached ? { "data-tauri-drag-region": true } : {})}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => setView("home")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-semibold text-sm">오늘의 타로</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Draw phase */}
        {phase === "draw" && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/30 to-indigo-500/20 animate-pulse" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-violet-600/30 via-purple-700/40 to-indigo-800/30 flex items-center justify-center">
                <span className="text-5xl">🃏</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">오늘의 카드를 뽑아보세요</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                하루에 한 장, 오늘 당신에게<br />
                전해지는 메시지를 확인하세요
              </p>
            </div>
            <Button
              onClick={handleDraw}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/25 px-8 hover:shadow-xl transition-all"
            >
              카드 뽑기
            </Button>
          </div>
        )}

        {/* Card display */}
        {(phase === "flipping" || phase === "reading" || phase === "result") && card && (
          <div className="space-y-4">
            {/* Card */}
            <div className="flex justify-center">
              <button
                onClick={handleFlip}
                disabled={flipped}
                className="w-36 aspect-[2/3] rounded-2xl transition-all"
                style={{ perspective: "800px" }}
              >
                <div
                  className="w-full h-full transition-transform duration-700 relative"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Back */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-700 via-purple-800 to-indigo-900 border-2 border-violet-400/30 flex flex-col items-center justify-center gap-3 shadow-2xl cursor-pointer hover:shadow-violet-500/20 hover:scale-[1.02] transition-all"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="text-white/20 text-4xl">✦</div>
                    <div className="text-white/40 text-xs font-medium tracking-widest">VIBE TAROT</div>
                    <div className="text-white/20 text-4xl rotate-180">✦</div>
                  </div>
                  {/* Front */}
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <img
                      src={card.image}
                      alt={card.nameKo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </button>
            </div>

            {/* Card name */}
            {flipped && (
              <div className="text-center animate-fade-in">
                <h3 className="font-bold text-lg">{card.nameKo}</h3>
                <p className="text-xs text-muted-foreground">{card.name} · {card.symbol}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{card.keywords}</p>
              </div>
            )}

            {/* Tap prompt */}
            {phase === "flipping" && !flipped && (
              <p className="text-xs text-muted-foreground text-center animate-pulse">
                카드를 탭해서 뒤집어 보세요
              </p>
            )}

            {/* Reading */}
            {phase === "reading" && (
              <div className="glass-strong rounded-2xl p-5 flex flex-col items-center gap-3 animate-fade-in">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/30 to-indigo-500/20 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-600/40 via-purple-700/50 to-indigo-800/40 flex items-center justify-center">
                    <span className="text-lg animate-float">🔮</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                  <p className="text-xs text-muted-foreground">카드의 의미를 해석하는 중...</p>
                </div>
                <p className="text-[11px] text-muted-foreground italic text-center animate-pulse">
                  {readingMsg}
                </p>
              </div>
            )}

            {/* Result */}
            {phase === "result" && (
              <div className="space-y-3 animate-fade-in">
                {headline && (
                  <div className="glass-strong rounded-2xl p-4 shadow-lg text-center">
                    <p className="text-base font-bold leading-snug bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      "{headline}"
                    </p>
                  </div>
                )}

                {interpretation && (
                  <div className="glass-strong rounded-2xl p-4 shadow-sm">
                    <p className="text-[13px] leading-[1.75] text-foreground/90">
                      {interpretation}
                    </p>
                  </div>
                )}

                {advice && (
                  <div className="glass rounded-xl p-3 bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/10">
                    <p className="text-[12px] text-purple-700 dark:text-purple-300 font-medium leading-relaxed">
                      {advice}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full rounded-xl text-xs h-9"
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  다시 뽑기
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
