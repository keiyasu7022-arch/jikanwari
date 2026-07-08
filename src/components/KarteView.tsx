"use client";

import { useMemo, useState } from "react";
import { KarteEntry, Student, Teacher } from "@/types";
import KarteEntryModal from "./KarteEntryModal";

interface Props {
  students: Student[];
  teachers: Teacher[];
  karteEntries: KarteEntry[];
  onAddEntry: (entry: KarteEntry) => void;
}

export default function KarteView({ students, teachers, karteEntries, onAddEntry }: Props) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(students[0]?.id ?? null);
  const [showModal, setShowModal] = useState(false);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((s) => s.name.toLowerCase().includes(term));
  }, [students, search]);

  const selectedStudent = students.find((s) => s.id === selectedId) ?? null;

  const entries = useMemo(
    () =>
      karteEntries
        .filter((e) => e.studentId === selectedId)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [karteEntries, selectedId]
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="生徒名で検索"
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <ul className="max-h-[560px] overflow-y-auto">
          {filteredStudents.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setSelectedId(s.id)}
                className={`w-full border-b border-slate-50 px-4 py-3 text-left text-sm transition-colors ${
                  selectedId === s.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-slate-400">{s.grade}</div>
              </button>
            </li>
          ))}
          {filteredStudents.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-400">
              該当する生徒がいません
            </li>
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {selectedStudent ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedStudent.name}</h3>
                <p className="text-sm text-slate-400">{selectedStudent.grade}</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                + 記録を追加
              </button>
            </div>

            {entries.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">
                まだ指導記録がありません。
              </p>
            ) : (
              <ol className="space-y-3">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/60 p-4"
                  >
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
          </>
        ) : (
          <p className="py-10 text-center text-sm text-slate-400">生徒を選択してください</p>
        )}
      </div>

      {showModal && selectedStudent && (
        <KarteEntryModal
          student={selectedStudent}
          teachers={teachers}
          onClose={() => setShowModal(false)}
          onSave={onAddEntry}
        />
      )}
    </div>
  );
}
