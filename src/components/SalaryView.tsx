"use client";

import { useEffect, useMemo, useState } from "react";
import { LESSON_DURATION_HOURS, Lesson, Teacher, TeacherIncentive } from "@/types";
import { formatYen } from "@/lib/utils";
import TeacherIncentiveModal from "./TeacherIncentiveModal";

interface Props {
  teachers: Teacher[];
  lessons: Lesson[];
  teacherIncentives: TeacherIncentive[];
  onUpdateWage: (teacherId: string, wage: number) => void;
  onAddIncentive: (incentive: TeacherIncentive) => void;
  onDeleteIncentive: (id: string) => void;
}

// 入力中はローカルで保持し、フォーカスを外した時（またはEnter）にだけ保存する。
// 1キー入力ごとにDBへ書き込むのを防ぐ。
function WageInput({
  teacher,
  onCommit,
}: {
  teacher: Teacher;
  onCommit: (teacherId: string, wage: number) => void;
}) {
  const [value, setValue] = useState(String(teacher.hourlyWage));

  useEffect(() => {
    setValue(String(teacher.hourlyWage));
  }, [teacher.hourlyWage]);

  const commit = () => {
    const wage = Number(value);
    if (!Number.isFinite(wage) || wage < 0) {
      setValue(String(teacher.hourlyWage));
      return;
    }
    if (wage !== teacher.hourlyWage) onCommit(teacher.id, wage);
  };

  return (
    <input
      type="number"
      min={0}
      step={50}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
    />
  );
}

export default function SalaryView({
  teachers,
  lessons,
  teacherIncentives,
  onUpdateWage,
  onAddIncentive,
  onDeleteIncentive,
}: Props) {
  const [managingIncentiveFor, setManagingIncentiveFor] = useState<Teacher | null>(null);
  // 表示対象の年月（1日固定で保持）
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const now = new Date();
  const isCurrentMonth =
    month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();
  const monthLabel = `${month.getFullYear()}年${month.getMonth() + 1}月`;

  const moveMonth = (diff: number) =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + diff, 1));

  // 表示月のコマ数・インセンティブを講師ごとに1パスで集計する
  const stats = useMemo(() => {
    const ym = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    const lessonCounts = new Map<string, number>();
    let undecidedCount = 0;
    for (const l of lessons) {
      if (!l.date.startsWith(ym)) continue;
      if (l.teacherId === null) {
        undecidedCount += 1;
      } else {
        lessonCounts.set(l.teacherId, (lessonCounts.get(l.teacherId) ?? 0) + 1);
      }
    }
    const incentiveTotals = new Map<string, number>();
    for (const i of teacherIncentives) {
      if (!i.date.startsWith(ym)) continue;
      incentiveTotals.set(i.teacherId, (incentiveTotals.get(i.teacherId) ?? 0) + i.amount);
    }
    return { lessonCounts, incentiveTotals, undecidedCount };
  }, [lessons, teacherIncentives, month]);

  const incomeOf = (t: Teacher) =>
    (stats.lessonCounts.get(t.id) ?? 0) * t.hourlyWage * LESSON_DURATION_HOURS +
    (stats.incentiveTotals.get(t.id) ?? 0);

  const totalIncome = teachers.reduce((sum, t) => sum + incomeOf(t), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => moveMonth(-1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          ◀ 前月
        </button>
        <button
          onClick={() => {
            const d = new Date();
            setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          今月
        </button>
        <button
          onClick={() => moveMonth(1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          次月 ▶
        </button>
        <span className="ml-1 text-sm font-semibold text-slate-700">
          {monthLabel}
          {isCurrentMonth && (
            <span className="ml-1.5 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
              今月
            </span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-400">講師数</div>
          <div className="mt-1 text-2xl font-bold text-slate-800">{teachers.length}名</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-400">{monthLabel}の合計支給額（概算）</div>
          <div className="mt-1 text-2xl font-bold text-indigo-600">{formatYen(totalIncome)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-400">{monthLabel}の講師未定コマ（給与計算対象外）</div>
          <div className="mt-1 text-2xl font-bold text-rose-500">{stats.undecidedCount}コマ</div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        ※ {monthLabel}にカレンダーへ登録済みの実施コマ数 × 1コマ{LESSON_DURATION_HOURS}時間 × 時給 ＋ {monthLabel}のインセンティブ合計 で算出しています。講師未定のコマは集計に含まれません。時給は入力後にフォーカスを外すと保存されます。
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <th className="border-b border-slate-200 px-4 py-3">講師名</th>
              <th className="border-b border-slate-200 px-4 py-3">時給</th>
              <th className="border-b border-slate-200 px-4 py-3">{monthLabel}のコマ数</th>
              <th className="border-b border-slate-200 px-4 py-3">{monthLabel}のインセンティブ</th>
              <th className="border-b border-slate-200 px-4 py-3">月の合計収入</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/60">
                <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">
                  {t.name}
                </td>
                <td className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">¥</span>
                    <WageInput teacher={t} onCommit={onUpdateWage} />
                    <span className="text-slate-400">/ 時</span>
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-600">
                  {stats.lessonCounts.get(t.id) ?? 0}コマ
                </td>
                <td className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-600">
                      {formatYen(stats.incentiveTotals.get(t.id) ?? 0)}
                    </span>
                    <button
                      onClick={() => setManagingIncentiveFor(t)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                    >
                      管理
                    </button>
                  </div>
                </td>
                <td className="border-b border-slate-100 px-4 py-3 font-semibold text-indigo-600">
                  {formatYen(incomeOf(t))}
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

      {managingIncentiveFor && (
        <TeacherIncentiveModal
          teacher={managingIncentiveFor}
          incentives={teacherIncentives}
          onClose={() => setManagingIncentiveFor(null)}
          onAdd={onAddIncentive}
          onDelete={onDeleteIncentive}
        />
      )}
    </div>
  );
}
