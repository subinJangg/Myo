import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { Loader2, Check } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { ZODIAC_SIGNS } from "@/types";
import { getDayMasterPersonality, getDayMasterEnglish } from "@/lib/saju";

type Tab = "saju" | "astrology" | "combined";

function SparkleField() {
  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      viewBox="0 0 460 1200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <g fill="#C8A96B" opacity="0.5">
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
    <div className="flex items-center justify-center gap-2 my-5">
      <svg className="text-primary/40 shrink-0" width="7" height="7" viewBox="0 0 32 32">
        <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
      </svg>
      <span className="flex-1 h-[0.5px]" style={{ background: "linear-gradient(to right, transparent, rgba(200,169,107,0.3), transparent)" }} />
      <svg className="text-primary/40 shrink-0" width="7" height="7" viewBox="0 0 32 32">
        <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
      </svg>
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
      "묘하게 천간지지를 펼치는 중...",
      "당신의 사주팔자를 들여다보는 중...",
      "만세력을 묘하게 펼쳐보는 중...",
    ],
    1: [
      "별들의 묘한 속삭임을 듣는 중...",
      "밤하늘의 별자리를 읽는 중...",
      "행성의 묘한 배치를 확인하는 중...",
    ],
    2: [
      "오행의 묘한 기운을 모으는 중...",
      "목화토금수의 흐름을 읽는 중...",
      "음양의 묘한 균형을 살피는 중...",
    ],
    3: [
      "묘한 기운을 모아오는 중...",
      "운명의 실타래를 묘하게 풀고 있어요...",
      "달의 묘한 기운을 받아오는 중...",
    ],
  };

  const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const loadingSteps = [
    "사주의 묘를 읽는 중",
    "별자리의 묘를 분석 중",
    "오행의 묘를 해석 중",
    "오늘의 묘를 풀어보는 중",
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
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!fortune) return;
    const text = `✦ 오늘의 묘 · ${format(today, "yyyy.MM.dd")}

"${fortune.combined.headline}"

${fortune.combined.body}

🐾 묘점 ${fortune.combined.luckScore}/100
⚠ 주의할 묘: ${fortune.combined.caution || fortune.combined.warning}`;
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
          <div className="relative z-[1] px-[30px] py-[22px]">

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
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-2.5">
              <span className="w-[45px] h-[1px] bg-primary/70" />
              <svg className="text-primary" width="9" height="9" viewBox="0 0 32 32">
                <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
              </svg>
              <span
                className="text-[18px] text-primary-light tracking-[3px]"
                style={{ fontFamily: "'Spectral SC', serif" }}
              >
                myo today
              </span>
              <svg className="text-primary" width="9" height="9" viewBox="0 0 32 32">
                <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
              </svg>
              <span className="w-[45px] h-[1px] bg-primary/70" />
            </div>
            <p
              className="text-[13px] text-subtext mt-2 tracking-[2px]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {dateStr}
            </p>
            <div className="flex items-center justify-center gap-2.5 mt-3">
              <span className="w-12 h-[1px] bg-primary/50" />
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#C8A96B" fillOpacity="0.6" />
              </svg>
              <span className="w-12 h-[1px] bg-primary/50" />
            </div>
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
                      <span className={`text-xs ${
                        i <= loadingStep ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-subtext/60 italic text-center animate-pulse">
                  {funMessage}
                </p>
              </div>
            </div>
          ) : fortune ? (
            <>
              {/* 01 — TODAY'S SCORE */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] text-primary/50" style={{ fontFamily: "'Cinzel', serif" }}>01</span>
                  <span className="text-[10px] text-primary/70 tracking-[3px] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>today's score</span>
                  <span className="flex-1 h-[0.5px] bg-primary/20" />
                </div>
                <div className="flex items-start justify-between px-1">
                  <div className="flex items-end gap-1">
                    <span className="text-[44px] gradient-text font-medium leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
                      {fortune.combined.luckScore}
                    </span>
                    <span className="text-[16px] text-primary/40 mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                      / 100
                    </span>
                  </div>
                  <div className="text-right mt-1">
                    <p className="text-[15px] gradient-text font-medium" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                      묘점
                    </p>
                    <p className="text-[9px] text-primary/60 tracking-[2px] uppercase mt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
                      myo score
                    </p>
                    <p className="text-[11px] text-subtext/70 mt-1.5 italic leading-[1.5]">
                      {fortune.combined.luckScore >= 80 ? "묘하게 잘 풀리는 날" :
                       fortune.combined.luckScore >= 60 ? "평범한 듯, 예상 밖의 흐름 있는 날" :
                       fortune.combined.luckScore >= 40 ? "조용히 흘러가는 하루" :
                       "묘하게 조심해야 할 날"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 02 — YOU · TODAY */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] text-primary/50" style={{ fontFamily: "'Cinzel', serif" }}>02</span>
                  <span className="text-[10px] text-primary/70 tracking-[3px] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>you · today</span>
                  <span className="flex-1 h-[0.5px] bg-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-3 px-1">
                  <div>
                    <p className="text-[10px] text-primary/70 tracking-[2px] uppercase mb-2" style={{ fontFamily: "'Cinzel', serif" }}>my day</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[28px] gradient-text leading-none" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                        {profile.dayMasterHanja}
                      </span>
                      <span className="text-[13px] text-subtext" style={{ fontFamily: "'Cinzel', serif" }}>
                        {getDayMasterEnglish(profile.dayMaster.charAt(0))}
                      </span>
                    </div>
                    <p className="text-[10px] text-subtext/60 mt-2 leading-[1.6]">
                      {getDayMasterPersonality(profile.dayMaster.charAt(0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-primary/70 tracking-[2px] uppercase mb-2" style={{ fontFamily: "'Cinzel', serif" }}>my star</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-subtext" style={{ fontFamily: "'Cinzel', serif" }}>
                        {profile.zodiacSign}
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-[18px] text-primary-light">
                        {zodiacInfo.symbol}
                      </span>
                    </div>
                    <p className="text-[10px] text-subtext/60 mt-2 leading-[1.6]">
                      {zodiacInfo.ko} · {profile.birthDate.split("-").slice(1).map(Number).join("월 ")}일생
                    </p>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Tabs */}
              <div className="flex justify-center gap-5 mb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`text-[13px] py-1.5 px-1 tracking-[1px] transition-all ${
                      activeTab === tab.key
                        ? "text-primary border-b-[1.5px] border-primary font-medium"
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
                  <p
                    className="text-[18px] gradient-text font-medium leading-[1.5] tracking-[-0.5px]"
                    style={{ fontFamily: "'Noto Serif KR', serif" }}
                  >
                    &ldquo;{content.headline}&rdquo;
                  </p>
                </div>
              )}

              {/* Body text */}
              {content && (
                <div className="mb-5 px-2">
                  <p className="text-[12.5px] text-foreground/80 leading-[2.1]">
                    {content.body}
                  </p>
                </div>
              )}

              {/* Warning / Caution */}
              {fortune && (activeTab === "combined" ? fortune.combined.caution || fortune.combined.warning : (content as any)?.advice) && (
                <div className={`rounded-lg px-4 py-3.5 mb-5 ${
                  activeTab === "combined"
                    ? "bg-red-500/5 border border-red-500/20"
                    : "glass"
                }`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    {activeTab === "combined" && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-red-400/80 shrink-0" style={{ marginTop: "-1px" }}>
                        <path d="M12 2L1 21h22L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <line x1="12" y1="10" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="18" r="1" fill="currentColor" />
                      </svg>
                    )}
                    <span className={`text-[11px] tracking-[2px] uppercase font-medium leading-none ${
                      activeTab === "combined" ? "text-red-400/80" : "text-primary"
                    }`} style={{ fontFamily: "'Cinzel', serif" }}>
                      {activeTab === "combined" ? "주의할 묘" : "오늘의 조언"}
                    </span>
                  </div>
                  <p className="text-[13px] text-foreground/90 leading-[1.8]">
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
                    <p className="text-[10px] text-primary tracking-[1.5px]" style={{ fontFamily: "'Cinzel', serif" }}>
                      color
                    </p>
                    <p className="text-[11px] text-foreground mt-1">{fortune.combined.luckyColor}</p>
                  </div>
                  <div className="bg-card/40 border border-primary/30 rounded-md p-3 text-center">
                    <div className="h-8 flex items-center justify-center mb-1">
                      <span className="text-[28px] text-primary/80" style={{ fontFamily: "'Cinzel', serif" }}>
                        {fortune.combined.luckyNumber}
                      </span>
                    </div>
                    <p className="text-[10px] text-primary tracking-[1.5px]" style={{ fontFamily: "'Cinzel', serif" }}>
                      number
                    </p>
                    <p className="text-[11px] text-foreground mt-1">럭키 넘버</p>
                  </div>
                  <div className="bg-card/40 border border-primary/30 rounded-md p-3 text-center">
                    <div className="h-8 flex items-center justify-center mb-1">
                      <span className="text-xl">🍴</span>
                    </div>
                    <p className="text-[10px] text-primary tracking-[1.5px]" style={{ fontFamily: "'Cinzel', serif" }}>
                      food
                    </p>
                    <p className="text-[11px] text-foreground mt-1">{fortune.combined.luckyFood}</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2.5 rounded-md border border-primary/30 text-subtext/80 text-[11px] tracking-[1px] hover:border-primary/60 hover:text-foreground transition-all"
                >
                  {copied ? "복사됨!" : "복사"}
                </button>
                <button
                  onClick={() => fetchFortune(true)}
                  disabled={isGenerating}
                  className="flex-1 py-2.5 rounded-md bg-primary/90 text-background text-[11px] font-medium tracking-[1px] hover:bg-primary transition-all disabled:opacity-50"
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
                묘를 다시 풀어보기
              </button>
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  );
}
