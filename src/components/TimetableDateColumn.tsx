"use client";

import { memo, useMemo } from "react";
import { Lesson, Period, Student, Teacher } from "@/types";
import { buildDayBlocks, LessonBlock } from "@/lib/calendarLayout";
import { hexToRgba } from "@/lib/utils";

const ROW_HEIGHT = 92;
const FALLBACK_LOCATION_COLOR = "#94a3b8";

interface Props {
  date: string;
  lessons: Lesson[];
  periods: Period[];
  teacherMap: Map<string, Teacher>;
  studentMap: Map<string, Student>;
  locationColorMap: Map<string, string>;
  matchedLessonIds: Set<string> | null;
  onViewBlock: (block: LessonBlock) => void;
  onContinue: (
    date: string,
    periodId: number,
    prefill: {
      teacherId: string | null;
      subject: string;
      studentIds: string[];
      location: Lesson["location"];
    }
  ) => void;
}

function TimetableDateColumn({
  date,
  lessons,
  periods,
  teacherMap,
  studentMap,
  locationColorMap,
  matchedLessonIds,
  onViewBlock,
  onContinue,
}: Props) {
  const { blocks, laneCount } = useMemo(
    () => buildDayBlocks(lessons, periods),
    [lessons, periods]
  );

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
        const hasMatch = block.entries.some((e) =>
          e.lessons.some((lesson) => matchedLessonIds?.has(lesson.id))
        );
        const isDimmed = matchedLessonIds !== null && !hasMatch;
        const isHighlighted = matchedLessonIds !== null && hasMatch;
        const nextIndex = block.startIndex + block.span;
        const canContinue = nextIndex < periods.length && !occupied[nextIndex][block.lane];
        const lastEntry = block.entries[block.entries.length - 1];
        const lastLesson = lastEntry.lessons[lastEntry.lessons.length - 1];
        const teacherName = isUndecided ? null : teacherMap.get(block.teacherId!)?.name;
        const locationColor =
          locationColorMap.get(block.entries[0].lessons[0].location) ?? FALLBACK_LOCATION_COLOR;

        return (
          <div
            key={block.key}
            onClick={() => onViewBlock(block)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onViewBlock(block);
              }
            }}
            role="button"
            tabIndex={0}
            style={{
              gridColumn: block.lane + 1,
              gridRow: `${block.startIndex + 1} / span ${block.span}`,
              backgroundColor: hexToRgba(locationColor, 0.14),
              borderColor: locationColor,
            }}
            className={`m-1 flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-opacity ${
              isUndecided ? "ring-2 ring-rose-400" : ""
            } ${isDimmed ? "opacity-30" : ""} ${
              isHighlighted ? "ring-2 ring-amber-400" : ""
            } hover:brightness-95`}
          >
            <div
              className={`flex items-center justify-between gap-1 px-1.5 pt-1 text-[11px] font-semibold ${
                isUndecided ? "text-rose-600" : "text-slate-700"
              }`}
            >
              <span className="truncate">{isUndecided ? "⚠ 講師未定" : teacherName}</span>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
              {block.entries.map((entry) => (
                <div
                  key={entry.period.id}
                  className="flex flex-col gap-0.5 border-t border-white/70 px-1.5 py-1 text-left text-[11px] leading-tight text-slate-600 first:border-t-0"
                >
                  <span className="flex items-center justify-between gap-1 font-medium text-slate-500">
                    <span>{entry.period.label}</span>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            locationColorMap.get(entry.lessons[0].location) ??
                            FALLBACK_LOCATION_COLOR,
                        }}
                      />
                      {entry.lessons[0].location}
                    </span>
                  </span>
                  {entry.lessons.map((lesson) => (
                    <span key={lesson.id} className="flex items-baseline gap-1 truncate">
                      <span className="shrink-0 text-slate-400">{lesson.subject}</span>
                      <span className="truncate text-slate-500">{studentsLabel(lesson)}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
            {canContinue && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue(date, periods[nextIndex].id, {
                    teacherId: block.teacherId,
                    subject: lastLesson.subject,
                    studentIds: lastLesson.studentIds,
                    location: lastLesson.location,
                  });
                }}
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

export default memo(TimetableDateColumn);

export { ROW_HEIGHT };
