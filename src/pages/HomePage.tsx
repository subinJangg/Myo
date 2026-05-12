import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Settings, ChevronRight, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";
import { ZODIAC_SIGNS } from "@/types";
import { getDayMasterPersonality } from "@/lib/saju";

export function HomePage() {
  const { profile, fortune, detached, toggleDetached, setView } = useAppStore();

  if (!profile) return null;

  const today = new Date();
  const dateStr = format(today, "yyyy년 M월 d일 EEEE", { locale: ko });
  const zodiacInfo = ZODIAC_SIGNS[profile.zodiacSign];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div
        className="gradient-primary px-4 pt-4 pb-5 relative overflow-hidden"
        {...(detached ? { "data-tauri-drag-region": true } : {})}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1 right-6 text-white text-lg animate-float">✦</div>
          <div className="absolute bottom-2 left-8 text-white text-sm animate-float" style={{ animationDelay: "0.7s" }}>✧</div>
          <div className="absolute top-4 left-20 text-white text-xs animate-float" style={{ animationDelay: "1.4s" }}>✦</div>
        </div>
        <div className="relative flex items-start justify-between">
          <div {...(detached ? { "data-tauri-drag-region": true } : {})}>
            <h1 className="text-white font-bold text-lg">Vibe</h1>
            <p className="text-white/60 text-[11px] mt-0.5">{dateStr}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              onClick={toggleDetached}
              title={detached ? "메뉴바에 붙이기" : "창 떼어내기"}
            >
              {detached ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setView("settings")}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Profile summary */}
        <div className="flex items-center gap-3 mt-4 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
          <div className="text-2xl font-bold text-white">{profile.dayMasterHanja}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-white/90">
              <span>{profile.dayMaster}</span>
              <span className="text-white/40">·</span>
              <span>{zodiacInfo.symbol} {zodiacInfo.ko}</span>
            </div>
            <p className="text-[10px] text-white/50 mt-0.5 truncate">
              {getDayMasterPersonality(profile.dayMaster.charAt(0))}
            </p>
          </div>
        </div>
      </div>

      {/* Menu cards */}
      <div className="flex-1 overflow-y-auto px-4 -mt-3 pb-4 space-y-3">
        {/* Fortune card */}
        <button
          onClick={() => setView("card")}
          className="w-full glass-strong rounded-2xl p-4 shadow-lg text-left hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
              <span className="text-2xl">🔮</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold">오늘의 운세</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                사주 · 별자리 · 종합 운세 보기
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </div>
          {fortune && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground line-clamp-1">
                "{fortune.combined.headline}"
              </p>
            </div>
          )}
        </button>

        {/* Tarot card */}
        <button
          onClick={() => setView("tarot")}
          className="w-full glass-strong rounded-2xl p-4 shadow-lg text-left hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
              <span className="text-2xl">🃏</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold">오늘의 타로</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                오늘의 카드 한 장 뽑기
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <p className="text-center text-[10px] text-muted-foreground">
          Vibe v0.1.0
        </p>
      </div>
    </div>
  );
}
