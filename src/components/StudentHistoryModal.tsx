"use client";

import Link from "next/link";
import { KarteEntry, Student } from "@/types";
import { currentGrade } from "@/lib/gradeUtils";
import Modal from "./Modal";

interface Props {
  student: Student;
  karteEntries: KarteEntry[];
  onClose: () => void;
}

export default function StudentHistoryModal({ student, karteEntries, onClose }: Props) {
  const entries = karteEntries
    .filter((e) => e.studentId === student.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <Modal title={`${student.name} の指導記録`} onClose={onClose} widthClass="max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">{currentGrade(student)}</p>
        <Link
          href={`/karte?student=${student.id}`}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          指導カルテページで見る →
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">まだ指導記録がありません。</p>
      ) : (
        <ol className="max-h-96 space-y-3 overflow-y-auto">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
              <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{entry.date}</span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">
                  {entry.subject}
                </span>
                <span>担当: {entry.teacherName}</span>
              </div>
              <p className="text-sm text-slate-700">{entry.content}</p>
              {entry.nextGoal && (
                <p className="mt-1.5 text-sm text-slate-500">
                  <span className="font-medium text-slate-600">次回の目標: </span>
                  {entry.nextGoal}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          閉じる
        </button>
      </div>
    </Modal>
  );
}
