export type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type TenGod =
  | "비견"
  | "겁재"
  | "식신"
  | "상관"
  | "편재"
  | "정재"
  | "편관"
  | "정관"
  | "편인"
  | "정인";

export type JobRole = "general" | "developer" | "designer" | "pm";
export type Tone = "warm" | "savage" | "hype" | "calm";

export type BirthLocation = {
  name: string;
  longitude: number;
  latitude: number;
  timezone: string;
};

export type UserProfile = {
  birthDate: string;
  birthTime?: string;
  birthLocation?: BirthLocation;
  dayMaster: string;
  dayMasterHanja: string;
  zodiacSign: ZodiacSign;
  createdAt: string;
};

export type UserPreferences = {
  jobRole: JobRole;
  tone: Tone;
  autoStart: boolean;
  theme: "auto" | "light" | "dark";
};

export type DailyFortune = {
  date: string;
  generatedAt: string;
  _debugSource?: string;
  _debugError?: string;
  saju: {
    todayDayPillar: string;
    todayDayPillarHanja: string;
    relation: TenGod;
    summary: string;
    headline: string;
    body: string;
    advice: string;
  };
  astrology: {
    zodiacSign: string;
    dailyTransit: string;
    headline: string;
    body: string;
    advice: string;
  };
  combined: {
    headline: string;
    body: string;
    luckScore: number;
    caution: string;
    luckyColor: string;
    luckyColorHex: string;
    luckyNumber: number;
    luckyFood: string;
    warning: string;
  };
};

export type TarotCard = {
  id: number;
  name: string;
  nameKo: string;
  symbol: string;
  keywords: string;
  image: string;
};

export type TarotCardInterpretation = {
  position: string;
  interpretation: string;
};

export type TarotReading = {
  cards: TarotCard[];
  positions: string[];
  interpretations: TarotCardInterpretation[];
  overall: string;
  advice: string;
  readAt: string;
};

export const ZODIAC_SIGNS: Record<
  ZodiacSign,
  { ko: string; symbol: string; emoji: string }
> = {
  Aries: { ko: "양자리", symbol: "♈", emoji: "♈" },
  Taurus: { ko: "황소자리", symbol: "♉", emoji: "♉" },
  Gemini: { ko: "쌍둥이자리", symbol: "♊", emoji: "♊" },
  Cancer: { ko: "게자리", symbol: "♋", emoji: "♋" },
  Leo: { ko: "사자자리", symbol: "♌", emoji: "♌" },
  Virgo: { ko: "처녀자리", symbol: "♍", emoji: "♍" },
  Libra: { ko: "천칭자리", symbol: "♎", emoji: "♎" },
  Scorpio: { ko: "전갈자리", symbol: "♏", emoji: "♏" },
  Sagittarius: { ko: "사수자리", symbol: "♐", emoji: "♐" },
  Capricorn: { ko: "염소자리", symbol: "♑", emoji: "♑" },
  Aquarius: { ko: "물병자리", symbol: "♒", emoji: "♒" },
  Pisces: { ko: "물고기자리", symbol: "♓", emoji: "♓" },
};

export const BIRTH_LOCATIONS: BirthLocation[] = [
  { name: "서울", longitude: 126.978, latitude: 37.5665, timezone: "Asia/Seoul" },
  { name: "경기", longitude: 127.0286, latitude: 37.2636, timezone: "Asia/Seoul" },
  { name: "인천", longitude: 126.7052, latitude: 37.4563, timezone: "Asia/Seoul" },
  { name: "부산", longitude: 129.0756, latitude: 35.1796, timezone: "Asia/Seoul" },
  { name: "대구", longitude: 128.6014, latitude: 35.8714, timezone: "Asia/Seoul" },
  { name: "광주", longitude: 126.8526, latitude: 35.1595, timezone: "Asia/Seoul" },
  { name: "대전", longitude: 127.3845, latitude: 36.3504, timezone: "Asia/Seoul" },
  { name: "울산", longitude: 129.3114, latitude: 35.5384, timezone: "Asia/Seoul" },
  { name: "세종", longitude: 127.0, latitude: 36.48, timezone: "Asia/Seoul" },
  { name: "강원", longitude: 127.7295, latitude: 37.8813, timezone: "Asia/Seoul" },
  { name: "충북", longitude: 127.4898, latitude: 36.6424, timezone: "Asia/Seoul" },
  { name: "충남", longitude: 126.8, latitude: 36.5, timezone: "Asia/Seoul" },
  { name: "전북", longitude: 127.149, latitude: 35.8242, timezone: "Asia/Seoul" },
  { name: "전남", longitude: 126.9, latitude: 34.87, timezone: "Asia/Seoul" },
  { name: "경북", longitude: 128.73, latitude: 36.57, timezone: "Asia/Seoul" },
  { name: "경남", longitude: 128.68, latitude: 35.23, timezone: "Asia/Seoul" },
  { name: "제주", longitude: 126.5312, latitude: 33.4996, timezone: "Asia/Seoul" },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  jobRole: "general",
  tone: "warm",
  autoStart: false,
  theme: "auto",
};
