"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Teacher, TeacherIncentive } from "@/types";
import { generateId, formatYen } from "@/lib/utils";

interface Props {
  teacher: Teacher;
  incentives: TeacherIncentive[];
  onClose: () => void;
  onAdd: (incentive: TeacherIncentive) => void;
  onDelete: (id: string) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function TeacherIncentiveModal({
  teacher,
  incentives,
  onClose,
  onAdd,
  onDelete,
}: Props) {
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const entries = incentives
    .filter((i) => i.teacherId === teacher.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const handleAdd = () => {
    if (!amount) {
      setError("金額を入力してください。");
      return;
    }
    if (!reason.trim()) {
      setError("理由を入力してください。");
      return;
    }
    onAdd({
      id: generateId("inc"),
      teacherId: teacher.id,
      date,
      amount,
      reason: reason.trim(),
    });
    setAmount(0);
    setReason("");
    setError("");
  };

  return (
    <Modal title={`${teacher.name} のインセンティブ`} onClose={onClose} widthClass="max-w-lg">
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 p-3">
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
              <label className="mb-1 block text-sm font-medium text-slate-600">金額（円）</label>
              <input
                type="number"
                min={0}
                step={500}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-600">理由</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例: 生徒紹介インセンティブ"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleAdd}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              追加する
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-600">履歴</p>
          {entries.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              まだインセンティブの記録がありません。
            </p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{entry.date}</span>
                      <span className="font-semibold text-indigo-600">
                        {formatYen(entry.amount)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-500">{entry.reason}</p>
                  </div>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="shrink-0 text-xs text-rose-500 hover:underline"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            閉じる
          </button>
        </div>
      </div>
    </Modal>
  );
}
