"use client";

import { useAppData } from "@/context/AppDataContext";
import TimetableView from "@/components/TimetableView";

export default function TimetablePage() {
  const { teachers, students, lessons, saveLesson, deleteLesson } = useAppData();

  return (
    <TimetableView
      teachers={teachers}
      students={students}
      lessons={lessons}
      onSaveLesson={saveLesson}
      onDeleteLesson={deleteLesson}
    />
  );
}
