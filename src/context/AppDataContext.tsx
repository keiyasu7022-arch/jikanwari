"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { KarteEntry, Lesson, Location, Student, Teacher, TeacherIncentive } from "@/types";
import { supabase } from "@/lib/supabaseClient";

interface AppDataValue {
  loading: boolean;
  teachers: Teacher[];
  students: Student[];
  lessons: Lesson[];
  karteEntries: KarteEntry[];
  locations: Location[];
  teacherIncentives: TeacherIncentive[];
  saveLesson: (lesson: Lesson) => void;
  deleteLesson: (id: string) => void;
  saveTeacher: (teacher: Teacher) => void;
  deleteTeacher: (id: string) => void;
  updateWage: (teacherId: string, wage: number) => void;
  saveStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  addKarteEntry: (entry: KarteEntry) => void;
  saveLocation: (location: Location) => void;
  deleteLocation: (id: string) => void;
  addTeacherIncentive: (incentive: TeacherIncentive) => void;
  deleteTeacherIncentive: (id: string) => void;
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
type LocationRow = { id: string; name: string; color: string };
type TeacherIncentiveRow = {
  id: string;
  teacher_id: string;
  date: string;
  amount: number;
  reason: string;
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

function locationFromRow(row: LocationRow): Location {
  return { id: row.id, name: row.name, color: row.color };
}

function teacherIncentiveFromRow(row: TeacherIncentiveRow): TeacherIncentive {
  return { id: row.id, teacherId: row.teacher_id, date: row.date, amount: row.amount, reason: row.reason };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [karteEntries, setKarteEntries] = useState<KarteEntry[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [teacherIncentives, setTeacherIncentives] = useState<TeacherIncentive[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 書き込み失敗をユーザーに知らせる（consoleだけだと気付けないため）
  const notifyError = useCallback(
    (label: string) =>
      ({ error }: { error: unknown }) => {
        if (!error) return;
        console.error(`${label} failed:`, error);
        setSaveError("保存に失敗しました。通信環境を確認して、もう一度お試しください。");
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        errorTimerRef.current = setTimeout(() => setSaveError(null), 6000);
      },
    []
  );

  useEffect(() => {
    async function load() {
      const [teachersRes, studentsRes, lessonsRes, karteRes, locationsRes, incentivesRes] =
        await Promise.all([
          supabase.from("teachers").select("*"),
          supabase.from("students").select("*"),
          supabase.from("lessons").select("*"),
          supabase.from("karte_entries").select("*").order("date", { ascending: false }),
          supabase.from("locations").select("*").order("name", { ascending: true }),
          supabase.from("teacher_incentives").select("*").order("date", { ascending: false }),
        ]);

      if (teachersRes.data) setTeachers(teachersRes.data.map(teacherFromRow));
      if (studentsRes.data) setStudents(studentsRes.data.map(studentFromRow));
      if (lessonsRes.data) setLessons(lessonsRes.data.map(lessonFromRow));
      if (karteRes.data) setKarteEntries(karteRes.data.map(karteEntryFromRow));
      if (locationsRes.data) setLocations(locationsRes.data.map(locationFromRow));
      if (incentivesRes.data) setTeacherIncentives(incentivesRes.data.map(teacherIncentiveFromRow));

      setLoading(false);
    }
    load();
  }, []);

  const saveLesson = useCallback(
    (lesson: Lesson) => {
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
        .then(notifyError("saveLesson"));
    },
    [notifyError]
  );

  const deleteLesson = useCallback(
    (id: string) => {
      setLessons((prev) => prev.filter((l) => l.id !== id));
      supabase.from("lessons").delete().eq("id", id).then(notifyError("deleteLesson"));
    },
    [notifyError]
  );

  const saveTeacher = useCallback(
    (teacher: Teacher) => {
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
        .then(notifyError("saveTeacher"));
    },
    [notifyError]
  );

  const deleteTeacher = useCallback(
    (id: string) => {
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setLessons((prev) =>
        prev.map((l) => (l.teacherId === id ? { ...l, teacherId: null } : l))
      );
      setTeacherIncentives((prev) => prev.filter((i) => i.teacherId !== id));
      supabase.from("teachers").delete().eq("id", id).then(notifyError("deleteTeacher"));
    },
    [notifyError]
  );

  const updateWage = useCallback(
    (teacherId: string, wage: number) => {
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, hourlyWage: wage } : t))
      );
      supabase
        .from("teachers")
        .update({ hourly_wage: wage })
        .eq("id", teacherId)
        .then(notifyError("updateWage"));
    },
    [notifyError]
  );

  const saveStudent = useCallback(
    (student: Student) => {
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
        .then(notifyError("saveStudent"));
    },
    [notifyError]
  );

  const deleteStudent = useCallback(
    (id: string) => {
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
            .then(notifyError("deleteStudent lesson cleanup"));
        } else {
          supabase
            .from("lessons")
            .update({ student_ids: remainingIds })
            .eq("id", l.id)
            .then(notifyError("deleteStudent lesson update"));
        }
      });

      supabase.from("students").delete().eq("id", id).then(notifyError("deleteStudent"));
    },
    [lessons, notifyError]
  );

  const addKarteEntry = useCallback(
    (entry: KarteEntry) => {
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
        .then(notifyError("addKarteEntry"));
    },
    [notifyError]
  );

  const saveLocation = useCallback(
    (location: Location) => {
      setLocations((prev) => {
        const exists = prev.some((l) => l.id === location.id);
        return exists
          ? prev.map((l) => (l.id === location.id ? location : l))
          : [...prev, location];
      });
      supabase
        .from("locations")
        .upsert({ id: location.id, name: location.name, color: location.color })
        .then(notifyError("saveLocation"));
    },
    [notifyError]
  );

  const addTeacherIncentive = useCallback(
    (incentive: TeacherIncentive) => {
      setTeacherIncentives((prev) => [incentive, ...prev]);
      supabase
        .from("teacher_incentives")
        .insert({
          id: incentive.id,
          teacher_id: incentive.teacherId,
          date: incentive.date,
          amount: incentive.amount,
          reason: incentive.reason,
        })
        .then(notifyError("addTeacherIncentive"));
    },
    [notifyError]
  );

  const deleteTeacherIncentive = useCallback(
    (id: string) => {
      setTeacherIncentives((prev) => prev.filter((i) => i.id !== id));
      supabase
        .from("teacher_incentives")
        .delete()
        .eq("id", id)
        .then(notifyError("deleteTeacherIncentive"));
    },
    [notifyError]
  );

  const deleteLocation = useCallback(
    (id: string) => {
      setLocations((prev) => prev.filter((l) => l.id !== id));
      supabase.from("locations").delete().eq("id", id).then(notifyError("deleteLocation"));
    },
    [notifyError]
  );

  const value = useMemo(
    () => ({
      loading,
      teachers,
      students,
      lessons,
      karteEntries,
      locations,
      teacherIncentives,
      saveLesson,
      deleteLesson,
      saveTeacher,
      deleteTeacher,
      updateWage,
      saveStudent,
      deleteStudent,
      addKarteEntry,
      saveLocation,
      deleteLocation,
      addTeacherIncentive,
      deleteTeacherIncentive,
    }),
    [
      loading,
      teachers,
      students,
      lessons,
      karteEntries,
      locations,
      teacherIncentives,
      saveLesson,
      deleteLesson,
      saveTeacher,
      deleteTeacher,
      updateWage,
      saveStudent,
      deleteStudent,
      addKarteEntry,
      saveLocation,
      deleteLocation,
      addTeacherIncentive,
      deleteTeacherIncentive,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          読み込み中...
        </div>
      ) : (
        children
      )}
      {saveError && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          ⚠ {saveError}
        </div>
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
