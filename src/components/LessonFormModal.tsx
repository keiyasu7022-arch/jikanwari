"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Lesson, PERIODS, Student, Teacher, WORK_LOCATIONS, WorkLocation } from "@/types";
import { generateId } from "@/lib/utils";
import { addDays, parseISODate, todayISO, toISODate } from "@/lib/dateUtils";
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
  const [subject, setSubject] = useState(lesson?.subject ?? defaultSubject ?? "");
  const [teacherId, setTeacherId] = useState<string>(
    lesson?.teacherId ?? defaultTeacherId ?? ""
  );
  const [location, setLocation] = useState<WorkLocation>(
    lesson?.location ?? defaultLocation ?? WORK_LOCATIONS[0]
  );
  const [error, setError] = useState("");

  // 編集時は既存の1コマのみを対象にする
  const [editStudentIds, setEditStudentIds] = useState<string[]>(lesson?.studentIds ?? []);
  const [editPeriodId, setEditPeriodId] = useState(lesson?.periodId ?? periodId ?? PERIODS[0].id);

  // 新規作成時は複数コマをまとめて選択できるようにする
  const [selectedPeriodIds, setSelectedPeriodIds] = useState<number[]>(
    periodId ? [periodId] : []
  );
  const [studentIdsByPeriod, setStudentIdsByPeriod] = useState<Record<number, string[]>>(
    periodId ? { [periodId]: defaultStudentIds ?? [] } : {}
  );

  // 曜日固定で毎週繰り返し登録する場合の設定（新規作成時のみ）
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatUntil, setRepeatUntil] = useState("");

  const isEditing = Boolean(lesson);

  const toggleEditStudent = (id: string) => {
    setEditStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const togglePeriod = (pid: number) => {
    if (selectedPeriodIds.includes(pid)) {
      setSelectedPeriodIds(selectedPeriodIds.filter((p) => p !== pid));
      const rest = { ...studentIdsByPeriod };
      delete rest[pid];
      setStudentIdsByPeriod(rest);
    } else {
      const base =
        selectedPeriodIds.length > 0
          ? studentIdsByPeriod[selectedPeriodIds[0]] ?? []
          : defaultStudentIds ?? [];
      setSelectedPeriodIds([...selectedPeriodIds, pid].sort((a, b) => a - b));
      setStudentIdsByPeriod({ ...studentIdsByPeriod, [pid]: [...base] });
    }
  };

  const toggleStudentForPeriod = (pid: number, studentId: string) => {
    const current = studentIdsByPeriod[pid] ?? [];
    const next = current.includes(studentId)
      ? current.filter((s) => s !== studentId)
      : [...current, studentId];
    setStudentIdsByPeriod({ ...studentIdsByPeriod, [pid]: next });
  };

  const handleSubmitEdit = () => {
    if (!subject.trim()) {
      setError("科目を入力してください。");
      return;
    }
    if (editStudentIds.length === 0) {
      setError("生徒を1人以上選択してください。");
      return;
    }
    onSave({
      id: lesson!.id,
      date: selectedDate,
      periodId: editPeriodId,
      subject: subject.trim(),
      teacherId: teacherId === "" ? null : teacherId,
      studentIds: editStudentIds,
      location,
    });
    onClose();
  };

  const handleSubmitCreate = () => {
    if (!subject.trim()) {
      setError("科目を入力してください。");
      return;
    }
    if (selectedPeriodIds.length === 0) {
      setError("コマを1つ以上選択してください。");
      return;
    }
    const hasEmptyPeriod = selectedPeriodIds.some(
      (pid) => (studentIdsByPeriod[pid] ?? []).length === 0
    );
    if (hasEmptyPeriod) {
      setError("選択した各コマに生徒を1人以上選択してください。");
      return;
    }
    if (repeatEnabled && (!repeatUntil || repeatUntil < selectedDate)) {
      setError("繰り返し終了日を正しく入力してください。");
      return;
    }

    const dates = [selectedDate];
    if (repeatEnabled) {
      let cursor = addDays(parseISODate(selectedDate), 7);
      const end = parseISODate(repeatUntil);
      while (cursor <= end) {
        dates.push(toISODate(cursor));
        cursor = addDays(cursor, 7);
      }
    }

    dates.forEach((d) => {
      selectedPeriodIds.forEach((pid) => {
        onSave({
          id: generateId("l"),
          date: d,
          periodId: pid,
          subject: subject.trim(),
          teacherId: teacherId === "" ? null : teacherId,
          studentIds: studentIdsByPeriod[pid] ?? [],
          location,
        });
      });
    });
    onClose();
  };

  return (
    <Modal title={isEditing ? "コマを編集" : "コマを追加"} onClose={onClose}>
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
          {isEditing && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">コマ</label>
              <select
                value={editPeriodId}
                onChange={(e) => setEditPeriodId(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {PERIODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}（{p.time}）
                  </option>
                ))}
              </select>
            </div>
          )}
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

        {isEditing ? (
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
                    checked={editStudentIds.includes(s.id)}
                    onChange={() => toggleEditStudent(s.id)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{s.name}</span>
                  <span className="text-xs text-slate-400">{currentGrade(s)}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                コマ（複数選択可・同じ講師・科目・場所でまとめて登録できます）
              </label>
              <div className="flex flex-wrap gap-2">
                {PERIODS.map((p) => {
                  const checked = selectedPeriodIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePeriod(p.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        checked
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={repeatEnabled}
                  onChange={(e) => setRepeatEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                毎週繰り返す（曜日固定の生徒・講師向け）
              </label>
              {repeatEnabled && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-slate-500">終了日</span>
                  <input
                    type="date"
                    value={repeatUntil}
                    min={selectedDate}
                    onChange={(e) => setRepeatUntil(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-400">
                    まで、同じ曜日・コマで毎週登録します
                  </span>
                </div>
              )}
            </div>

            {selectedPeriodIds.length > 0 && (
              <div className="space-y-3">
                {selectedPeriodIds.map((pid) => {
                  const period = PERIODS.find((p) => p.id === pid)!;
                  const ids = studentIdsByPeriod[pid] ?? [];
                  return (
                    <div key={pid}>
                      <label className="mb-1 block text-sm font-medium text-slate-600">
                        {period.label}の生徒（複数選択可）
                      </label>
                      <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
                        {students.map((s) => (
                          <label
                            key={s.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              checked={ids.includes(s.id)}
                              onChange={() => toggleStudentForPeriod(pid, s.id)}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{s.name}</span>
                            <span className="text-xs text-slate-400">{currentGrade(s)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

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
              onClick={isEditing ? handleSubmitEdit : handleSubmitCreate}
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
