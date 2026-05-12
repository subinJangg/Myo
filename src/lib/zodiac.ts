import type { ZodiacSign } from "@/types";

const ZODIAC_DATE_RANGES: Array<{
  sign: ZodiacSign;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}> = [
  { sign: "Capricorn", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { sign: "Aquarius", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { sign: "Pisces", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { sign: "Aries", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { sign: "Taurus", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { sign: "Gemini", startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
  { sign: "Cancer", startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
  { sign: "Leo", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { sign: "Virgo", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { sign: "Libra", startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
  { sign: "Scorpio", startMonth: 10, startDay: 24, endMonth: 11, endDay: 21 },
  { sign: "Sagittarius", startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
];

export function getZodiacSign(month: number, day: number): ZodiacSign {
  for (const range of ZODIAC_DATE_RANGES) {
    if (range.startMonth === 12) {
      if (
        (month === 12 && day >= range.startDay) ||
        (month === 1 && day <= range.endDay)
      ) {
        return range.sign;
      }
    } else if (
      (month === range.startMonth && day >= range.startDay) ||
      (month === range.endMonth && day <= range.endDay)
    ) {
      return range.sign;
    }
  }
  return "Capricorn";
}
