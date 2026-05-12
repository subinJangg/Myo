import type { TenGod } from "@/types";

const HEAVENLY_STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
const HEAVENLY_STEMS_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const EARTHLY_BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;

const FIVE_ELEMENTS = ["목", "화", "토", "금", "수"] as const;

const STEM_ELEMENTS: Record<string, string> = {
  갑: "목", 을: "목",
  병: "화", 정: "화",
  무: "토", 기: "토",
  경: "금", 신: "금",
  임: "수", 계: "수",
};

const STEM_YIN_YANG: Record<string, "양" | "음"> = {
  갑: "양", 을: "음",
  병: "양", 정: "음",
  무: "양", 기: "음",
  경: "양", 신: "음",
  임: "양", 계: "음",
};

const FULL_NAMES: Record<string, string> = {
  갑: "갑목", 을: "을목",
  병: "병화", 정: "정화",
  무: "무토", 기: "기토",
  경: "경금", 신: "신금",
  임: "임수", 계: "계수",
};

// 기준일: 1900년 1월 1일 = 경자일 (천간 6번째=경, 지지 0번째=자)
// 1900-01-01의 간지 인덱스: 천간=6(경), 지지=0(자) → 60간지 중 36번째
const BASE_DATE = new Date(1900, 0, 1);
const BASE_STEM_INDEX = 6;
const BASE_BRANCH_INDEX = 0;

function daysBetween(date1: Date, date2: Date): number {
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

export function getDayPillar(date: Date): {
  stem: string;
  branch: string;
  stemHanja: string;
  fullName: string;
} {
  const days = daysBetween(BASE_DATE, date);
  const stemIndex = ((BASE_STEM_INDEX + days) % 10 + 10) % 10;
  const branchIndex = ((BASE_BRANCH_INDEX + days) % 12 + 12) % 12;

  const stem = HEAVENLY_STEMS[stemIndex];
  return {
    stem,
    branch: EARTHLY_BRANCHES[branchIndex],
    stemHanja: HEAVENLY_STEMS_HANJA[stemIndex],
    fullName: FULL_NAMES[stem],
  };
}

export function getBirthDayMaster(birthDate: string): {
  stem: string;
  stemHanja: string;
  fullName: string;
} {
  const [year, month, day] = birthDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const pillar = getDayPillar(date);
  return {
    stem: pillar.stem,
    stemHanja: pillar.stemHanja,
    fullName: pillar.fullName,
  };
}

export function getTenGodRelation(myStem: string, otherStem: string): TenGod {
  const myElement = STEM_ELEMENTS[myStem];
  const otherElement = STEM_ELEMENTS[otherStem];
  const myYinYang = STEM_YIN_YANG[myStem];
  const otherYinYang = STEM_YIN_YANG[otherStem];
  const samePolarity = myYinYang === otherYinYang;

  const myIdx = FIVE_ELEMENTS.indexOf(myElement as typeof FIVE_ELEMENTS[number]);
  const otherIdx = FIVE_ELEMENTS.indexOf(otherElement as typeof FIVE_ELEMENTS[number]);

  // 같은 오행
  if (myIdx === otherIdx) {
    return samePolarity ? "비견" : "겁재";
  }

  // 내가 생하는 오행 (목→화, 화→토, 토→금, 금→수, 수→목)
  if ((myIdx + 1) % 5 === otherIdx) {
    return samePolarity ? "식신" : "상관";
  }

  // 내가 극하는 오행 (목→토, 화→금, 토→수, 금→목, 수→화)
  if ((myIdx + 2) % 5 === otherIdx) {
    return samePolarity ? "편재" : "정재";
  }

  // 나를 극하는 오행
  if ((otherIdx + 2) % 5 === myIdx) {
    return samePolarity ? "편관" : "정관";
  }

  // 나를 생하는 오행
  return samePolarity ? "편인" : "정인";
}

export function getTenGodDescription(tenGod: TenGod): string {
  const descriptions: Record<TenGod, string> = {
    비견: "동료와 협력의 날. 같은 뜻을 가진 사람과 시너지가 납니다.",
    겁재: "경쟁과 도전의 에너지. 과감한 결정이 필요할 수 있습니다.",
    식신: "창의력과 표현의 날. 아이디어가 샘솟습니다.",
    상관: "날카로운 통찰의 날. 말과 표현에 신중하세요.",
    편재: "변화와 기회의 날. 새로운 가능성이 열립니다.",
    정재: "안정적 수입과 성과. 꾸준함이 빛을 발합니다.",
    편관: "압박과 도전의 날. 긴장감을 성장의 기회로.",
    정관: "질서와 책임의 날. 규칙을 잘 따르면 좋습니다.",
    편인: "학습과 영감의 날. 새로운 지식을 흡수하세요.",
    정인: "지혜와 보호의 날. 멘토의 조언에 귀 기울이세요.",
  };
  return descriptions[tenGod];
}

export function getTenGodEmoji(tenGod: TenGod): string {
  const emojis: Record<TenGod, string> = {
    비견: "🤝", 겁재: "⚔️",
    식신: "💡", 상관: "🔍",
    편재: "🎲", 정재: "💰",
    편관: "🏋️", 정관: "📋",
    편인: "📚", 정인: "🧙",
  };
  return emojis[tenGod];
}

export function getTenGodFriendlyName(tenGod: TenGod): string {
  const names: Record<TenGod, string> = {
    비견: "동료·협력",
    겁재: "경쟁·도전",
    식신: "창의·표현",
    상관: "통찰·비판",
    편재: "변화·기회",
    정재: "안정·성과",
    편관: "압박·성장",
    정관: "질서·책임",
    편인: "학습·영감",
    정인: "지혜·보호",
  };
  return names[tenGod];
}

export function getDayMasterPersonality(stem: string): string {
  const personalities: Record<string, string> = {
    갑: "큰 나무처럼 곧고 당당한 리더 타입",
    을: "풀과 꽃처럼 유연하고 적응력 있는 타입",
    병: "태양처럼 밝고 열정적인 타입",
    정: "촛불처럼 따뜻하고 섬세한 타입",
    무: "산처럼 듬직하고 안정감 있는 타입",
    기: "땅처럼 포용력 있고 실용적인 타입",
    경: "강철처럼 단단하고 결단력 있는 타입",
    신: "보석처럼 세련되고 완벽주의 타입",
    임: "바다처럼 넓고 자유로운 타입",
    계: "빗물처럼 지혜롭고 감성적인 타입",
  };
  return personalities[stem] ?? "";
}

export { HEAVENLY_STEMS, HEAVENLY_STEMS_HANJA, FULL_NAMES };
