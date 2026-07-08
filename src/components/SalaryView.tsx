"use client";

import { useMemo } from "react";
import { LESSON_DURATION_HOURS, Lesson, Teacher } from "@/types";
import { formatYen, monthlyIncome, monthlyLessonCount } from "@/lib/utils";

interface Props {
  teachers: Teacher[];
  lessons: Lesson[];
  onUpdateWage: (teacherId: string, wage: number) => void;
}

export default function SalaryView({ teachers, lessons, onUpdateWage }: Props) {
  const undecidedCount = lessons.filter((l) => l.teacherId === null).length;

  const totalIncome = useMemo(
    () => teachers.reduce((sum, t) => sum + monthlyIncome(lessons, t), 0),
    [teachers, lessons]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-400">講師数</div>
          <div className="mt-1 text-2xl font-bold text-slate-800">{teachers.length}名</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-400">今月の合計支給額（概算）</div>
          <div className="mt-1 text-2xl font-bold text-indigo-600">{formatYen(totalIncome)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-400">講師未定コマ（給与計算対象外）</div>
          <div className="mt-1 text-2xl font-bold text-rose-500">{undecidedCount}コマ</div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        ※ 今月カレンダーに登録済みの実施コマ数 × 1コマ{LESSON_DURATION_HOURS}時間 × 時給 で算出しています。講師未定のコマは集計に含まれません。
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <th className="border-b border-slate-200 px-4 py-3">講師名</th>
              <th className="border-b border-slate-200 px-4 py-3">担当科目</th>
              <th className="border-b border-slate-200 px-4 py-3">時給</th>
              <th className="border-b border-slate-200 px-4 py-3">今月のコマ数</th>
              <th className="border-b border-slate-200 px-4 py-3">月の合計収入</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60">
                <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">
                  {t.name}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-500">
                  {t.subject}
                </td>
                <td className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">¥</span>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={t.hourlyWage}
                      onChange={(e) => onUpdateWage(t.id, Number(e.target.value) || 0)}
                      className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-slate-400">/ 時</span>
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-600">
                  {monthlyLessonCount(lessons, t.id)}コマ
                </td>
                <td className="border-b border-slate-100 px-4 py-3 font-semibold text-indigo-600">
                  {formatYen(monthlyIncome(lessons, t))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-semibold text-slate-700">
              <td colSpan={4} className="px-4 py-3 text-right">
                合計
              </td>
              <td className="px-4 py-3 text-indigo-700">{formatYen(totalIncome)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
