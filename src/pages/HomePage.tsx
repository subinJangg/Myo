import { useEffect } from "react";
import { format } from "date-fns";
import { useAppStore } from "@/stores/appStore";
import { OrnateButton } from "@/components/OrnateButton";
import { formatLunarDate } from "@/lib/calendar";

function SparkleField() {
  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      viewBox="0 0 460 800"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <g fill="#D4AF37" opacity="0.5">
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
      className="absolute inset-0 pointer-events-none"
      viewBox="0 0 200 200"
      width="200"
      height="200"
    >
      <g fill="#D4AF37" opacity="0.3">
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.size} />
        ))}
      </g>
      <g fill="#D4AF37" opacity="0.45">
        <polygon points="100,9 101,12 104,13 101,14 100,17 99,14 96,13 99,12" />
        <polygon points="191,100 192,103 195,104 192,105 191,108 190,105 187,104 190,103" />
        <polygon points="100,191 101,194 104,195 101,196 100,199 99,196 96,195 99,194" />
        <polygon points="9,100 10,103 13,104 10,105 9,108 8,105 5,104 8,103" />
      </g>
    </svg>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-2.5 my-4">
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

export function HomePage() {
  const { profile, fortune, setView, fetchFortune } = useAppStore();

  useEffect(() => {
    if (profile && !fortune) {
      fetchFortune();
    }
  }, [profile, fortune, fetchFortune]);

  if (!profile) return null;

  const today = new Date();
  const dateStr = format(today, "yyyy.MM.dd EEE").toUpperCase();
  const lunarStr = formatLunarDate(today);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="ornate-frame relative min-h-full">
          <SparkleField />
          <div className="relative z-[1] px-[18px] py-[22px]">
          {/* Header */}
          <div className="text-center mb-3 mt-2">
            <div className="flex items-center justify-center gap-3">
              <span className="w-[50px] h-[0.5px] bg-primary" />
              <svg className="text-primary" width="10" height="10" viewBox="0 0 32 32">
                <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
              </svg>
              <span className="text-[24px] text-primary tracking-[3px]" style={{ fontFamily: "'Spectral SC', serif" }}>
                myo
              </span>
              <svg className="text-primary" width="10" height="10" viewBox="0 0 32 32">
                <polygon points="16,2 18.3,13.7 30,16 18.3,18.3 16,30 13.7,18.3 2,16 13.7,13.7" fill="currentColor" />
              </svg>
              <span className="w-[50px] h-[0.5px] bg-primary" />
            </div>
            <p className="font-serif text-[13px] text-subtext mt-3 tracking-[3px]">
              묘하게 잘 맞는 하루
            </p>
            <p className="text-[12px] text-subtext/70 mt-3 tracking-[1.5px]">
              {dateStr}
            </p>
            <p className="text-[11px] text-subtext/50 mt-1 tracking-[1px]">
              {lunarStr}
            </p>
          </div>

          {/* Hero illustration */}
          <div className="flex justify-center mb-2">
            <div className="relative w-[200px] h-[200px] flex items-center justify-center">
              <StarCircle />
              <img
                src="/moon-cat.png"
                alt="묘"
                className="relative z-[1] w-[130px] pointer-events-none select-none animate-float"
                draggable={false}
              />
            </div>
          </div>

          {/* TODAY'S READING */}
          <div className="text-center mb-4">
            <p className="text-[10px] text-primary tracking-[4px] font-serif uppercase mb-2">
              TODAY'S READING
            </p>
            <p className="text-[20px] text-foreground font-serif font-medium tracking-[1px]">
              오늘의 묘 보기
            </p>
            <p className="text-[11px] text-subtext mt-1.5 tracking-[1px]">
              사주 · 별자리 · 종합 풀이를 펼치다
            </p>
          </div>

          {/* CTA */}
          <div className="text-center mb-4">
            <OrnateButton onClick={() => setView("card")}>
              보러가기
            </OrnateButton>
          </div>

          <Divider />

          {/* Feature Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setView("tarot")}
              className="bg-card/40 border border-primary/40 rounded-md py-3 px-2 text-center hover:border-primary/50 active:scale-[0.97] transition-all"
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
              <p className="text-[12px] text-foreground font-medium">타로</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 tracking-[1px] font-serif uppercase">
                tarot
              </p>
            </button>
            <div className="bg-card/40 border border-primary/40 rounded-md py-3 px-2 text-center opacity-40">
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
              <p className="text-[12px] text-foreground">궁합</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 tracking-[1px] font-serif uppercase">
                compatibility
              </p>
            </div>
            <div className="bg-card/40 border border-primary/40 rounded-md py-3 px-2 text-center opacity-40">
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
              <p className="text-[12px] text-foreground">사주</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 tracking-[1px] font-serif uppercase">
                full saju
              </p>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}
