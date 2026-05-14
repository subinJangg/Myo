import type { DailyFortune, JobRole, Tone, UserProfile } from "@/types";
import { getFullChart, getTodayPillar, getTenGodRelation, getTenGodDescription, getDayMasterPersonality } from "./saju";
import { calcDailyScore } from "./scoring";
import type { DailyScoreResult } from "./scoring";
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

function buildPrompt(
  profile: UserProfile,
  scoreResult: DailyScoreResult,
  tenGod: string,
  jobRole: JobRole,
  tone: Tone,
): string {
  const tierDesc: Record<string, string> = {
    "大吉": "매우 좋은 날 — 밝고 긍정적인 톤",
    "吉": "좋은 날 — 자연스럽게 긍정적",
    "中": "평범한 날 — 좋지도 나쁘지도 않은 균형",
    "小凶": "조심할 날 — 약간의 주의 필요",
    "凶": "힘든 날 — 위로와 조심 강조",
  };

  return `당신은 "묘(Myo)"라는 운세 앱의 전문 해석가입니다.
"묘하다", "묘한" 같은 시그니처 표현을 자연스럽게 1~2회 사용해주세요.
단정적이지 않고 여운을 남기는 표현을 사용하세요. "~할 수 있어요", "~한 하루가 될지도"

스타일 가이드: ${buildStyleGuide(jobRole, tone)}

[사주 정보 — 코드가 이미 계산한 결과]
- 일간: ${profile.dayMaster} (${profile.dayMasterHanja}) — ${getDayMasterPersonality(profile.dayMaster.charAt(0))}
- 신강/신약: ${scoreResult.level}
- 용신: ${scoreResult.yongsin} — 필요한 오행
- 십신 관계: ${tenGod}
- 오늘 묘점: ${scoreResult.score}점 (${scoreResult.tier})
- 별자리: ${profile.zodiacSign}

[해석 요청]
위 사주 정보를 바탕으로 오늘의 묘를 해석해주세요.
점수는 이미 정해졌으니 새로 매기지 마세요.
"${scoreResult.score}점 ${scoreResult.tier}" 의 톤에 맞게 (${tierDesc[scoreResult.tier]}) 해석해주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 순수 JSON만:
{
  "saju": {
    "headline": "사주 기반 한 줄 요약 (15자 이내)",
    "body": "십신 관계와 오행 기반 해석 3-5줄",
    "advice": "사주 관점 조언 한 줄"
  },
  "astrology": {
    "headline": "별자리 기반 한 줄 요약 (15자 이내)",
    "body": "별자리 트랜짓 기반 해석 3-5줄",
    "advice": "별자리 관점 조언 한 줄"
  },
  "combined": {
    "headline": "사주+별자리 종합 한 줄 요약 (15자 이내)",
    "body": "두 관점을 종합한 본문 3-5줄",
    "caution": "주의할 묘 한 줄 (묘하게를 자연스럽게 포함)",
    "luckyColor": "색상 한글 이름",
    "luckyColorHex": "#RRGGBB 형식 HEX 컬러 코드",
    "luckyNumber": 1~9 사이 정수,
    "luckyFood": "음식 이름",
    "warning": "주의사항 한 줄"
  }
}`;
}

function generateFallbackFortune(
  profile: UserProfile,
  scoreResult: DailyScoreResult,
  tenGod: string,
  tenGodDesc: string,
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
    saju: {
      headline: `${tenGod}의 기운이 감도는 하루`,
      body: `오늘 ${profile.dayMaster}(${profile.dayMasterHanja}) 일간인 당신에게 묘한 기운이 찾아옵니다. ${tenGodDesc}`,
      advice: "오행의 흐름에 따라 차분하게 하루를 보내세요.",
    },
    astrology: {
      headline: `${profile.zodiacSign}에 활력이 찾아오는 날`,
      body: `${profile.zodiacSign} 태양궁의 영향 아래, 오늘은 새로운 기회가 다가올 수 있습니다. 직감을 믿고 행동하면 좋은 결과가 있을 것입니다.`,
      advice: "별자리의 흐름을 믿고 자신감을 가져보세요.",
    },
    combined: {
      headline: `${tenGod}의 묘한 기운이 감도는 하루`,
      body: `오늘 ${profile.dayMaster}(${profile.dayMasterHanja}) 일간인 당신에게 묘한 기운이 찾아옵니다. ${tenGodDesc} 별자리 ${profile.zodiacSign}의 영향도 더해져, 묘하게 특별한 하루가 될지도.`,
      luckScore: scoreResult.score,
      caution: "급한 결정은 피하고, 한 번 더 생각해보세요.",
      luckyColor: luckyColor.name,
      luckyColorHex: luckyColor.hex,
      luckyNumber: (seed % 9) + 1,
      luckyFood: foods[seed % foods.length],
      warning: "급한 결정은 피하고, 한 번 더 생각해보세요.",
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
  const scoreResult = calcDailyScore(chart, todayPillar, dateStr);

  const tenGod = getTenGodRelation(chart.day.stem, todayPillar.stem);
  const tenGodDesc = getTenGodDescription(tenGod);

  let llmResult: {
    saju: { headline: string; body: string; advice: string };
    astrology: { headline: string; body: string; advice: string };
    combined: DailyFortune["combined"];
  };
  let _debugSource = "unknown";
  let _debugError = "";

  try {
    const prompt = buildPrompt(profile, scoreResult, tenGod, jobRole, tone);
    const result = await invoke<string>("call_claude", { prompt });
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.combined.luckScore = scoreResult.score;
      parsed.combined.caution = parsed.combined.caution ?? parsed.combined.warning ?? "";
      parsed.combined.luckyColorHex = parsed.combined.luckyColorHex ?? "#4A6FB5";
      llmResult = parsed;
      _debugSource = "claude-cli";
    } else {
      throw new Error("Claude 응답 파싱 실패: " + result.substring(0, 200));
    }
  } catch (e) {
    console.error("묘하게 풀이가 막혔어요:", e);
    _debugError = String(e);
    _debugSource = "fallback";
    llmResult = generateFallbackFortune(profile, scoreResult, tenGod, tenGodDesc);
  }

  return {
    date: dateStr,
    generatedAt: new Date().toISOString(),
    _debugSource,
    _debugError,
    saju: {
      todayDayPillar: `${todayPillar.stemHanja}${todayPillar.branchHanja}`,
      todayDayPillarHanja: todayPillar.stemHanja,
      relation: tenGod,
      summary: tenGodDesc,
      headline: llmResult.saju.headline,
      body: llmResult.saju.body,
      advice: llmResult.saju.advice,
    },
    astrology: {
      zodiacSign: profile.zodiacSign,
      dailyTransit: `${profile.zodiacSign} 태양궁 트랜짓`,
      headline: llmResult.astrology.headline,
      body: llmResult.astrology.body,
      advice: llmResult.astrology.advice,
    },
    combined: llmResult.combined,
  };
}
