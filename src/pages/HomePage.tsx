import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "@/stores/appStore";
import { OrnateButton } from "@/components/OrnateButton";

function SparkleField() {
  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      viewBox="0 0 460 800"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <g fill="#C8A96B" opacity="0.5">
        <circle cx="55" cy="70" r="1" />
        <circle cx="410" cy="110" r="0.8" />
        <circle cx="75" cy="250" r="1" />
        <circle cx="420" cy="300" r="1.1" />
        <circle cx="45" cy="480" r="0.9" />
        <circle cx="415" cy="530" r="1" />
        <circle cx="65" cy="680" r="1" />
        <circle cx="400" cy="710" r="0.9" />
        <polygon points="40,160 41,163 44,164 41,165 40,168 39,165 36,164 39,163" />
        <polygon points="430,380 431,383 434,384 431,385 430,388 429,385 426,384 429,383" />
        <polygon points="50,600 51,603 54,604 51,605 50,608 49,605 46,604 49,603" />
      </g>
    </svg>
  );
}

function StarCircle() {
  const dots = Array.from({ length: 36 }, (_, i) => {
    const angle = (i / 36) * Math.PI * 2 - Math.PI / 2;
    const r = 88;
    const cx = 100 + Math.cos(angle) * r;
    const cy = 100 + Math.sin(angle) * r;
    const size = i % 4 === 0 ? 1.6 : i % 2 === 0 ? 1 : 0.5;
    return { cx, cy, size };
  });

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 200 200"
    >
      <g fill="#C8A96B" opacity="0.3">
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.size} />
        ))}
      </g>
      <g fill="#C8A96B" opacity="0.45">
        <polygon points="100,9 101,12 104,13 101,14 100,17 99,14 96,13 99,12" />
        <polygon points="191,100 192,103 195,104 192,105 191,108 190,105 187,104 190,103" />
        <polygon points="100,191 101,194 104,195 101,196 100,199 99,196 96,195 99,194" />
        <polygon points="9,100 10,103 13,104 10,105 9,108 8,105 5,104 8,103" />
      </g>
    </svg>
  );
}


export function HomePage() {
  const { profile, fortune, detached, toggleDetached, setView, fetchFortune } = useAppStore();
  const [pinHover, setPinHover] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  const showComingSoon = useCallback(() => {
    setComingSoon(true);
    setTimeout(() => setComingSoon(false), 2000);
  }, []);

  useEffect(() => {
    if (profile && !fortune) {
      fetchFortune();
    }
  }, [profile, fortune, fetchFortune]);

  if (!profile) return null;

  const today = new Date();
  const dateStr = format(today, "yyyy.MM.dd EEE").toUpperCase();

  return (
    <div className="flex flex-col h-full bg-background items-center justify-center">
      <div className="w-full max-h-[620px] h-full overflow-hidden">
        <div className="ornate-frame relative h-full">
          <SparkleField />
          <div className="relative z-[1] px-[36px] py-[30px] flex flex-col h-full">
          {/* Header */}
          <div className="text-center mb-1 mt-5">
            <div className="flex items-center justify-center gap-3">
              <span className="w-[50px] h-[1px] bg-primary/70" />
              <svg className="text-primary" width="10" height="10" viewBox="0 0 32 32">
                <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
              </svg>
              <span className="text-[24px] text-primary-light tracking-[3px]" style={{ fontFamily: "'Spectral SC', serif" }}>
                myo
              </span>
              <svg className="text-primary" width="10" height="10" viewBox="0 0 32 32">
                <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
              </svg>
              <span className="w-[50px] h-[1px] bg-primary/70" />
            </div>
            <p className="font-serif text-[13px] text-foreground/80 mt-2 tracking-[3px]">
              묘하게 잘 맞는 하루
            </p>
            <p className="text-[12px] text-subtext mt-2 tracking-[1.5px]">
              {dateStr}
            </p>
          </div>

          <div className="flex justify-center items-center py-4">
            <div className="relative w-[160px] h-[160px] flex items-center justify-center">
              <StarCircle />
              {/* 반짝이는 별들 */}
              {[
                { x: 5, y: 10, delay: "0s", size: 5 },
                { x: 88, y: 5, delay: "1s", size: 4 },
                { x: 92, y: 70, delay: "1.8s", size: 5 },
                { x: 2, y: 75, delay: "0.5s", size: 4 },
                { x: 50, y: -2, delay: "1.4s", size: 3 },
                { x: 96, y: 40, delay: "2.2s", size: 3 },
                { x: -2, y: 45, delay: "0.8s", size: 3 },
                { x: 48, y: 96, delay: "1.6s", size: 4 },
              ].map((star, i) => (
                <svg
                  key={i}
                  className="absolute animate-twinkle pointer-events-none"
                  style={{ left: `${star.x}%`, top: `${star.y}%`, animationDelay: star.delay, animationDuration: "2.5s" }}
                  width={star.size * 2} height={star.size * 2} viewBox="0 0 16 16"
                >
                  <polygon points="8,1 9,7 15,8 9,9 8,15 7,9 1,8 7,7" fill="#C8A96B" fillOpacity="0.7" />
                </svg>
              ))}
              {/* 고양이 글로우 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[80px] h-[80px] rounded-full" style={{ background: "radial-gradient(circle, rgba(200,169,107,0.12) 0%, transparent 70%)" }} />
              </div>
              <img
                src="/moon-cat.png"
                alt="묘"
                className="relative z-[1] w-[105px] pointer-events-none select-none animate-float"
                style={{ filter: "drop-shadow(0 0 8px rgba(200,169,107,0.25))" }}
                draggable={false}
              />
            </div>
          </div>

          <div className="text-center mb-3">
            <p className="text-[16px] text-foreground font-medium tracking-[1px]">
              오늘의 묘
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5 tracking-[1px] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
              daily fortune
            </p>
            <p className="text-[11px] text-subtext mt-2 tracking-[1px]">
              사주 · 별자리 풀이를 펼치다
            </p>
          </div>

          <div className="text-center mb-4">
            <OrnateButton onClick={() => setView("card")}>
              {fortune ? "오늘의 묘 보기" : "오늘의 묘 풀기"}
            </OrnateButton>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            <button
              onClick={() => setView("tarot")}
              className="bg-card/40 border border-primary/70 rounded-md py-2.5 px-1.5 text-center hover:border-primary hover:bg-primary/10 active:scale-[0.97] transition-all"
            >
              <svg
                className="mx-auto mb-1.5 text-primary"
                width="22"
                height="22"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <rect x="8" y="3" width="16" height="26" rx="2" />
                <polygon
                  points="16,10 17.3,15.5 22,16 17.3,16.5 16,22 14.7,16.5 10,16 14.7,15.5"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
              <p className="text-[12px] text-foreground font-medium">묘한 카드</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 tracking-[1px] font-serif uppercase">
                tarot
              </p>
            </button>
            <button onClick={showComingSoon} className="bg-card/40 border border-primary/40 rounded-md py-2.5 px-1.5 text-center opacity-40 hover:opacity-70 hover:border-primary/60 hover:bg-primary/10 active:scale-[0.97] transition-all cursor-pointer">
              <svg
                className="mx-auto mb-1.5 text-primary"
                width="22"
                height="22"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <circle cx="11" cy="16" r="6" />
                <circle cx="21" cy="16" r="6" />
              </svg>
              <p className="text-[12px] text-foreground">묘연</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 tracking-[1px] font-serif uppercase">
                compatibility
              </p>
            </button>
            <button onClick={showComingSoon} className="bg-card/40 border border-primary/40 rounded-md py-2.5 px-1.5 text-center opacity-40 hover:opacity-70 hover:border-primary/60 hover:bg-primary/10 active:scale-[0.97] transition-all cursor-pointer">
              <svg
                className="mx-auto mb-1.5 text-primary"
                width="22"
                height="22"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path
                  d="M 16 4 L 18 12 L 26 14 L 18 16 L 16 28 L 14 16 L 6 14 L 14 12 Z"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
              <p className="text-[12px] text-foreground">묘리</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 tracking-[1px] font-serif uppercase">
                full saju
              </p>
            </button>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-center gap-5 mt-5 mb-5" style={{ fontFamily: "'Cinzel', serif" }}>
            <button
              onClick={() => { toggleDetached(); setPinHover(false); }}
              onMouseEnter={() => setPinHover(true)}
              onMouseLeave={() => setPinHover(false)}
              className={`text-primary-light text-[10px] tracking-[2px] uppercase inline-flex items-center gap-1.5 transition-opacity ${pinHover ? "opacity-100" : "opacity-60"}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="17" x2="12" y2="22" />
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h-2v4" />
                <circle cx="12" cy="4" r="2" />
                {!detached && <line x1="4" y1="4" x2="20" y2="20" />}
              </svg>
              {detached ? "pin" : "unpin"}
            </button>
            <span className="w-[0.5px] h-3 bg-primary/30" />
            <button
              onClick={() => setView("settings")}
              className="text-primary-light text-[10px] tracking-[2px] uppercase inline-flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              settings
            </button>
            <span className="w-[0.5px] h-3 bg-primary/30" />
            <button
              onClick={() => getCurrentWindow().close()}
              className="text-primary-light text-[10px] tracking-[2px] uppercase inline-flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              quit
            </button>
          </div>

          </div>
        </div>
      </div>

      {comingSoon && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-[#1A2233]/95 border border-primary/40 rounded-lg px-7 py-4 text-center shadow-[0_0_20px_rgba(0,0,0,0.4)] backdrop-blur-sm animate-fade-in-out">
            <p className="text-[10px] text-primary/70 tracking-[3px] uppercase mb-1.5" style={{ fontFamily: "'Cinzel', serif" }}>coming soon</p>
            <p className="text-[14px] text-foreground font-serif tracking-[1px]">묘한 기능을 준비 중이에요</p>
            <p className="text-[11px] text-subtext/70 mt-1.5 tracking-[1px]">묘하게 곧 찾아올 거예요</p>
          </div>
        </div>
      )}
    </div>
  );
}
