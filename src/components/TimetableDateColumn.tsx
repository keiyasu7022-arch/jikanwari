"use client";

import { Lesson, Period, Student, Teacher } from "@/types";
import { buildDayBlocks } from "@/lib/calendarLayout";

const ROW_HEIGHT = 92;

interface Props {
  lessons: Lesson[];
  periods: Period[];
  teacherMap: Map<string, Teacher>;
  studentMap: Map<string, Student>;
  matchedLessonIds: Set<string> | null;
  onEdit: (periodId: number, lesson: Lesson) => void;
  onContinue: (
    periodId: number,
    prefill: {
      teacherId: string | null;
      subject: string;
      studentIds: string[];
      location: Lesson["location"];
    }
  ) => void;
}

export default function TimetableDateColumn({
  lessons,
  periods,
  teacherMap,
  studentMap,
  matchedLessonIds,
  onEdit,
  onContinue,
}: Props) {
  const { blocks, laneCount } = buildDayBlocks(lessons, periods);

  const occupied: boolean[][] = periods.map(() => Array(laneCount).fill(false));
  for (const block of blocks) {
    for (let i = block.startIndex; i < block.startIndex + block.span; i++) {
      occupied[i][block.lane] = true;
    }
  }

  const studentsLabel = (lesson: Lesson) =>
    lesson.studentIds
      .map((id) => studentMap.get(id)?.name)
      .filter(Boolean)
      .join("、");

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${laneCount}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${periods.length}, ${ROW_HEIGHT}px)`,
      }}
    >
      {blocks.map((block) => {
        const isUndecided = block.teacherId === null;
        const hasMatch = block.entries.some((e) => matchedLessonIds?.has(e.lesson.id));
        const isDimmed = matchedLessonIds !== null && !hasMatch;
        const isHighlighted = matchedLessonIds !== null && hasMatch;
        const nextIndex = block.startIndex + block.span;
        const canContinue = nextIndex < periods.length && !occupied[nextIndex][block.lane];
        const lastEntry = block.entries[block.entries.length - 1];
        const teacherName = isUndecided ? null : teacherMap.get(block.teacherId!)?.name;

        return (
          <div
            key={block.key}
            style={{
              gridColumn: block.lane + 1,
              gridRow: `${block.startIndex + 1} / span ${block.span}`,
            }}
            className={`m-1 flex flex-col overflow-hidden rounded-lg border text-left transition-opacity ${
              isUndecided
                ? "border-rose-300 bg-rose-50"
                : "border-indigo-200 bg-indigo-50"
            } ${isDimmed ? "opacity-30" : ""} ${
              isHighlighted ? "ring-2 ring-amber-400" : ""
            }`}
          >
            <div
              className={`flex items-center justify-between gap-1 px-1.5 pt-1 text-[11px] font-semibold ${
                isUndecided ? "text-rose-600" : "text-indigo-700"
              }`}
            >
              <span className="truncate">{isUndecided ? "⚠ 講師未定" : teacherName}</span>
              <span className="shrink-0 text-slate-400">{block.subject}</span>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
              {block.entries.map((entry) => (
                <button
                  key={entry.lesson.id}
                  onClick={() => onEdit(entry.period.id, entry.lesson)}
                  className="flex flex-col gap-0.5 border-t border-white/70 px-1.5 py-1 text-left text-[11px] leading-tight text-slate-600 first:border-t-0 hover:bg-white/70"
                >
                  <span className="flex items-center justify-between gap-1 font-medium text-slate-500">
                    <span>{entry.period.label}</span>
                    <span className="shrink-0 text-[10px] text-slate-400">{entry.lesson.location}</span>
                  </span>
                  <span className="truncate text-slate-500">{studentsLabel(entry.lesson)}</span>
                </button>
              ))}
            </div>
            {canContinue && (
              <button
                onClick={() =>
                  onContinue(periods[nextIndex].id, {
                    teacherId: block.teacherId,
                    subject: block.subject,
                    studentIds: lastEntry.lesson.studentIds,
                    location: lastEntry.lesson.location,
                  })
                }
                className="border-t border-white/70 px-1.5 py-1 text-[10px] text-slate-400 hover:bg-white/70 hover:text-indigo-600"
              >
                + 続けて追加
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { ROW_HEIGHT };
