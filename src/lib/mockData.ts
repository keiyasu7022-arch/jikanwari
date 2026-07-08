import { KarteEntry, Lesson, Student, Teacher } from "@/types";
import { toISODate } from "./dateUtils";
import { getFiscalYear } from "./gradeUtils";

export const initialTeachers: Teacher[] = [
  { id: "t1", name: "佐藤 健", hourlyWage: 2200, subject: "数学", location: "桑山" },
  { id: "t2", name: "鈴木 一郎", hourlyWage: 2000, subject: "英語", location: "総本陣" },
  { id: "t3", name: "高橋 美咲", hourlyWage: 2400, subject: "国語", location: "桑山" },
  { id: "t4", name: "田中 大輔", hourlyWage: 2100, subject: "理科", location: "総本陣" },
  { id: "t5", name: "伊藤 花子", hourlyWage: 1900, subject: "社会", location: "桑山" },
];

// 現在の年度時点での学年としてモックデータを登録する。毎年4/1に自動で進級する。
const currentFiscalYear = getFiscalYear(new Date());

export const initialStudents: Student[] = [
  { id: "s1", name: "山本 陽翔", grade: "中学2年", gradeYear: currentFiscalYear },
  { id: "s2", name: "中村 結菜", grade: "中学3年", gradeYear: currentFiscalYear },
  { id: "s3", name: "小林 蓮", grade: "小学6年", gradeYear: currentFiscalYear },
  { id: "s4", name: "加藤 咲良", grade: "中学1年", gradeYear: currentFiscalYear },
  { id: "s5", name: "吉田 大和", grade: "高校1年", gradeYear: currentFiscalYear },
  { id: "s6", name: "渡辺 心春", grade: "高校2年", gradeYear: currentFiscalYear },
  { id: "s7", name: "松本 悠斗", grade: "中学2年", gradeYear: currentFiscalYear },
  { id: "s8", name: "井上 陽菜", grade: "中学3年", gradeYear: currentFiscalYear },
];

// 曜日ごとの週間パターン（0=日,1=月,...6=土）。このパターンを当月の該当曜日すべてに展開し、
// 実際の日付を持つLessonデータを生成する。
interface WeeklyPatternEntry {
  weekday: number;
  periodId: number;
  subject: string;
  teacherId: string | null;
  studentIds: string[];
}

const weeklyPattern: WeeklyPatternEntry[] = [
  // 月曜: 1限→2限で佐藤先生の数学が連続。2限だけ生徒が入れ替わる（連結表示のデモ）。
  { weekday: 1, periodId: 1, subject: "数学", teacherId: "t1", studentIds: ["s1", "s7"] },
  { weekday: 1, periodId: 2, subject: "数学", teacherId: "t1", studentIds: ["s1", "s2"] },
  { weekday: 1, periodId: 4, subject: "国語", teacherId: null, studentIds: ["s3"] },

  { weekday: 2, periodId: 1, subject: "理科", teacherId: "t4", studentIds: ["s4", "s5"] },
  { weekday: 2, periodId: 2, subject: "社会", teacherId: "t5", studentIds: ["s6"] },

  { weekday: 3, periodId: 2, subject: "数学", teacherId: "t1", studentIds: ["s2", "s8"] },
  { weekday: 3, periodId: 3, subject: "英語", teacherId: null, studentIds: ["s1"] },

  // 木曜: 国語が1限→2限で高橋先生継続、3限は生徒総入れ替えで社会（別ブロック扱い）。
  { weekday: 4, periodId: 1, subject: "国語", teacherId: "t3", studentIds: ["s3", "s7"] },
  { weekday: 4, periodId: 2, subject: "国語", teacherId: "t3", studentIds: ["s7"] },
  { weekday: 4, periodId: 5, subject: "数学", teacherId: "t1", studentIds: ["s5"] },

  { weekday: 5, periodId: 2, subject: "英語", teacherId: "t2", studentIds: ["s6", "s8"] },
  { weekday: 5, periodId: 3, subject: "理科", teacherId: null, studentIds: ["s4"] },

  { weekday: 6, periodId: 1, subject: "社会", teacherId: "t5", studentIds: ["s1", "s2", "s3"] },
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// 基準日を含む月のすべての日付に、該当する曜日パターンを展開してLessonを生成する。
function generateMonthlyLessons(referenceDate: Date): Lesson[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const lastDay = daysInMonth(year, month);
  const lessons: Lesson[] = [];

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const weekday = date.getDay();
    const entries = weeklyPattern.filter((p) => p.weekday === weekday);
    entries.forEach((entry, idx) => {
      lessons.push({
        id: `l-${toISODate(date)}-${entry.periodId}-${idx}`,
        date: toISODate(date),
        periodId: entry.periodId,
        subject: entry.subject,
        teacherId: entry.teacherId,
        studentIds: [...entry.studentIds],
      });
    });
  }

  return lessons;
}

export const initialLessons: Lesson[] = generateMonthlyLessons(new Date());

export const initialKarteEntries: KarteEntry[] = [
  {
    id: "k1",
    studentId: "s1",
    date: "2026-07-01",
    subject: "数学",
    teacherName: "佐藤 健",
    content: "一次関数の応用問題を演習。グラフの読み取りは安定してきたが、文章題からの立式にやや時間がかかる。",
    nextGoal: "文章題の立式パターンを反復練習する。",
  },
  {
    id: "k2",
    studentId: "s1",
    date: "2026-06-24",
    subject: "英語",
    teacherName: "（講師未定）",
    content: "現在完了形の基礎を確認。単語の定着は良好。",
    nextGoal: "現在完了の疑問文・否定文を練習。",
  },
  {
    id: "k3",
    studentId: "s2",
    date: "2026-07-02",
    subject: "数学",
    teacherName: "佐藤 健",
    content: "二次方程式の解の公式を導入。計算ミスが多いので途中式を丁寧に書く指導を行った。",
    nextGoal: "途中式を省略せず解く習慣をつける。",
  },
];
