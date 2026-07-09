"use client";

import { useMemo, useState } from "react";
import { KarteEntry, Lesson, Location, PERIODS, Period, Student, Teacher } from "@/types";
import LessonFormModal from "./LessonFormModal";
import BlockDetailModal from "./BlockDetailModal";
import BlockEditModal from "./BlockEditModal";
import StudentHistoryModal from "./StudentHistoryModal";
import PasswordPromptModal from "./PasswordPromptModal";
import TimetableDateColumn, { ROW_HEIGHT } from "./TimetableDateColumn";
import { LessonBlock } from "@/lib/calendarLayout";
import { useAuth } from "@/context/AuthContext";
import {
  addDays,
  formatMonthDay,
  formatMonthDayRange,
  getMonday,
  toISODate,
  todayISO,
  weekdayLabel,
} from "@/lib/dateUtils";
import { getHolidayName } from "@/lib/holidayUtils";

interface Props {
  teachers: Teacher[];
  students: Student[];
  lessons: Lesson[];
  karteEntries: KarteEntry[];
  locations: Location[];
  onSaveLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
}

interface EditingTarget {
  date?: string;
  periodId?: number;
  lesson?: Lesson;
  defaultTeacherId?: string | null;
  defaultSubject?: string;
  defaultStudentIds?: string[];
  defaultLocation?: string;
}

export default function TimetableView({
  teachers,
  students,
  lessons,
  karteEntries,
  locations,
  onSaveLesson,
  onDeleteLesson,
}: Props) {
  const { unlocked } = useAuth();
  const [search, setSearch] = useState("");
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [viewingBlock, setViewingBlock] = useState<LessonBlock | null>(null);
  const [bulkEditingBlock, setBulkEditingBlock] = useState<LessonBlock | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireAuth = (action: () => void) => {
    if (unlocked) {
      action();
    } else {
      setPendingAction(() => action);
    }
  };

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
  const locationColorMap = useMemo(
    () => new Map(locations.map((l) => [l.name, l.color])),
    [locations]
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

  const openSingleEditFromBlock = (period: Period, lesson: Lesson) => {
    setViewingBlock(null);
    requireAuth(() => setEditing({ date: lesson.date, periodId: lesson.periodId, lesson }));
  };

  const openBulkEdit = () => {
    const block = viewingBlock;
    if (!block) return;
    setViewingBlock(null);
    requireAuth(() => setBulkEditingBlock(block));
  };

  const handleBulkEditSave = (updatedLessons: Lesson[]) => {
    updatedLessons.forEach((l) => onSaveLesson(l));
    setBulkEditingBlock(null);
  };

  const openBulkDelete = () => {
    const block = viewingBlock;
    if (!block) return;
    requireAuth(() => {
      block.entries.forEach(({ lesson }) => onDeleteLesson(lesson.id));
      setViewingBlock(null);
    });
  };

  const openStudentHistory = (studentId: string) => {
    const student = studentMap.get(studentId);
    if (student) setViewingStudent(student);
  };

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
          <button
            onClick={() => requireAuth(() => setEditing({}))}
            className="ml-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + コマ追加
          </button>
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
              const holidayName = getHolidayName(date);
              return (
                <div
                  key={iso}
                  className={`px-3 py-3 text-center text-xs font-semibold ${
                    isToday ? "text-indigo-600" : holidayName ? "text-rose-500" : "text-slate-500"
                  } ${holidayName ? "bg-rose-50/60" : ""}`}
                >
                  {formatMonthDay(date)}（{weekdayLabel(date)}）
                  {isToday && (
                    <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-600">
                      今日
                    </span>
                  )}
                  {holidayName && (
                    <div className="mt-0.5 truncate text-[10px] font-normal text-rose-400">
                      {holidayName}
                    </div>
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
              const holidayName = getHolidayName(date);
              return (
                <div
                  key={iso}
                  className={`border-l border-slate-100 ${holidayName ? "bg-rose-50/30" : ""}`}
                >
                  <TimetableDateColumn
                    lessons={lessonsByDate.get(iso) ?? []}
                    periods={PERIODS}
                    teacherMap={teacherMap}
                    studentMap={studentMap}
                    locationColorMap={locationColorMap}
                    matchedLessonIds={matchedLessonIds}
                    onViewBlock={(block) => setViewingBlock(block)}
                    onContinue={(periodId, prefill) =>
                      requireAuth(() =>
                        setEditing({
                          date: iso,
                          periodId,
                          defaultTeacherId: prefill.teacherId,
                          defaultSubject: prefill.subject,
                          defaultStudentIds: prefill.studentIds,
                          defaultLocation: prefill.location,
                        })
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        {locations.map((l) => (
          <div key={l.id} className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full ring-1 ring-slate-200"
              style={{ backgroundColor: l.color }}
            />
            {l.name}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-2 ring-rose-400" />
          講師未定（要割り当て）
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-2 ring-amber-400" />
          検索一致
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-rose-50" />
          祝日
        </div>
        <div>同じ講師・科目のコマが連続する場合は1つのブロックとして連結表示されます（生徒の入れ替えも可）。クリックすると連続するコマをまとめて確認・編集・削除できます。</div>
      </div>

      {editing && (
        <LessonFormModal
          date={editing.date}
          periodId={editing.periodId}
          teachers={teachers}
          students={students}
          locations={locations}
          lesson={editing.lesson}
          defaultTeacherId={editing.defaultTeacherId}
          defaultSubject={editing.defaultSubject}
          defaultStudentIds={editing.defaultStudentIds}
          defaultLocation={editing.defaultLocation}
          onClose={() => setEditing(null)}
          onSave={onSaveLesson}
          onDelete={onDeleteLesson}
        />
      )}

      {viewingBlock && (
        <BlockDetailModal
          block={viewingBlock}
          teacher={viewingBlock.teacherId ? teacherMap.get(viewingBlock.teacherId) ?? null : null}
          studentMap={studentMap}
          onClose={() => setViewingBlock(null)}
          onRequestBulkEdit={openBulkEdit}
          onRequestBulkDelete={openBulkDelete}
          onRequestEditSingle={openSingleEditFromBlock}
          onSelectStudent={openStudentHistory}
        />
      )}

      {bulkEditingBlock && (
        <BlockEditModal
          block={bulkEditingBlock}
          teachers={teachers}
          locations={locations}
          onClose={() => setBulkEditingBlock(null)}
          onSave={handleBulkEditSave}
        />
      )}

      {viewingStudent && (
        <StudentHistoryModal
          student={viewingStudent}
          karteEntries={karteEntries}
          onClose={() => setViewingStudent(null)}
        />
      )}

      {pendingAction && (
        <PasswordPromptModal
          onClose={() => setPendingAction(null)}
          onSuccess={() => {
            const action = pendingAction;
            setPendingAction(null);
            action();
          }}
        />
      )}
    </div>
  );
}
