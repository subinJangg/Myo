import type { DailyFortune, JobRole, Tone, UserProfile } from "@/types";
import { getFullChart, getTodayPillar, getTenGodRelation, getTenGodDescription, getDayMasterPersonality, STEM_ELEMENTS, elementOfBranch } from "./saju";
import { calcStrengthAndYongsin } from "./scoring";
import { invoke } from "@tauri-apps/api/core";

export function buildStyleGuide(jobRole: JobRole, tone: Tone): string {
  const jobGuide: Record<JobRole, string> = {
    general: "일상적인 비유와 표현을 사용하세요.",
    developer: "개발자가 공감할 수 있는 IT/개발 비유를 사용하세요. 예: 'merge conflict', 'production deploy', '코드 리뷰', 'hotfix', '기술 부채' 등.",
    designer: "디자이너가 공감할 수 있는 디자인 비유를 사용하세요. 예: '레이아웃', '컬러 팔레트', '피그마', '여백', 'UI 정리' 등.",
    pm: "기획자/PM이 공감할 수 있는 비유를 사용하세요. 예: '스프린트', '로드맵', '백로그', '이해관계자', 'KPI' 등.",
  };

  const toneGuide: Record<Tone, string> = {
    warm: "따뜻하고 응원하는 말투로 작성하세요. 힘이 되는 느낌으로.",
    savage: "독설 섞인 유머러스한 말투로 작성하세요. 팩트로 때리되 애정이 담긴 느낌. 반말 사용.",
    hype: "하이텐션으로 과장되게 작성하세요. 느낌표 많이, 에너지 넘치게. 반말 사용.",
    calm: "차분하고 명상적인 말투로 작성하세요. 조용하고 깊이 있는 느낌.",
  };

  return `${jobGuide[jobRole]} ${toneGuide[tone]}`;
}

type SajuContext = {
  dayMaster: string;
  dayMasterHanja: string;
  personality: string;
  level: "신강" | "중화" | "신약";
  yongsin: string;
  gisin: string;
  todayStemElement: string;
  todayBranchElement: string;
  tenGod: string;
  tenGodDesc: string;
  zodiacSign: string;
};

function buildPrompt(
  saju: SajuContext,
  jobRole: JobRole,
  tone: Tone,
): string {
  return `당신은 "묘(Myo)"라는 운세 앱의 전문 사주/별자리 해석가입니다.
"묘하다", "묘한" 같은 시그니처 표현을 자연스럽게 1~2회 사용해주세요.
단정적이지 않고 여운을 남기는 표현을 사용하세요. "~할 수 있어요", "~한 하루가 될지도"

스타일 가이드: ${buildStyleGuide(jobRole, tone)}

[사주 정보 — 코드가 계산한 결과]
- 일간: ${saju.dayMaster} (${saju.dayMasterHanja}) — ${saju.personality}
- 신강/신약: ${saju.level}
- 용신(필요한 오행): ${saju.yongsin}
- 기신(해로운 오행): ${saju.gisin}
- 오늘 일주 천간 오행: ${saju.todayStemElement}
- 오늘 일주 지지 오행: ${saju.todayBranchElement}
- 오늘의 십신 관계: ${saju.tenGod} — ${saju.tenGodDesc}
- 별자리: ${saju.zodiacSign}

[해석 요청]
위 사주 분석 결과를 바탕으로 오늘의 운세를 해석하고, 묘점(luckScore)을 1~100 사이로 매겨주세요.
점수 기준: 오늘 일주의 오행이 용신에 가까우면 높은 점수, 기신에 가까우면 낮은 점수. 십신 관계의 길흉도 종합 판단하세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 순수 JSON만:
{
  "luckScore": 1~100 사이 정수 (묘점),
  "saju": {
    "headline": "오늘 하루를 요약하는 감성 한 줄 (20자 이내, 직업 비유 필수. 용신/오행/십신 같은 사주 용어는 절대 쓰지 말 것)",
    "body": "십신 관계와 오행 기반 해석 3-5줄 (스타일 가이드의 직업 비유 필수 반영)",
    "caution": "사주 관점에서 오늘 주의할 점 또는 조언 한 줄",
    "luckyColor": "색상 한글 이름",
    "luckyColorHex": "#RRGGBB 형식 HEX 컬러 코드",
    "luckyNumber": 1~9 사이 정수,
    "luckyFood": "음식 이름"
  },
  "astrology": {
    "headline": "오늘 하루를 요약하는 감성 한 줄 (20자 이내, 직업 비유 필수. 별자리 이름은 절대 쓰지 말 것)",
    "body": "별자리 트랜짓 기반 해석 3-5줄 (스타일 가이드의 직업 비유 필수 반영)",
    "caution": "별자리 관점에서 오늘 주의할 점 또는 조언 한 줄"
  }
}`;
}

function generateFallbackFortune(
  profile: UserProfile,
  saju: SajuContext,
) {
  const colors = [
    { name: "코발트 블루", hex: "#4A6FB5" },
    { name: "에메랄드", hex: "#50C878" },
    { name: "루비 레드", hex: "#E0115F" },
    { name: "앰버 골드", hex: "#FFBF00" },
    { name: "라벤더", hex: "#B57EDC" },
    { name: "선셋 오렌지", hex: "#FF6347" },
    { name: "로즈 핑크", hex: "#FF66CC" },
  ];
  const foods = ["김밥", "된장찌개", "비빔밥", "떡볶이", "삼겹살", "냉면", "치킨"];
  const today = new Date();
  const seed = today.getDate() + today.getMonth();
  const luckyColor = colors[seed % colors.length];

  return {
    luckScore: 50,
    saju: {
      headline: `${saju.tenGod}의 기운이 감도는 하루`,
      body: `오늘 ${profile.dayMaster}(${profile.dayMasterHanja}) 일간인 당신에게 묘한 기운이 찾아옵니다. ${saju.tenGodDesc}`,
      caution: "급한 결정은 피하고, 오행의 흐름에 맡겨보세요.",
      luckyColor: luckyColor.name,
      luckyColorHex: luckyColor.hex,
      luckyNumber: (seed % 9) + 1,
      luckyFood: foods[seed % foods.length],
    },
    astrology: {
      headline: `${profile.zodiacSign}에 활력이 찾아오는 날`,
      body: `${profile.zodiacSign} 태양궁의 영향 아래, 오늘은 새로운 기회가 다가올 수 있습니다. 직감을 믿고 행동하면 좋은 결과가 있을 것입니다.`,
      caution: "과한 기대는 금물, 별의 흐름에 맡겨보세요.",
    },
  };
}

export async function generateDailyFortune(
  profile: UserProfile,
  jobRole: JobRole,
  tone: Tone,
): Promise<DailyFortune> {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  const chart = getFullChart(profile.birthDate, profile.birthTime);
  const todayPillar = getTodayPillar();

  const tenGod = getTenGodRelation(chart.day.stem, todayPillar.stem);
  const tenGodDesc = getTenGodDescription(tenGod);
  const analysis = calcStrengthAndYongsin(chart);

  const saju: SajuContext = {
    dayMaster: profile.dayMaster,
    dayMasterHanja: profile.dayMasterHanja,
    personality: getDayMasterPersonality(profile.dayMaster.charAt(0)),
    level: analysis.level,
    yongsin: analysis.yongsin,
    gisin: analysis.gisin,
    todayStemElement: STEM_ELEMENTS[todayPillar.stem] ?? "토",
    todayBranchElement: elementOfBranch(todayPillar.branch),
    tenGod,
    tenGodDesc,
    zodiacSign: profile.zodiacSign,
  };

  let llmResult: {
    luckScore: number;
    saju: { headline: string; body: string; caution: string; luckyColor: string; luckyColorHex: string; luckyNumber: number; luckyFood: string };
    astrology: { headline: string; body: string; caution: string };
  };
  let _debugSource = "unknown";
  let _debugError = "";

  try {
    const prompt = buildPrompt(saju, jobRole, tone);
    const result = await invoke<string>("call_claude", { prompt });
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.luckScore = Math.max(1, Math.min(100, parsed.luckScore ?? 50));
      parsed.saju.caution = parsed.saju.caution ?? "";
      parsed.saju.luckyColorHex = parsed.saju.luckyColorHex ?? "#4A6FB5";
      parsed.astrology.caution = parsed.astrology.caution ?? "";
      llmResult = parsed;
      _debugSource = "claude-cli";
    } else {
      throw new Error("Claude 응답 파싱 실패: " + result.substring(0, 200));
    }
  } catch (e) {
    console.error("묘하게 풀이가 막혔어요:", e);
    _debugError = String(e);
    _debugSource = "fallback";
    llmResult = generateFallbackFortune(profile, saju);
  }

  return {
    date: dateStr,
    generatedAt: new Date().toISOString(),
    _debugSource,
    _debugError,
    luckScore: llmResult.luckScore,
    saju: {
      todayDayPillar: `${todayPillar.stemHanja}${todayPillar.branchHanja}`,
      todayDayPillarHanja: todayPillar.stemHanja,
      todayStemFullName: `${todayPillar.stem}${todayPillar.element}`,
      relation: tenGod,
      summary: tenGodDesc,
      headline: llmResult.saju.headline,
      body: llmResult.saju.body,
      caution: llmResult.saju.caution,
      luckyColor: llmResult.saju.luckyColor,
      luckyColorHex: llmResult.saju.luckyColorHex,
      luckyNumber: llmResult.saju.luckyNumber,
      luckyFood: llmResult.saju.luckyFood,
    },
    astrology: {
      zodiacSign: profile.zodiacSign,
      dailyTransit: `${profile.zodiacSign} 태양궁 트랜짓`,
      headline: llmResult.astrology.headline,
      body: llmResult.astrology.body,
      caution: llmResult.astrology.caution,
    },
  };
}
