"use client";

import { useState } from "react";
import Modal from "./Modal";
import { KarteEntry, Student, Teacher } from "@/types";
import { generateId } from "@/lib/utils";

interface Props {
  student: Student;
  teachers: Teacher[];
  onClose: () => void;
  onSave: (entry: KarteEntry) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function KarteEntryModal({ student, teachers, onClose, onSave }: Props) {
  const [date, setDate] = useState(today());
  const [subject, setSubject] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [content, setContent] = useState("");
  const [nextGoal, setNextGoal] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!subject.trim() || !content.trim()) {
      setError("科目と授業内容は必須です。");
      return;
    }
    onSave({
      id: generateId("k"),
      studentId: student.id,
      date,
      subject: subject.trim(),
      teacherName: teacherName.trim() || "（講師未定）",
      content: content.trim(),
      nextGoal: nextGoal.trim(),
    });
    onClose();
  };

  return (
    <Modal title={`${student.name} さんの指導記録を追加`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">科目</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="例: 数学"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">担当講師</label>
          <select
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">（講師未定）</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            授業内容・所見
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="今日の授業内容や生徒の様子を記録"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            次回の目標（任意）
          </label>
          <textarea
            value={nextGoal}
            onChange={(e) => setNextGoal(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
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
            保存
          </button>
        </div>
      </div>
    </Modal>
  );
}
