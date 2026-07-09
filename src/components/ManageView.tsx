"use client";

import { useState } from "react";
import { Location, Student, Teacher } from "@/types";
import { formatYen } from "@/lib/utils";
import { currentGrade } from "@/lib/gradeUtils";
import TeacherFormModal from "./TeacherFormModal";
import StudentFormModal from "./StudentFormModal";
import LocationFormModal from "./LocationFormModal";

interface Props {
  teachers: Teacher[];
  students: Student[];
  locations: Location[];
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onSaveLocation: (location: Location) => void;
  onDeleteLocation: (id: string) => void;
}

export default function ManageView({
  teachers,
  students,
  locations,
  onSaveTeacher,
  onDeleteTeacher,
  onSaveStudent,
  onDeleteStudent,
  onSaveLocation,
  onDeleteLocation,
}: Props) {
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">講師管理</h3>
          <button
            onClick={() => {
              setEditingTeacher(null);
              setShowTeacherModal(true);
            }}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + 講師を追加
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="border-b border-slate-200 px-4 py-3">氏名</th>
                <th className="border-b border-slate-200 px-4 py-3">時給</th>
                <th className="border-b border-slate-200 px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">
                    {t.name}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 text-slate-500">
                    {formatYen(t.hourlyWage)} / 時
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingTeacher(t);
                        setShowTeacherModal(true);
                      }}
                      className="mr-2 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`${t.name} を削除しますか？担当中のコマは「講師未定」になります。`)) {
                          onDeleteTeacher(t.id);
                        }
                      }}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">生徒管理</h3>
          <button
            onClick={() => {
              setEditingStudent(null);
              setShowStudentModal(true);
            }}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + 生徒を追加
          </button>
        </div>
        <p className="mb-3 text-xs text-slate-400">
          学年は毎年4月1日（新年度）に自動で1つ進級します。
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="border-b border-slate-200 px-4 py-3">氏名</th>
                <th className="border-b border-slate-200 px-4 py-3">学年</th>
                <th className="border-b border-slate-200 px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">
                    {s.name}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 text-slate-500">
                    {currentGrade(s)}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingStudent(s);
                        setShowStudentModal(true);
                      }}
                      className="mr-2 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`${s.name} さんを削除しますか？時間割・指導カルテからも削除されます。`)) {
                          onDeleteStudent(s.id);
                        }
                      }}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">教える場所管理</h3>
          <button
            onClick={() => {
              setEditingLocation(null);
              setShowLocationModal(true);
            }}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + 場所を追加
          </button>
        </div>
        <p className="mb-3 text-xs text-slate-400">
          ここで登録した色が時間割の表示に反映されます。最後の1件は削除できません。
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="border-b border-slate-200 px-4 py-3">色</th>
                <th className="border-b border-slate-200 px-4 py-3">場所名</th>
                <th className="border-b border-slate-200 px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-3">
                    <span
                      className="inline-block h-4 w-4 rounded-full ring-1 ring-slate-200"
                      style={{ backgroundColor: l.color }}
                    />
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">
                    {l.name}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingLocation(l);
                        setShowLocationModal(true);
                      }}
                      className="mr-2 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      編集
                    </button>
                    <button
                      disabled={locations.length <= 1}
                      onClick={() => {
                        if (confirm(`${l.name} を削除しますか？`)) {
                          onDeleteLocation(l.id);
                        }
                      }}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showTeacherModal && (
        <TeacherFormModal
          teacher={editingTeacher ?? undefined}
          onClose={() => setShowTeacherModal(false)}
          onSave={onSaveTeacher}
        />
      )}
      {showStudentModal && (
        <StudentFormModal
          student={editingStudent ?? undefined}
          onClose={() => setShowStudentModal(false)}
          onSave={onSaveStudent}
        />
      )}
      {showLocationModal && (
        <LocationFormModal
          location={editingLocation ?? undefined}
          onClose={() => setShowLocationModal(false)}
          onSave={onSaveLocation}
        />
      )}
    </div>
  );
}
