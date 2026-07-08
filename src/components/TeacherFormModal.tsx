"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Teacher } from "@/types";
import { generateId } from "@/lib/utils";

interface Props {
  teacher?: Teacher;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
}

export default function TeacherFormModal({ teacher, onClose, onSave }: Props) {
  const [name, setName] = useState(teacher?.name ?? "");
  const [hourlyWage, setHourlyWage] = useState(teacher?.hourlyWage ?? 2000);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("氏名は必須です。");
      return;
    }
    onSave({
      id: teacher?.id ?? generateId("t"),
      name: name.trim(),
      hourlyWage,
    });
    onClose();
  };

  return (
    <Modal title={teacher ? "講師情報を編集" : "講師を追加"} onClose={onClose}>
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
          <label className="mb-1 block text-sm font-medium text-slate-600">時給（円）</label>
          <input
            type="number"
            min={0}
            step={50}
            value={hourlyWage}
            onChange={(e) => setHourlyWage(Number(e.target.value) || 0)}
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
