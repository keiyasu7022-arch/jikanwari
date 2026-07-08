"use client";

import { useMemo, useState } from "react";
import { Lesson, PERIODS, Student, Teacher } from "@/types";
import LessonFormModal from "./LessonFormModal";
import TimetableDateColumn, { ROW_HEIGHT } from "./TimetableDateColumn";
import {
  addDays,
  formatMonthDay,
  formatMonthDayRange,
  getMonday,
  toISODate,
  todayISO,
  weekdayLabel,
} from "@/lib/dateUtils";

interface Props {
  teachers: Teacher[];
  students: Student[];
  lessons: Lesson[];
  onSaveLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
}

interface EditingTarget {
  date: string;
  periodId: number;
  lesson?: Lesson;
  defaultTeacherId?: string | null;
  defaultSubject?: string;
  defaultStudentIds?: string[];
}

export default function TimetableView({
  teachers,
  students,
  lessons,
  onSaveLesson,
  onDeleteLesson,
}: Props) {
  const [search, setSearch] = useState("");
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [editing, setEditing] = useState<EditingTarget | null>(null);

  const weekDates = useMemo(
    () => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const today = todayISO();

  const teacherMap = useMemo(
    () => new Map(teachers.map((t) => [t.id, t])),
    [teachers]
  );
  const studentMap = useMemo(
    () => new Map(students.map((s) => [s.id, s])),
    [students]
  );

  const lessonsByDate = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const lesson of lessons) {
      const arr = map.get(lesson.date) ?? [];
      arr.push(lesson);
      map.set(lesson.date, arr);
    }
    return map;
  }, [lessons]);

  const matchedLessonIds = useMemo(() => {
    if (!search.trim()) return null;
    const term = search.trim().toLowerCase();
    const ids = new Set<string>();
    for (const lesson of lessons) {
      const teacherName = lesson.teacherId
        ? teacherMap.get(lesson.teacherId)?.name ?? ""
        : "";
      const studentNames = lesson.studentIds
        .map((id) => studentMap.get(id)?.name ?? "")
        .join(" ");
      if (
        teacherName.toLowerCase().includes(term) ||
        studentNames.toLowerCase().includes(term)
      ) {
        ids.add(lesson.id);
      }
    }
    return ids;
  }, [search, lessons, teacherMap, studentMap]);

  const undecidedCount = useMemo(() => {
    const isoSet = new Set(weekDates.map(toISODate));
    return lessons.filter((l) => l.teacherId === null && isoSet.has(l.date)).length;
  }, [lessons, weekDates]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-3">
        <div className="relative w-full justify-self-start sm:max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="講師名・生徒名で絞り込み"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="justify-self-start sm:justify-self-center">
          {undecidedCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600">
              ⚠ 講師未定のコマが {undecidedCount} 件あります
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 justify-self-start sm:justify-self-end">
          <button
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            ◀ 前週
          </button>
          <button
            onClick={() => setWeekStart(getMonday(new Date()))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            今週
          </button>
          <button
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            次週 ▶
          </button>
          <span className="ml-1 text-sm font-medium text-slate-600">
            {formatMonthDayRange(weekDates[0], weekDates[weekDates.length - 1])}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div style={{ minWidth: 96 + weekDates.length * 200 }}>
          <div
            className="grid border-b border-slate-200 bg-slate-50"
            style={{ gridTemplateColumns: `96px repeat(${weekDates.length}, minmax(200px, 1fr))` }}
          >
            <div className="border-r border-slate-200 px-3 py-3 text-xs font-semibold text-slate-500">
              コマ
            </div>
            {weekDates.map((date) => {
              const iso = toISODate(date);
              const isToday = iso === today;
              return (
                <div
                  key={iso}
                  className={`px-3 py-3 text-center text-xs font-semibold ${
                    isToday ? "text-indigo-600" : "text-slate-500"
                  }`}
                >
                  {formatMonthDay(date)}（{weekdayLabel(date)}）
                  {isToday && (
                    <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-600">
                      今日
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div
            className="grid"
            style={{ gridTemplateColumns: `96px repeat(${weekDates.length}, minmax(200px, 1fr))` }}
          >
            <div
              className="grid border-r border-slate-200 bg-slate-50"
              style={{ gridTemplateRows: `repeat(${PERIODS.length}, ${ROW_HEIGHT}px)` }}
            >
              {PERIODS.map((period) => (
                <div key={period.id} className="border-b border-slate-100 px-3 py-2 text-xs">
                  <div className="font-semibold text-slate-700">{period.label}</div>
                  <div className="text-slate-400">{period.time}</div>
                </div>
              ))}
            </div>

            {weekDates.map((date) => {
              const iso = toISODate(date);
              return (
                <div key={iso} className="border-l border-slate-100">
                  <TimetableDateColumn
                    lessons={lessonsByDate.get(iso) ?? []}
                    periods={PERIODS}
                    teacherMap={teacherMap}
                    studentMap={studentMap}
                    matchedLessonIds={matchedLessonIds}
                    onAdd={(periodId) => setEditing({ date: iso, periodId })}
                    onEdit={(periodId, lesson) => setEditing({ date: iso, periodId, lesson })}
                    onContinue={(periodId, prefill) =>
                      setEditing({
                        date: iso,
                        periodId,
                        defaultTeacherId: prefill.teacherId,
                        defaultSubject: prefill.subject,
                        defaultStudentIds: prefill.studentIds,
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-indigo-200 bg-indigo-50" />
          講師決定済み
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-rose-300 bg-rose-50" />
          講師未定（要割り当て）
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-2 ring-amber-400" />
          検索一致
        </div>
        <div>同じ講師・科目のコマが連続する場合は1つのブロックとして連結表示されます（生徒の入れ替えも可）。</div>
      </div>

      {editing && (
        <LessonFormModal
          date={editing.date}
          periodId={editing.periodId}
          teachers={teachers}
          students={students}
          lesson={editing.lesson}
          defaultTeacherId={editing.defaultTeacherId}
          defaultSubject={editing.defaultSubject}
          defaultStudentIds={editing.defaultStudentIds}
          onClose={() => setEditing(null)}
          onSave={onSaveLesson}
          onDelete={onDeleteLesson}
        />
      )}
    </div>
  );
}
