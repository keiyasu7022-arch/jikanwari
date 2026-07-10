"use client";

import { useAppData } from "@/context/AppDataContext";
import SalaryView from "@/components/SalaryView";
import PasswordGate from "@/components/PasswordGate";

export default function SalaryPage() {
  const { teachers, lessons, teacherIncentives, updateWage, addTeacherIncentive, deleteTeacherIncentive } =
    useAppData();

  return (
    <PasswordGate title="給与管理">
      <SalaryView
        teachers={teachers}
        lessons={lessons}
        teacherIncentives={teacherIncentives}
        onUpdateWage={updateWage}
        onAddIncentive={addTeacherIncentive}
        onDeleteIncentive={deleteTeacherIncentive}
      />
    </PasswordGate>
  );
}
