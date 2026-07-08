export interface Period {
  id: number;
  label: string;
  time: string;
}

// 開始時刻・授業時間・休憩時間からコマ割りを生成する。
// 9:00開始、1コマ45分、休憩15分（60分サイクル）、終業20:45。
const SCHEDULE_START_MINUTES = 9 * 60; // 9:00
const SCHEDULE_END_MINUTES = 20 * 60 + 45; // 20:45
const LESSON_MINUTES = 45;
const BREAK_MINUTES = 15;

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generatePeriods(): Period[] {
  const periods: Period[] = [];
  let start = SCHEDULE_START_MINUTES;
  let id = 1;
  while (start + LESSON_MINUTES <= SCHEDULE_END_MINUTES) {
    const end = start + LESSON_MINUTES;
    periods.push({
      id,
      label: `${id}限`,
      time: `${formatMinutes(start)}-${formatMinutes(end)}`,
    });
    start = end + BREAK_MINUTES;
    id += 1;
  }
  return periods;
}

export const PERIODS: Period[] = generatePeriods();

// 1コマあたりの授業時間（時間）。給与計算に使用。
export const LESSON_DURATION_HOURS = LESSON_MINUTES / 60;

export const WORK_LOCATIONS = ["桑山", "総本陣"] as const;
export type WorkLocation = (typeof WORK_LOCATIONS)[number];

export interface Teacher {
  id: string;
  name: string;
  hourlyWage: number;
  subject: string;
  location: WorkLocation;
}

export interface Student {
  id: string;
  name: string;
  grade: string; // gradeYear年度時点での学年
  gradeYear: number; // gradeを記録した年度（4/1〜翌3/31）。毎年4/1に自動で1学年進級する。
}

export interface Lesson {
  id: string;
  date: string; // YYYY-MM-DD（カレンダー上の実施日）
  periodId: number;
  subject: string;
  teacherId: string | null; // null = 講師未定
  studentIds: string[];
}

export interface KarteEntry {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  subject: string;
  teacherName: string;
  content: string;
  nextGoal: string;
}
