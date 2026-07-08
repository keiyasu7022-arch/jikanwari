"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Lesson, Teacher, WORK_LOCATIONS, WorkLocation } from "@/types";
import { LessonBlock } from "@/lib/calendarLayout";

interface Props {
  block: LessonBlock;
  teachers: Teacher[];
  onClose: () => void;
  onSave: (updatedLessons: Lesson[]) => void;
}

export default function BlockEditModal({ block, teachers, onClose, onSave }: Props) {
  const [subject, setSubject] = useState(block.subject);
  const [teacherId, setTeacherId] = useState<string>(block.teacherId ?? "");
  const [location, setLocation] = useState<WorkLocation>(block.entries[0].lesson.location);
  const [error, setError] = useState("");

  const isMulti = block.entries.length > 1;
  const periodRangeLabel = isMulti
    ? `${block.entries[0].period.label}〜${block.entries[block.entries.length - 1].period.label}`
    : block.entries[0].period.label;

  const handleSubmit = () => {
    if (!subject.trim()) {
      setError("科目を入力してください。");
      return;
    }
    const updated = block.entries.map(({ lesson }) => ({
      ...lesson,
      subject: subject.trim(),
      teacherId: teacherId === "" ? null : teacherId,
      location,
    }));
    onSave(updated);
    onClose();
  };

  return (
    <Modal title={isMulti ? "まとめて編集" : "コマを編集"} onClose={onClose} widthClass="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          {block.entries[0].lesson.date} の {periodRangeLabel}（{block.entries.length}コマ）
          {isMulti && "をまとめて"}変更します。生徒の割り当てはコマごとにそのまま維持されます。
        </p>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">場所</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value as WorkLocation)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {WORK_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">科目</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">担当講師</label>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">⚠ 講師未定</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {teacherId === "" && (
            <p className="mt-1 text-xs text-rose-500">
              講師未定のコマは時間割上で赤色で強調表示され、給与計算の対象外になります。
            </p>
          )}
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {isMulti ? "まとめて保存" : "保存"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
