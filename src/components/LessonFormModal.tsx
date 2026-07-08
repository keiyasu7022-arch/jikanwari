"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Lesson, PERIODS, Student, Teacher, WORK_LOCATIONS, WorkLocation } from "@/types";
import { generateId } from "@/lib/utils";
import { todayISO } from "@/lib/dateUtils";
import { currentGrade } from "@/lib/gradeUtils";

interface Props {
  date?: string;
  periodId?: number;
  teachers: Teacher[];
  students: Student[];
  lesson?: Lesson;
  defaultTeacherId?: string | null;
  defaultSubject?: string;
  defaultStudentIds?: string[];
  defaultLocation?: WorkLocation;
  onClose: () => void;
  onSave: (lesson: Lesson) => void;
  onDelete?: (id: string) => void;
}

export default function LessonFormModal({
  date,
  periodId,
  teachers,
  students,
  lesson,
  defaultTeacherId,
  defaultSubject,
  defaultStudentIds,
  defaultLocation,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [selectedDate, setSelectedDate] = useState(date ?? todayISO());
  const [selectedPeriodId, setSelectedPeriodId] = useState(periodId ?? PERIODS[0].id);
  const [subject, setSubject] = useState(lesson?.subject ?? defaultSubject ?? "");
  const [teacherId, setTeacherId] = useState<string>(
    lesson?.teacherId ?? defaultTeacherId ?? ""
  );
  const [studentIds, setStudentIds] = useState<string[]>(
    lesson?.studentIds ?? defaultStudentIds ?? []
  );
  const [location, setLocation] = useState<WorkLocation>(
    lesson?.location ?? defaultLocation ?? WORK_LOCATIONS[0]
  );
  const [error, setError] = useState("");

  const toggleStudent = (id: string) => {
    setStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!subject.trim()) {
      setError("科目を入力してください。");
      return;
    }
    if (studentIds.length === 0) {
      setError("生徒を1人以上選択してください。");
      return;
    }
    onSave({
      id: lesson?.id ?? generateId("l"),
      date: selectedDate,
      periodId: selectedPeriodId,
      subject: subject.trim(),
      teacherId: teacherId === "" ? null : teacherId,
      studentIds,
      location,
    });
    onClose();
  };

  return (
    <Modal title={lesson ? "コマを編集" : "コマを追加"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">日付</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">コマ</label>
            <select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}（{p.time}）
                </option>
              ))}
            </select>
          </div>
        </div>

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
            placeholder="例: 数学"
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
                {t.name}（{t.subject}）
              </option>
            ))}
          </select>
          {teacherId === "" && (
            <p className="mt-1 text-xs text-rose-500">
              講師未定のコマは時間割上で赤色で強調表示され、給与計算の対象外になります。
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            生徒（複数選択可・前後のコマと異なる生徒でもOK）
          </label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {students.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={studentIds.includes(s.id)}
                  onChange={() => toggleStudent(s.id)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{s.name}</span>
                <span className="text-xs text-slate-400">{currentGrade(s)}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <div>
            {lesson && onDelete && (
              <button
                onClick={() => {
                  onDelete(lesson.id);
                  onClose();
                }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50"
              >
                このコマを削除
              </button>
            )}
          </div>
          <div className="flex gap-2">
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
      </div>
    </Modal>
  );
}
