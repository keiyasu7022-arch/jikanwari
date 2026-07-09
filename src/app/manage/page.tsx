"use client";

import { useAppData } from "@/context/AppDataContext";
import ManageView from "@/components/ManageView";
import PasswordGate from "@/components/PasswordGate";

export default function ManagePage() {
  const {
    teachers,
    students,
    locations,
    saveTeacher,
    deleteTeacher,
    saveStudent,
    deleteStudent,
    saveLocation,
    deleteLocation,
  } = useAppData();

  return (
    <PasswordGate title="講師・生徒管理">
      <ManageView
        teachers={teachers}
        students={students}
        locations={locations}
        onSaveTeacher={saveTeacher}
        onDeleteTeacher={deleteTeacher}
        onSaveStudent={saveStudent}
        onDeleteStudent={deleteStudent}
        onSaveLocation={saveLocation}
        onDeleteLocation={deleteLocation}
      />
    </PasswordGate>
  );
}
