"use client";

import { useAppData } from "@/context/AppDataContext";
import ManageView from "@/components/ManageView";
import PasswordGate from "@/components/PasswordGate";

export default function ManagePage() {
  const {
    teachers,
    students,
    saveTeacher,
    deleteTeacher,
    saveStudent,
    deleteStudent,
  } = useAppData();

  return (
    <PasswordGate title="講師・生徒管理">
      <ManageView
        teachers={teachers}
        students={students}
        onSaveTeacher={saveTeacher}
        onDeleteTeacher={deleteTeacher}
        onSaveStudent={saveStudent}
        onDeleteStudent={deleteStudent}
      />
    </PasswordGate>
  );
}
