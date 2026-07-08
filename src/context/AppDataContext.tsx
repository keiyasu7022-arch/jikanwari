"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { KarteEntry, Lesson, Student, Teacher } from "@/types";
import {
  initialKarteEntries,
  initialLessons,
  initialStudents,
  initialTeachers,
} from "@/lib/mockData";

interface AppDataValue {
  teachers: Teacher[];
  students: Student[];
  lessons: Lesson[];
  karteEntries: KarteEntry[];
  saveLesson: (lesson: Lesson) => void;
  deleteLesson: (id: string) => void;
  saveTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  updateWage: (teacherId: string, wage: number) => void;
  saveStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addKarteEntry: (entry: KarteEntry) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [karteEntries, setKarteEntries] = useState<KarteEntry[]>(initialKarteEntries);

  const saveLesson = (lesson: Lesson) => {
    setLessons((prev) => {
      const exists = prev.some((l) => l.id === lesson.id);
      return exists ? prev.map((l) => (l.id === lesson.id ? lesson : l)) : [...prev, lesson];
    });
  };

  const deleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const saveTeacher = (teacher: Teacher) => {
    setTeachers((prev) => {
      const exists = prev.some((t) => t.id === teacher.id);
      return exists ? prev.map((t) => (t.id === teacher.id ? teacher : t)) : [...prev, teacher];
    });
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    setLessons((prev) =>
      prev.map((l) => (l.teacherId === id ? { ...l, teacherId: null } : l))
    );
  };

  const updateWage = (teacherId: string, wage: number) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, hourlyWage: wage } : t))
    );
  };

  const saveStudent = (student: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === student.id);
      return exists ? prev.map((s) => (s.id === student.id ? student : s)) : [...prev, student];
    });
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setLessons((prev) =>
      prev
        .map((l) => ({ ...l, studentIds: l.studentIds.filter((sid) => sid !== id) }))
        .filter((l) => l.studentIds.length > 0)
    );
    setKarteEntries((prev) => prev.filter((k) => k.studentId !== id));
  };

  const addKarteEntry = (entry: KarteEntry) => {
    setKarteEntries((prev) => [entry, ...prev]);
  };

  return (
    <AppDataContext.Provider
      value={{
        teachers,
        students,
        lessons,
        karteEntries,
        saveLesson,
        deleteLesson,
        saveTeacher,
        deleteTeacher,
        updateWage,
        saveStudent,
        deleteStudent,
        addKarteEntry,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return ctx;
}
