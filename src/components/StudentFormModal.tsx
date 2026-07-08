"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Student } from "@/types";
import { generateId } from "@/lib/utils";
import { currentGrade, getFiscalYear, GRADE_LEVELS } from "@/lib/gradeUtils";

interface Props {
  student?: Student;
  onClose: () => void;
  onSave: (student: Student) => void;
}

export default function StudentFormModal({ student, onClose, onSave }: Props) {
  const [name, setName] = useState(student?.name ?? "");
  const [grade, setGrade] = useState(
    student ? currentGrade(student) : GRADE_LEVELS[0]
  );
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("氏名を入力してください。");
      return;
    }
    onSave({
      id: student?.id ?? generateId("s"),
      name: name.trim(),
      grade,
      gradeYear: getFiscalYear(new Date()),
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
          <label className="mb-1 block text-sm font-medium text-slate-600">
            学年（現時点）
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {GRADE_LEVELS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            ここで設定した学年を基準に、毎年4月1日（新年度）になると自動的に1つ進級して表示されます。
          </p>
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
