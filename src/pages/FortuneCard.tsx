import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Copy, RefreshCw, Loader2, Palette, Hash, UtensilsCrossed, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import { ZODIAC_SIGNS } from "@/types";
import { getTenGodEmoji, getTenGodFriendlyName, getDayMasterPersonality } from "@/lib/saju";

type Tab = "saju" | "astrology" | "combined";

export function FortuneCard() {
  const {
    profile,
    fortune,
    isGenerating,
    detached,
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
      "우주에 당신의 운명을 묻는 중...",
      "점성술사가 커피를 한 잔 마시는 중...",
      "운명의 실타래를 풀고 있어요...",
      "달의 기운을 받아오는 중...",
      "점괘를 해석하는 중...",
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
  const dateStr = format(today, "yyyy년 M월 d일 EEEE", { locale: ko });
  const zodiacInfo = ZODIAC_SIGNS[profile.zodiacSign];

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!fortune) return;
    const text = `☯ Vibe - ${dateStr}

🔮 ${fortune.combined.headline}

${fortune.combined.body}

🎨 럭키컬러: ${fortune.combined.luckyColor}
🔢 럭키넘버: ${fortune.combined.luckyNumber}
🍴 럭키푸드: ${fortune.combined.luckyFood}

⚠️ ${fortune.combined.warning}`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "saju", label: "사주" },
    { key: "astrology", label: "별자리" },
    { key: "combined", label: "종합" },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Top gradient header */}
      <div
        className="gradient-primary px-4 pt-3 pb-6 relative overflow-hidden"
        {...(detached ? { "data-tauri-drag-region": true } : {})}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-white/60 hover:text-white hover:bg-white/10 mb-1"
          onClick={() => setView("home")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1 right-6 text-white text-lg animate-float">✦</div>
          <div className="absolute bottom-2 left-8 text-white text-sm animate-float" style={{ animationDelay: "0.7s" }}>✧</div>
        </div>
        <div className="relative">
          <p className="text-white/60 text-[11px] font-medium">{dateStr}</p>

          {/* Badges */}
          <div className="flex gap-2 mt-3">
            <div className="flex-1 rounded-xl bg-white/15 backdrop-blur-sm p-2.5 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">{profile.dayMasterHanja}</div>
              <div className="text-[10px] text-white/80 mt-0.5 font-medium">
                {profile.dayMaster}
              </div>
              <div className="text-[9px] text-white/50 mt-0.5 leading-snug">
                {getDayMasterPersonality(profile.dayMaster.charAt(0))}
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-white/15 backdrop-blur-sm p-2.5 text-center border border-white/10">
              <div className="text-2xl text-white">{zodiacInfo.symbol}</div>
              <div className="text-[10px] text-white/80 mt-0.5 font-medium">
                {zodiacInfo.ko}
              </div>
              <div className="text-[9px] text-white/50 mt-0.5">
                나의 별자리
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 -mt-3 pb-2">
        {isGenerating ? (
          <div className="glass-strong rounded-2xl p-6 shadow-lg flex flex-col items-center gap-5">
            {/* Crystal ball */}
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/30 to-indigo-500/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-600/40 via-purple-700/50 to-indigo-800/40 shadow-inner flex items-center justify-center">
                <span className="text-3xl animate-float">🔮</span>
              </div>
              <div className="absolute -inset-1 rounded-full border border-purple-400/20 animate-spin" style={{ animationDuration: "8s" }} />
              <div className="absolute -inset-3 rounded-full border border-purple-300/10 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }} />
            </div>

            {/* Steps */}
            <div className="w-full space-y-2.5">
              {loadingSteps.map((step, i) => (
                <div
                  key={step}
                  className={`flex items-center gap-2.5 transition-all duration-500 ${
                    i <= loadingStep ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                    i < loadingStep
                      ? "bg-green-500/20 text-green-500"
                      : i === loadingStep
                        ? "gradient-primary text-white shadow-md shadow-primary/30"
                        : "bg-muted text-muted-foreground"
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

            {/* Fun message */}
            <p className="text-[11px] text-muted-foreground italic text-center animate-pulse">
              {funMessage}
            </p>
          </div>
        ) : fortune ? (
          <div className="space-y-3">
            {/* Tab switcher */}
            <div className="glass-strong rounded-2xl p-1 shadow-lg flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? "gradient-primary text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Saju Tab */}
            {activeTab === "saju" && (
              <div className="space-y-3 animate-fade-in">
                <div className="glass-strong rounded-2xl p-4 shadow-lg text-center">
                  <p className="text-base font-bold leading-snug gradient-text">
                    "{fortune.saju.headline}"
                  </p>
                </div>

                <div className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
                    <span className="text-lg">{getTenGodEmoji(fortune.saju.relation)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-foreground">
                        {getTenGodFriendlyName(fortune.saju.relation)}
                      </span>
                      <span className="text-muted-foreground">의 날</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      오늘 일진 {fortune.saju.todayDayPillar} · {fortune.saju.summary}
                    </p>
                  </div>
                </div>

                <div className="glass-strong rounded-2xl p-4 shadow-sm">
                  <p className="text-[13px] leading-[1.75] text-foreground/90">
                    {fortune.saju.body}
                  </p>
                </div>

                <div className="glass rounded-xl p-3">
                  <p className="text-[12px] text-primary font-medium leading-relaxed">
                    {fortune.saju.advice}
                  </p>
                </div>
              </div>
            )}

            {/* Astrology Tab */}
            {activeTab === "astrology" && (
              <div className="space-y-3 animate-fade-in">
                <div className="glass-strong rounded-2xl p-4 shadow-lg text-center">
                  <p className="text-base font-bold leading-snug gradient-text">
                    "{fortune.astrology.headline}"
                  </p>
                </div>

                <div className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                    <span className="text-white text-lg">{zodiacInfo.symbol}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>오늘의 트랜짓</span>
                      <span className="font-semibold text-foreground">{zodiacInfo.ko}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {fortune.astrology.dailyTransit}
                    </p>
                  </div>
                </div>

                <div className="glass-strong rounded-2xl p-4 shadow-sm">
                  <p className="text-[13px] leading-[1.75] text-foreground/90">
                    {fortune.astrology.body}
                  </p>
                </div>

                <div className="glass rounded-xl p-3">
                  <p className="text-[12px] text-primary font-medium leading-relaxed">
                    {fortune.astrology.advice}
                  </p>
                </div>
              </div>
            )}

            {/* Combined Tab */}
            {activeTab === "combined" && (
              <div className="space-y-3 animate-fade-in">
                <div className="glass-strong rounded-2xl p-4 shadow-lg text-center">
                  <p className="text-base font-bold leading-snug gradient-text">
                    "{fortune.combined.headline}"
                  </p>
                </div>

                <div className="glass-strong rounded-2xl p-4 shadow-sm">
                  <p className="text-[13px] leading-[1.75] text-foreground/90">
                    {fortune.combined.body}
                  </p>
                </div>

                {/* Lucky items */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Palette, label: "럭키 컬러", value: fortune.combined.luckyColor, color: "from-pink-500/10 to-rose-500/10" },
                    { icon: Hash, label: "럭키 넘버", value: fortune.combined.luckyNumber, color: "from-blue-500/10 to-indigo-500/10" },
                    { icon: UtensilsCrossed, label: "럭키 푸드", value: fortune.combined.luckyFood, color: "from-amber-500/10 to-orange-500/10" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-xl p-2.5 text-center bg-gradient-to-br ${item.color} border border-border/50`}>
                      <item.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <div className="text-[10px] text-muted-foreground">{item.label}</div>
                      <div className="text-xs font-semibold mt-0.5 truncate">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 rounded-xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 dark:border-red-400/25 p-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-600 dark:text-red-300 leading-relaxed">
                    {fortune.combined.warning}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-strong rounded-2xl p-8 shadow-lg flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">운세를 불러올 수 없습니다</p>
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => fetchFortune(true)}>
              <RefreshCw className="w-3 h-3 mr-1.5" /> 다시 시도
            </Button>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-9 rounded-lg text-xs gap-1.5 hover:bg-accent"
          onClick={handleCopy}
          disabled={!fortune}
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "복사됨!" : "복사"}
        </Button>
        <div className="w-px h-4 bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-9 rounded-lg text-xs gap-1.5 hover:bg-accent"
          onClick={() => fetchFortune(true)}
          disabled={isGenerating}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>
    </div>
  );
}
