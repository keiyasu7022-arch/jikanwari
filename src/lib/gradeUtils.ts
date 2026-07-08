export const GRADE_LEVELS = [
  "小学1年",
  "小学2年",
  "小学3年",
  "小学4年",
  "小学5年",
  "小学6年",
  "中学1年",
  "中学2年",
  "中学3年",
  "高校1年",
  "高校2年",
  "高校3年",
] as const;

// 日本の年度（4/1〜翌3/31）を返す。4月以降はその年、1〜3月は前年扱い。
export function getFiscalYear(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  return month >= 3 ? year : year - 1;
}

// gradeYear時点でgradeだった生徒の、referenceDateの年度における学年を返す。
// 4/1（年度の切り替わり）を境に自動的に1学年ずつ進級する。
export function currentGrade(
  student: { grade: string; gradeYear: number },
  referenceDate: Date = new Date()
): string {
  const baseIndex = GRADE_LEVELS.indexOf(student.grade as (typeof GRADE_LEVELS)[number]);
  if (baseIndex === -1) return student.grade;

  const advancedYears = getFiscalYear(referenceDate) - student.gradeYear;
  const newIndex = baseIndex + advancedYears;

  if (newIndex < 0) return GRADE_LEVELS[0];
  if (newIndex >= GRADE_LEVELS.length) return "卒業";
  return GRADE_LEVELS[newIndex];
}
