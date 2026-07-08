"use client";

import { Lesson, Period, Student, Teacher } from "@/types";
import Modal from "./Modal";

interface Props {
  lesson: Lesson;
  period: Period;
  teacher: Teacher | null;
  students: Student[];
  onClose: () => void;
  onRequestEdit: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-700">{value}</span>
    </div>
  );
}

export default function LessonDetailModal({
  lesson,
  period,
  teacher,
  students,
  onClose,
  onRequestEdit,
}: Props) {
  return (
    <Modal title="コマの詳細" onClose={onClose} widthClass="max-w-md">
      <div className="space-y-3 text-sm">
        <Row label="日付" value={lesson.date} />
        <Row label="コマ" value={`${period.label}（${period.time}）`} />
        <Row label="場所" value={lesson.location} />
        <Row label="科目" value={lesson.subject} />
        <Row label="担当講師" value={teacher ? teacher.name : "⚠ 講師未定"} />
        <Row
          label="生徒"
          value={students.length > 0 ? students.map((s) => s.name).join("、") : "-"}
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          閉じる
        </button>
        <button
          onClick={onRequestEdit}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          編集する
        </button>
      </div>
    </Modal>
  );
}
