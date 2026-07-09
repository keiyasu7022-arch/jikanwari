import { addDays, parseISODate, toISODate } from "./dateUtils";

interface HolidayEntry {
  date: Date;
  name: string;
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(year, month - 1, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  return new Date(year, month - 1, day);
}

// 春分・秋分の日は天文計算に基づき年ごとに変動する。この近似式は1980〜2099年の範囲で有効。
function springEquinoxDay(year: number): number {
  return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

function autumnEquinoxDay(year: number): number {
  return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

// 現行の祝日法（2016年の山の日新設、2020年の天皇誕生日・スポーツの日改称を反映）に基づく祝日一覧。
// 2020年・2021年の五輪特例による一部祝日の移動には対応していない。
function baseHolidays(year: number): HolidayEntry[] {
  const list: HolidayEntry[] = [];
  const add = (month: number, day: number, name: string) =>
    list.push({ date: new Date(year, month - 1, day), name });

  add(1, 1, "元日");
  list.push({ date: nthWeekdayOfMonth(year, 1, 1, 2), name: "成人の日" });
  add(2, 11, "建国記念の日");
  if (year >= 2020) add(2, 23, "天皇誕生日");
  add(3, springEquinoxDay(year), "春分の日");
  add(4, 29, "昭和の日");
  add(5, 3, "憲法記念日");
  add(5, 4, "みどりの日");
  add(5, 5, "こどもの日");
  if (year >= 2016) add(8, 11, "山の日");
  list.push({ date: nthWeekdayOfMonth(year, 7, 1, 3), name: "海の日" });
  list.push({ date: nthWeekdayOfMonth(year, 9, 1, 3), name: "敬老の日" });
  add(9, autumnEquinoxDay(year), "秋分の日");
  list.push({
    date: nthWeekdayOfMonth(year, 10, 1, 2),
    name: year >= 2020 ? "スポーツの日" : "体育の日",
  });
  add(11, 3, "文化の日");
  add(11, 23, "勤労感謝の日");
  return list;
}

const yearlyHolidayCache = new Map<number, Map<string, string>>();

function computeYearHolidays(year: number): Map<string, string> {
  const cached = yearlyHolidayCache.get(year);
  if (cached) return cached;

  const list = baseHolidays(year);
  const map = new Map<string, string>();
  for (const h of list) map.set(toISODate(h.date), h.name);

  // 振替休日: 日曜と重なる祝日は、その後最初の祝日でない日に振り替える
  for (const h of [...list].sort((a, b) => a.date.getTime() - b.date.getTime())) {
    if (h.date.getDay() === 0) {
      let d = addDays(h.date, 1);
      while (map.has(toISODate(d))) d = addDays(d, 1);
      map.set(toISODate(d), "振替休日");
    }
  }

  // 国民の休日: 前後を祝日に挟まれた平日（日曜を除く）
  for (const iso of Array.from(map.keys())) {
    const d = parseISODate(iso);
    const between = addDays(d, 1);
    const betweenIso = toISODate(between);
    if (between.getDay() !== 0 && !map.has(betweenIso) && map.has(toISODate(addDays(d, 2)))) {
      map.set(betweenIso, "国民の休日");
    }
  }

  yearlyHolidayCache.set(year, map);
  return map;
}

export function getHolidayName(date: Date): string | null {
  return computeYearHolidays(date.getFullYear()).get(toISODate(date)) ?? null;
}
