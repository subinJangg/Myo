import type { DailyFortune, JobRole, Tone, UserProfile } from "@/types";
import { getDayPillar, getTenGodRelation, getTenGodDescription } from "./saju";
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
  todayPillar: ReturnType<typeof getDayPillar>,
  tenGod: string,
  jobRole: JobRole,
  tone: Tone,
): string {
  return `당신은 한국의 사주명리학과 서양 점성술에 모두 능통한 운세 해석가입니다.
다음 정보를 바탕으로 오늘의 운세를 작성해주세요.

스타일 가이드: ${buildStyleGuide(jobRole, tone)}

사용자 일간: ${profile.dayMaster} (${profile.dayMasterHanja})
사용자 별자리: ${profile.zodiacSign}
오늘의 일진: ${todayPillar.fullName} (${todayPillar.stemHanja})
십신 관계: ${tenGod}

사주 운세와 별자리 운세를 각각 따로 해석하고, 마지막에 둘을 종합한 통합 운세도 작성해주세요.

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
    "luckScore": 0~100 사이 정수 (오늘의 묘 지수),
    "caution": "주의할 묘 한 줄 (오늘 조심해야 할 구체적 행동)",
    "luckyColor": "색상 한글 이름",
    "luckyColorHex": "#RRGGBB 형식 HEX 컬러 코드",
    "luckyNumber": 1~9 사이 정수,
    "luckyFood": "음식 이름",
    "warning": "주의사항 한 줄"
  }
}`;
}

type FallbackResult = {
  saju: Pick<DailyFortune["saju"], "headline" | "body" | "advice">;
  astrology: Pick<DailyFortune["astrology"], "headline" | "body" | "advice">;
  combined: DailyFortune["combined"];
};

function generateFallbackFortune(
  profile: UserProfile,
  todayPillar: ReturnType<typeof getDayPillar>,
  tenGod: string,
  tenGodDesc: string,
): FallbackResult {
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
      body: `오늘 ${profile.dayMaster}(${profile.dayMasterHanja}) 일간인 당신에게 ${todayPillar.fullName}(${todayPillar.stemHanja})의 기운이 찾아옵니다. ${tenGodDesc}`,
      advice: "오행의 흐름에 따라 차분하게 하루를 보내세요.",
    },
    astrology: {
      headline: `${profile.zodiacSign}에 활력이 찾아오는 날`,
      body: `${profile.zodiacSign} 태양궁의 영향 아래, 오늘은 새로운 기회가 다가올 수 있습니다. 직감을 믿고 행동하면 좋은 결과가 있을 것입니다.`,
      advice: "별자리의 흐름을 믿고 자신감을 가져보세요.",
    },
    combined: {
      headline: `${tenGod}의 기운이 감도는 하루`,
      body: `오늘 ${profile.dayMaster}(${profile.dayMasterHanja}) 일간인 당신에게 ${todayPillar.fullName}(${todayPillar.stemHanja})의 기운이 찾아옵니다. ${tenGodDesc} 별자리 ${profile.zodiacSign}의 영향도 더해져, 오늘은 특별한 하루가 될 수 있습니다.`,
      luckScore: 50 + (seed % 40),
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
  const todayPillar = getDayPillar(today);
  const tenGod = getTenGodRelation(
    profile.dayMaster.charAt(0),
    todayPillar.stem,
  );
  const tenGodDesc = getTenGodDescription(tenGod);

  let llmResult: {
    saju: { headline: string; body: string; advice: string };
    astrology: { headline: string; body: string; advice: string };
    combined: DailyFortune["combined"];
  };
  let _debugSource = "unknown";
  let _debugError = "";

  try {
    const prompt = buildPrompt(profile, todayPillar, tenGod, jobRole, tone);
    const result = await invoke<string>("call_claude", { prompt });
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.combined.luckScore = parsed.combined.luckScore ?? 50;
      parsed.combined.caution = parsed.combined.caution ?? parsed.combined.warning ?? "";
      parsed.combined.luckyColorHex = parsed.combined.luckyColorHex ?? "#4A6FB5";
      llmResult = parsed;
      _debugSource = "claude-cli";
    } else {
      throw new Error("Claude 응답 파싱 실패: " + result.substring(0, 200));
    }
  } catch (e) {
    console.error("Claude CLI 호출 실패:", e);
    _debugError = String(e);
    _debugSource = "fallback";
    llmResult = generateFallbackFortune(profile, todayPillar, tenGod, tenGodDesc);
  }

  return {
    date: dateStr,
    generatedAt: new Date().toISOString(),
    _debugSource,
    _debugError,
    saju: {
      todayDayPillar: todayPillar.fullName,
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
