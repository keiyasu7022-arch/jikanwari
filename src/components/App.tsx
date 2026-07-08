"use client";

import { useState } from "react";
import { KarteEntry, Lesson, Student, Teacher } from "@/types";
import { initialKarteEntries, initialLessons, initialStudents, initialTeachers } from "@/lib/mockData";
import TabNav, { TabKey } from "./TabNav";
import TimetableView from "./TimetableView";
import KarteView from "./KarteView";
import SalaryView from "./SalaryView";
import ManageView from "./ManageView";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("timetable");
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [karteEntries, setKarteEntries] = useState<KarteEntry[]>(initialKarteEntries);

  const handleSaveLesson = (lesson: Lesson) => {
    setLessons((prev) => {
      const exists = prev.some((l) => l.id === lesson.id);
      return exists ? prev.map((l) => (l.id === lesson.id ? lesson : l)) : [...prev, lesson];
    });
  };

  const handleDeleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSaveTeacher = (teacher: Teacher) => {
    setTeachers((prev) => {
      const exists = prev.some((t) => t.id === teacher.id);
      return exists ? prev.map((t) => (t.id === teacher.id ? teacher : t)) : [...prev, teacher];
    });
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    setLessons((prev) =>
      prev.map((l) => (l.teacherId === id ? { ...l, teacherId: null } : l))
    );
  };

  const handleUpdateWage = (teacherId: string, wage: number) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, hourlyWage: wage } : t))
    );
  };

  const handleSaveStudent = (student: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === student.id);
      return exists ? prev.map((s) => (s.id === student.id ? student : s)) : [...prev, student];
    });
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setLessons((prev) =>
      prev
        .map((l) => ({ ...l, studentIds: l.studentIds.filter((sid) => sid !== id) }))
        .filter((l) => l.studentIds.length > 0)
    );
    setKarteEntries((prev) => prev.filter((k) => k.studentId !== id));
  };

  const handleAddKarteEntry = (entry: KarteEntry) => {
    setKarteEntries((prev) => [entry, ...prev]);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-slate-800">塾管理システム</h1>
          <p className="text-sm text-slate-400">時間割・指導カルテ・給与管理</p>
        </div>
        <div className="mx-auto max-w-6xl">
          <TabNav active={activeTab} onChange={setActiveTab} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {activeTab === "timetable" && (
          <TimetableView
            teachers={teachers}
            students={students}
            lessons={lessons}
            onSaveLesson={handleSaveLesson}
            onDeleteLesson={handleDeleteLesson}
          />
        )}
        {activeTab === "karte" && (
          <KarteView
            students={students}
            teachers={teachers}
            karteEntries={karteEntries}
            onAddEntry={handleAddKarteEntry}
          />
        )}
        {activeTab === "salary" && (
          <SalaryView teachers={teachers} lessons={lessons} onUpdateWage={handleUpdateWage} />
        )}
        {activeTab === "manage" && (
          <ManageView
            teachers={teachers}
            students={students}
            onSaveTeacher={handleSaveTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}
      </main>
    </div>
  );
}
