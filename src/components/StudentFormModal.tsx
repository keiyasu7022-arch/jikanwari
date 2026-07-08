"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Student } from "@/types";
import { generateId } from "@/lib/utils";

interface Props {
  student?: Student;
  onClose: () => void;
  onSave: (student: Student) => void;
}

export default function StudentFormModal({ student, onClose, onSave }: Props) {
  const [name, setName] = useState(student?.name ?? "");
  const [grade, setGrade] = useState(student?.grade ?? "");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !grade.trim()) {
      setError("氏名と学年は必須です。");
      return;
    }
    onSave({
      id: student?.id ?? generateId("s"),
      name: name.trim(),
      grade: grade.trim(),
    });
    onClose();
  };

  return (
    <Modal title={student ? "生徒情報を編集" : "生徒を追加"} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">氏名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">学年</label>
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="例: 中学2年"
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
