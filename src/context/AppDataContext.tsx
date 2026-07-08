"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { KarteEntry, Lesson, Student, Teacher } from "@/types";
import { supabase } from "@/lib/supabaseClient";

interface AppDataValue {
  loading: boolean;
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

type TeacherRow = { id: string; name: string; hourly_wage: number };
type StudentRow = { id: string; name: string; grade: string; grade_year: number };
type LessonRow = {
  id: string;
  date: string;
  period_id: number;
  subject: string;
  teacher_id: string | null;
  student_ids: string[];
  location: string;
};
type KarteEntryRow = {
  id: string;
  student_id: string;
  date: string;
  subject: string;
  teacher_name: string;
  content: string;
  next_goal: string;
};

function teacherFromRow(row: TeacherRow): Teacher {
  return { id: row.id, name: row.name, hourlyWage: row.hourly_wage };
}

function studentFromRow(row: StudentRow): Student {
  return { id: row.id, name: row.name, grade: row.grade, gradeYear: row.grade_year };
}

function lessonFromRow(row: LessonRow): Lesson {
  return {
    id: row.id,
    date: row.date,
    periodId: row.period_id,
    subject: row.subject,
    teacherId: row.teacher_id,
    studentIds: row.student_ids,
    location: row.location as Lesson["location"],
  };
}

function karteEntryFromRow(row: KarteEntryRow): KarteEntry {
  return {
    id: row.id,
    studentId: row.student_id,
    date: row.date,
    subject: row.subject,
    teacherName: row.teacher_name,
    content: row.content,
    nextGoal: row.next_goal,
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [karteEntries, setKarteEntries] = useState<KarteEntry[]>([]);

  useEffect(() => {
    async function load() {
      const [teachersRes, studentsRes, lessonsRes, karteRes] = await Promise.all([
        supabase.from("teachers").select("*"),
        supabase.from("students").select("*"),
        supabase.from("lessons").select("*"),
        supabase.from("karte_entries").select("*").order("date", { ascending: false }),
      ]);

      if (teachersRes.data) setTeachers(teachersRes.data.map(teacherFromRow));
      if (studentsRes.data) setStudents(studentsRes.data.map(studentFromRow));
      if (lessonsRes.data) setLessons(lessonsRes.data.map(lessonFromRow));
      if (karteRes.data) setKarteEntries(karteRes.data.map(karteEntryFromRow));

      setLoading(false);
    }
    load();
  }, []);

  const saveLesson = (lesson: Lesson) => {
    setLessons((prev) => {
      const exists = prev.some((l) => l.id === lesson.id);
      return exists ? prev.map((l) => (l.id === lesson.id ? lesson : l)) : [...prev, lesson];
    });
    supabase
      .from("lessons")
      .upsert({
        id: lesson.id,
        date: lesson.date,
        period_id: lesson.periodId,
        subject: lesson.subject,
        teacher_id: lesson.teacherId,
        student_ids: lesson.studentIds,
        location: lesson.location,
      })
      .then(({ error }) => error && console.error("saveLesson failed:", error));
  };

  const deleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    supabase
      .from("lessons")
      .delete()
      .eq("id", id)
      .then(({ error }) => error && console.error("deleteLesson failed:", error));
  };

  const saveTeacher = (teacher: Teacher) => {
    setTeachers((prev) => {
      const exists = prev.some((t) => t.id === teacher.id);
      return exists ? prev.map((t) => (t.id === teacher.id ? teacher : t)) : [...prev, teacher];
    });
    supabase
      .from("teachers")
      .upsert({
        id: teacher.id,
        name: teacher.name,
        hourly_wage: teacher.hourlyWage,
      })
      .then(({ error }) => error && console.error("saveTeacher failed:", error));
  };

  const deleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    setLessons((prev) =>
      prev.map((l) => (l.teacherId === id ? { ...l, teacherId: null } : l))
    );
    supabase
      .from("teachers")
      .delete()
      .eq("id", id)
      .then(({ error }) => error && console.error("deleteTeacher failed:", error));
  };

  const updateWage = (teacherId: string, wage: number) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, hourlyWage: wage } : t))
    );
    supabase
      .from("teachers")
      .update({ hourly_wage: wage })
      .eq("id", teacherId)
      .then(({ error }) => error && console.error("updateWage failed:", error));
  };

  const saveStudent = (student: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === student.id);
      return exists ? prev.map((s) => (s.id === student.id ? student : s)) : [...prev, student];
    });
    supabase
      .from("students")
      .upsert({
        id: student.id,
        name: student.name,
        grade: student.grade,
        grade_year: student.gradeYear,
      })
      .then(({ error }) => error && console.error("saveStudent failed:", error));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));

    const affectedLessons = lessons.filter((l) => l.studentIds.includes(id));

    setLessons((prev) =>
      prev
        .map((l) => ({ ...l, studentIds: l.studentIds.filter((sid) => sid !== id) }))
        .filter((l) => l.studentIds.length > 0)
    );
    setKarteEntries((prev) => prev.filter((k) => k.studentId !== id));

    affectedLessons.forEach((l) => {
      const remainingIds = l.studentIds.filter((sid) => sid !== id);
      if (remainingIds.length === 0) {
        supabase
          .from("lessons")
          .delete()
          .eq("id", l.id)
          .then(({ error }) => error && console.error("deleteStudent lesson cleanup failed:", error));
      } else {
        supabase
          .from("lessons")
          .update({ student_ids: remainingIds })
          .eq("id", l.id)
          .then(({ error }) => error && console.error("deleteStudent lesson update failed:", error));
      }
    });

    supabase
      .from("students")
      .delete()
      .eq("id", id)
      .then(({ error }) => error && console.error("deleteStudent failed:", error));
  };

  const addKarteEntry = (entry: KarteEntry) => {
    setKarteEntries((prev) => [entry, ...prev]);
    supabase
      .from("karte_entries")
      .insert({
        id: entry.id,
        student_id: entry.studentId,
        date: entry.date,
        subject: entry.subject,
        teacher_name: entry.teacherName,
        content: entry.content,
        next_goal: entry.nextGoal,
      })
      .then(({ error }) => error && console.error("addKarteEntry failed:", error));
  };

  return (
    <AppDataContext.Provider
      value={{
        loading,
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
      {loading ? (
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          読み込み中...
        </div>
      ) : (
        children
      )}
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
