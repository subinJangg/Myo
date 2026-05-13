import KoreanLunarCalendar from "korean-lunar-calendar";

export function getLunarDate(date: Date): { month: number; day: number } {
  const cal = new KoreanLunarCalendar();
  cal.setSolarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const lunar = cal.getLunarCalendar();
  return { month: lunar.month, day: lunar.day };
}

export function formatLunarDate(date: Date): string {
  const { month, day } = getLunarDate(date);
  return `음력 ${month}.${day}`;
}

export function getMoonPhaseIndex(date: Date): number {
  const knownNewMoon = new Date(2000, 0, 6, 18, 14, 0).getTime();
  const synodicMonth = 29.53058868;
  const daysSince = (date.getTime() - knownNewMoon) / 86400000;
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
  return Math.round((phase / synodicMonth) * 8) % 8;
}
