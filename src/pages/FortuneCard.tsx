import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { Loader2, Check } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { ZODIAC_SIGNS } from "@/types";
import { getDayMasterPersonality } from "@/lib/saju";
import { MoonPhaseBar } from "@/components/MoonPhaseBar";
import { getMoonPhaseIndex } from "@/lib/calendar";

type Tab = "saju" | "astrology" | "combined";

function SparkleField() {
  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      viewBox="0 0 460 1200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <g fill="#D4AF37" opacity="0.5">
        <circle cx="60" cy="90" r="1" />
        <circle cx="410" cy="130" r="0.8" />
        <circle cx="80" cy="260" r="1" />
        <circle cx="420" cy="320" r="1.1" />
        <circle cx="50" cy="480" r="0.9" />
        <circle cx="410" cy="540" r="1" />
        <circle cx="70" cy="700" r="0.9" />
        <circle cx="400" cy="760" r="0.9" />
        <polygon points="40,180 41,183 44,184 41,185 40,188 39,185 36,184 39,183" />
        <polygon points="425,400 426,403 429,404 426,405 425,408 424,405 421,404 424,403" />
        <polygon points="55,620 56,623 59,624 56,625 55,628 54,625 51,624 54,623" />
      </g>
    </svg>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-2.5 my-5">
      <span className="w-16 h-[0.3px] bg-primary/40" />
      <svg className="text-primary/60" width="8" height="8" viewBox="0 0 32 32">
        <polygon
          points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7"
          fill="currentColor"
        />
      </svg>
      <span className="w-16 h-[0.3px] bg-primary/40" />
    </div>
  );
}

export function FortuneCard() {
  const {
    profile,
    fortune,
    isGenerating,
    fetchFortune,
    setView,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<Tab>("combined");
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [funMessage, setFunMessage] = useState("");

  const stepMessages: Record<number, string[]> = {
    0: [
      "천간지지를 펼치는 중...",
      "당신의 사주팔자를 들여다보는 중...",
      "만세력을 펼쳐보는 중...",
    ],
    1: [
      "별들의 속삭임을 듣는 중...",
      "밤하늘의 별자리를 읽는 중...",
      "행성의 배치를 확인하는 중...",
    ],
    2: [
      "오행의 기운을 모으는 중...",
      "목화토금수의 흐름을 읽는 중...",
      "음양의 균형을 살피는 중...",
    ],
    3: [
      "수정 구슬을 닦는 중...",
      "운명의 실타래를 풀고 있어요...",
      "달의 기운을 받아오는 중...",
    ],
  };

  const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const loadingSteps = [
    "사주 계산 중",
    "별자리 분석 중",
    "오행 관계 해석 중",
    "AI가 운세를 작성 중",
  ];

  useEffect(() => {
    if (isGenerating) {
      setLoadingStep(0);
      setFunMessage(pickRandom(stepMessages[0]));
      loadingTimer.current = setInterval(() => {
        setLoadingStep((prev) => {
          const next = Math.min(prev + 1, loadingSteps.length - 1);
          setFunMessage(pickRandom(stepMessages[next]));
          return next;
        });
      }, 2500);
    } else {
      if (loadingTimer.current) {
        clearInterval(loadingTimer.current);
        loadingTimer.current = null;
      }
    }
    return () => {
      if (loadingTimer.current) clearInterval(loadingTimer.current);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (profile && !fortune) {
      fetchFortune();
    }
  }, [profile, fortune, fetchFortune]);

  if (!profile) return null;

  const today = new Date();
  const dateStr = format(today, "dd · MMM · yyyy · EEEE").toUpperCase();
  const zodiacInfo = ZODIAC_SIGNS[profile.zodiacSign];
  const moonPhase = getMoonPhaseIndex(today);

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!fortune) return;
    const text = `✦ myo · ${format(today, "yyyy.MM.dd")}

"${fortune.combined.headline}"

${fortune.combined.body}

⚠ ${fortune.combined.caution || fortune.combined.warning}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "saju", label: "사주" },
    { key: "astrology", label: "별자리" },
    { key: "combined", label: "종합" },
  ];

  const getActiveContent = () => {
    if (!fortune) return null;
    if (activeTab === "saju") return fortune.saju;
    if (activeTab === "astrology") return fortune.astrology;
    return fortune.combined;
  };

  const content = getActiveContent();

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
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-3">
              <span className="w-10 h-[0.5px] bg-primary" />
              <span
                className="text-[16px] text-primary/80 tracking-[1px]"
                style={{ fontFamily: "'Spectral SC', serif" }}
              >
                myo · today
              </span>
              <span className="w-10 h-[0.5px] bg-primary" />
            </div>
            <p
              className="text-[13px] text-subtext mt-3 tracking-[2px]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {dateStr}
            </p>
          </div>

          {isGenerating ? (
            <div className="py-8">
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border border-primary/20 animate-spin" style={{ animationDuration: "8s" }} />
                  <div className="absolute inset-3 rounded-full border border-primary/30 animate-spin" style={{ animationDuration: "5s", animationDirection: "reverse" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/moon-cat.png" alt="" className="w-12 animate-float" />
                  </div>
                </div>
                <div className="w-full space-y-2.5 max-w-[240px]">
                  {loadingSteps.map((step, i) => (
                    <div
                      key={step}
                      className={`flex items-center gap-2.5 transition-all duration-500 ${
                        i <= loadingStep ? "opacity-100" : "opacity-30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                        i < loadingStep
                          ? "bg-primary/20 text-primary"
                          : i === loadingStep
                            ? "bg-primary/20 text-primary"
                            : "text-muted-foreground"
                      }`}>
                        {i < loadingStep ? (
                          <Check className="w-3 h-3" />
                        ) : i === loadingStep ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span className="text-[10px]">{i + 1}</span>
                        )}
                      </div>
                      <span className={`text-xs font-serif ${
                        i <= loadingStep ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-subtext/60 italic text-center animate-pulse font-serif">
                  {funMessage}
                </p>
              </div>
            </div>
          ) : fortune ? (
            <>
              {/* Moon Phase Bar */}
              <div className="mb-5">
                <MoonPhaseBar activeIndex={moonPhase} />
              </div>

              {/* Profile cards */}
              <div className="grid grid-cols-2 gap-2.5 mb-2">
                <div className="ornate-mini bg-card/50 border border-primary/30 rounded-md p-3.5 text-center">
                  <p className="text-[10px] text-muted-foreground tracking-[2px] mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                    my day
                  </p>
                  <p className="text-[26px] text-primary/90 font-serif leading-none">
                    {profile.dayMasterHanja}
                  </p>
                  <p className="text-[11px] text-subtext mt-2">
                    {getDayMasterPersonality(profile.dayMaster.charAt(0))}
                  </p>
                </div>
                <div className="ornate-mini bg-card/50 border border-primary/30 rounded-md p-3.5 text-center">
                  <p className="text-[10px] text-muted-foreground tracking-[2px] mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                    my star
                  </p>
                  <p className="text-[26px] text-primary/90 leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
                    {zodiacInfo.symbol}
                  </p>
                  <p className="text-[11px] text-subtext mt-2">{zodiacInfo.ko}</p>
                </div>
              </div>

              <Divider />

              {/* Tabs */}
              <div className="flex justify-center gap-5 mb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`font-serif text-[13px] py-1.5 px-1 tracking-[1px] transition-all ${
                      activeTab === tab.key
                        ? "text-primary border-b-[1.5px] border-primary"
                        : "text-muted-foreground hover:text-subtext"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Headline */}
              {content && (
                <div className="text-center my-5">
                  <p className="text-[22px] font-serif font-medium text-foreground leading-[1.5] tracking-[-0.5px]">
                    <span className="text-primary" style={{ fontFamily: "'Cinzel', serif" }}>"</span>
                    {content.headline}
                    <span className="text-primary" style={{ fontFamily: "'Cinzel', serif" }}>"</span>
                  </p>
                </div>
              )}

              {/* Body text */}
              {content && (
                <div className="flex gap-3.5 mb-5">
                  <span className="w-[2px] bg-primary/60 rounded shrink-0" />
                  <p className="text-[13px] text-foreground/90 leading-[1.8] font-serif">
                    {content.body}
                  </p>
                </div>
              )}

              {/* Warning / Caution */}
              {fortune && (activeTab === "combined" ? fortune.combined.caution || fortune.combined.warning : (content as any)?.advice) && (
                <div className="ornate-mini bg-card/50 border border-primary/50 rounded-md p-3.5 mb-5">
                  <p className="text-[11px] text-primary/70 tracking-[2px] mb-1.5" style={{ fontFamily: "'Cinzel', serif" }}>
                    {activeTab === "combined" ? "⚠ caution · 주의할 묘" : "✦ advice"}
                  </p>
                  <p className="text-[12px] text-foreground leading-[1.6] font-serif">
                    {activeTab === "combined"
                      ? (fortune.combined.caution || fortune.combined.warning)
                      : (content as any)?.advice}
                  </p>
                </div>
              )}

              {/* Lucky items (combined tab only) */}
              {activeTab === "combined" && fortune && (
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="bg-card/40 border border-primary/30 rounded-md p-3 text-center">
                    <div className="h-8 flex items-center justify-center mb-1">
                      <div
                        className="w-6 h-6 rounded-full border border-primary/40"
                        style={{ background: fortune.combined.luckyColorHex || "#4A6FB5", boxShadow: `0 0 0 2px rgba(212,175,55,0.15)` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground tracking-[1.5px]" style={{ fontFamily: "'Cinzel', serif" }}>
                      color
                    </p>
                    <p className="text-[11px] text-foreground mt-1 font-serif">{fortune.combined.luckyColor}</p>
                  </div>
                  <div className="bg-card/40 border border-primary/30 rounded-md p-3 text-center">
                    <div className="h-8 flex items-center justify-center mb-1">
                      <span className="text-[28px] text-primary/80" style={{ fontFamily: "'Cinzel', serif" }}>
                        {fortune.combined.luckyNumber}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground tracking-[1.5px]" style={{ fontFamily: "'Cinzel', serif" }}>
                      number
                    </p>
                    <p className="text-[11px] text-foreground mt-1 font-serif">럭키 넘버</p>
                  </div>
                  <div className="bg-card/40 border border-primary/30 rounded-md p-3 text-center">
                    <div className="h-8 flex items-center justify-center mb-1">
                      <span className="text-xl">🍴</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground tracking-[1.5px]" style={{ fontFamily: "'Cinzel', serif" }}>
                      food
                    </p>
                    <p className="text-[11px] text-foreground mt-1 font-serif">{fortune.combined.luckyFood}</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 rounded-md border border-primary/50 text-subtext text-[13px] font-serif tracking-[1px] hover:border-primary hover:text-foreground transition-all"
                >
                  {copied ? "복사됨!" : "복사"}
                </button>
                <button
                  onClick={() => fetchFortune(true)}
                  disabled={isGenerating}
                  className="flex-1 py-3 rounded-md bg-primary text-background text-[13px] font-serif font-medium tracking-[1px] hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  다시 묘 풀기
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-[14px] text-subtext font-serif mb-4">
                오늘의 묘가 아직 도착하지 않았어요
              </p>
              <button
                onClick={() => fetchFortune(true)}
                className="px-6 py-2.5 rounded-md border border-primary/50 text-primary text-[13px] font-serif tracking-[1px] hover:bg-primary/5 transition-all"
              >
                다시 시도
              </button>
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  );
}
