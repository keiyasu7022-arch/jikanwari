import { LESSON_DURATION_HOURS, Lesson, Teacher } from "@/types";
import { parseISODate } from "./dateUtils";

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

// 指定した年月に実施される、その講師のコマ数（実データに基づく）
export function monthlyLessonCount(
  lessons: Lesson[],
  teacherId: string,
  referenceDate: Date = new Date()
): number {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  return lessons.filter((l) => {
    if (l.teacherId !== teacherId) return false;
    const d = parseISODate(l.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;
}

export function monthlyIncome(
  lessons: Lesson[],
  teacher: Teacher,
  referenceDate?: Date
): number {
  return (
    monthlyLessonCount(lessons, teacher.id, referenceDate) *
    teacher.hourlyWage *
    LESSON_DURATION_HOURS
  );
}

export function formatYen(amount: number): string {
  return `¥${Math.round(amount).toLocaleString("ja-JP")}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
