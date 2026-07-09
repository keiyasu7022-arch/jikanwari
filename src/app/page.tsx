"use client";

import { useAppData } from "@/context/AppDataContext";
import TimetableView from "@/components/TimetableView";

export default function TimetablePage() {
  const { teachers, students, lessons, karteEntries, locations, saveLesson, deleteLesson } =
    useAppData();

  return (
    <TimetableView
      teachers={teachers}
      students={students}
      lessons={lessons}
      karteEntries={karteEntries}
      locations={locations}
      onSaveLesson={saveLesson}
      onDeleteLesson={deleteLesson}
    />
  );
}
