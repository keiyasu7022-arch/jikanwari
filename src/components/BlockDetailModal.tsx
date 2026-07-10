"use client";

import { useState } from "react";
import { Lesson, Period, Student, Teacher } from "@/types";
import { LessonBlock } from "@/lib/calendarLayout";
import Modal from "./Modal";

interface Props {
  block: LessonBlock;
  teacher: Teacher | null;
  studentMap: Map<string, Student>;
  onClose: () => void;
  onRequestBulkEdit: () => void;
  onRequestBulkDelete: () => void;
  onRequestEditSingle: (period: Period, lesson: Lesson) => void;
  onSelectStudent: (studentId: string) => void;
}

export default function BlockDetailModal({
  block,
  teacher,
  studentMap,
  onClose,
  onRequestBulkEdit,
  onRequestBulkDelete,
  onRequestEditSingle,
  onSelectStudent,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isUndecided = block.teacherId === null;
  const totalLessons = block.entries.reduce((sum, e) => sum + e.lessons.length, 0);
  const isMulti = block.entries.length > 1 || totalLessons > 1;
  const firstPeriod = block.entries[0].period;
  const lastPeriod = block.entries[block.entries.length - 1].period;
  const periodRangeLabel = block.entries.length > 1
    ? `${firstPeriod.label}〜${lastPeriod.label}`
    : firstPeriod.label;

  return (
    <Modal title="コマの詳細" onClose={onClose} widthClass="max-w-lg">
      <div className="space-y-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">日付</span>
            <span className="font-medium text-slate-700">{block.entries[0].lessons[0].date}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">コマ</span>
            <span className="font-medium text-slate-700">{periodRangeLabel}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">担当講師</span>
            <span className="font-medium text-slate-700">
              {isUndecided ? "⚠ 講師未定" : teacher?.name ?? "-"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {block.entries.map(({ period, lessons }) => (
            <div key={period.id} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-600">
                  {period.label}（{period.time}）
                </span>
                <span>{lessons[0]?.location}</span>
              </div>
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="space-y-1">
                    <span className="text-xs font-medium text-slate-500">{lesson.subject}</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {lesson.studentIds.length === 0 && (
                        <span className="text-xs text-slate-400">生徒未設定</span>
                      )}
                      {lesson.studentIds.map((sid) => {
                        const student = studentMap.get(sid);
                        if (!student) return null;
                        return (
                          <button
                            key={sid}
                            onClick={() => onSelectStudent(sid)}
                            className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                          >
                            {student.name}
                          </button>
                        );
                      })}
                      {isMulti && (
                        <button
                          onClick={() => onRequestEditSingle(period, lesson)}
                          className="text-xs text-slate-400 hover:text-indigo-600"
                        >
                          この時限だけ編集する
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {confirmingDelete ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm">
            <p className="mb-2 text-rose-600">
              {periodRangeLabel}（{totalLessons}コマ）をまとめて削除します。よろしいですか？
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white"
              >
                キャンセル
              </button>
              <button
                onClick={onRequestBulkDelete}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
              >
                削除する
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50"
            >
              {isMulti ? "まとめて削除" : "このコマを削除"}
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                閉じる
              </button>
              <button
                onClick={onRequestBulkEdit}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {isMulti ? "まとめて編集" : "編集する"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
