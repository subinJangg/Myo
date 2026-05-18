import type { FullChart, Pillar } from "./saju";
import { STEM_ELEMENTS, elementOfBranch, FIVE_ELEMENTS } from "./saju";

type Element = "목" | "화" | "토" | "금" | "수";

function elIdx(e: string): number {
  return FIVE_ELEMENTS.indexOf(e as typeof FIVE_ELEMENTS[number]);
}

function findGenerator(e: Element): Element {
  return FIVE_ELEMENTS[(elIdx(e) + 4) % 5] as Element;
}
function findGeneratee(e: Element): Element {
  return FIVE_ELEMENTS[(elIdx(e) + 1) % 5] as Element;
}
function findController(e: Element): Element {
  return FIVE_ELEMENTS[(elIdx(e) + 3) % 5] as Element;
}

type Relation = "비화" | "인" | "식" | "재" | "관";

function relationToDayMaster(dayMaster: string, otherElement: string): Relation {
  const mi = elIdx(dayMaster);
  const oi = elIdx(otherElement);
  if (mi === oi) return "비화";
  if ((mi + 4) % 5 === oi) return "인";
  if ((mi + 1) % 5 === oi) return "식";
  if ((mi + 2) % 5 === oi) return "재";
  return "관";
}

const MONTH_WEIGHT: Record<Relation, number> = {
  비화: 6, 인: 6, 식: -3, 재: -3, 관: -6,
};
const STEM_WEIGHT: Record<Relation, number> = {
  비화: 1, 인: 1, 식: -1, 재: -1, 관: -1,
};
const BRANCH_WEIGHT: Record<Relation, number> = {
  비화: 2, 인: 2, 식: -1, 재: -1, 관: -2,
};

function calcStrengthScore(chart: FullChart) {
  const dm = chart.dayMasterElement;
  let score = 0;

  const monthBranchEl = elementOfBranch(chart.month.branch);
  score += MONTH_WEIGHT[relationToDayMaster(dm, monthBranchEl)];

  const pillars = [chart.year, chart.day, chart.hour].filter(Boolean) as Pillar[];
  for (const p of pillars) {
    score += STEM_WEIGHT[relationToDayMaster(dm, STEM_ELEMENTS[p.stem] ?? dm)];
    score += BRANCH_WEIGHT[relationToDayMaster(dm, elementOfBranch(p.branch))];
  }

  const level = score >= 3 ? "신강" as const : score <= -3 ? "신약" as const : "중화" as const;
  return { score, level, dayMaster: dm as Element };
}

function determineYongsin(strength: ReturnType<typeof calcStrengthScore>) {
  const { score, dayMaster } = strength;
  const insung = findGenerator(dayMaster);
  const sik = findGeneratee(dayMaster);
  const gwan = findController(findGenerator(dayMaster));

  let yongsin: Element;
  if (score >= 6) yongsin = gwan;
  else if (score >= 3) yongsin = sik;
  else if (score >= -2) yongsin = insung;
  else if (score >= -5) yongsin = dayMaster;
  else yongsin = insung;

  const gisin = findController(yongsin);
  const hansin = (FIVE_ELEMENTS as readonly string[]).filter(e => e !== yongsin && e !== gisin) as Element[];

  return { yongsin, gisin, hansin };
}

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export type DailyScoreResult = {
  score: number;
  tier: "大吉" | "吉" | "中" | "小凶" | "凶";
  level: "신강" | "중화" | "신약";
  yongsin: string;
  gisin: string;
  stemRelation: "용신" | "기신" | "한신";
  branchRelation: "용신" | "기신" | "한신";
};

export type SajuAnalysis = {
  level: "신강" | "중화" | "신약";
  yongsin: string;
  gisin: string;
};

export function calcStrengthAndYongsin(chart: FullChart): SajuAnalysis {
  const strength = calcStrengthScore(chart);
  const { yongsin, gisin } = determineYongsin(strength);
  return { level: strength.level, yongsin, gisin };
}

export function calcDailyScore(chart: FullChart, todayPillar: Pillar, dateStr: string): DailyScoreResult {
  const strength = calcStrengthScore(chart);
  const { yongsin, gisin } = determineYongsin(strength);

  const todayStemEl = STEM_ELEMENTS[todayPillar.stem] ?? "토";
  const todayBranchEl = elementOfBranch(todayPillar.branch);

  const stemRelation = todayStemEl === yongsin ? "용신" as const
    : todayStemEl === gisin ? "기신" as const : "한신" as const;
  const branchRelation = todayBranchEl === yongsin ? "용신" as const
    : todayBranchEl === gisin ? "기신" as const : "한신" as const;

  let score = 50;
  if (stemRelation === "용신") score += 25;
  else if (stemRelation === "기신") score -= 25;
  if (branchRelation === "용신") score += 12;
  else if (branchRelation === "기신") score -= 12;

  const seed = hashDate(dateStr) % 7 - 3;
  score += seed;
  score = Math.max(5, Math.min(95, score));

  const tier = score >= 81 ? "大吉" as const
    : score >= 61 ? "吉" as const
    : score >= 41 ? "中" as const
    : score >= 21 ? "小凶" as const
    : "凶" as const;

  return {
    score, tier,
    level: strength.level,
    yongsin, gisin,
    stemRelation, branchRelation,
  };
}
