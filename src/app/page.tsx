"use client";

import { useAppData } from "@/context/AppDataContext";
import TimetableView from "@/components/TimetableView";

export default function TimetablePage() {
  const { teachers, students, lessons, karteEntries, saveLesson, deleteLesson } = useAppData();

  return (
    <TimetableView
      teachers={teachers}
      students={students}
      lessons={lessons}
      karteEntries={karteEntries}
      onSaveLesson={saveLesson}
      onDeleteLesson={deleteLesson}
    />
  );
}
