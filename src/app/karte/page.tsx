"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppData } from "@/context/AppDataContext";
import KarteView from "@/components/KarteView";

function KartePageContent() {
  const { students, teachers, karteEntries, addKarteEntry } = useAppData();
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("student");

  return (
    <KarteView
      students={students}
      teachers={teachers}
      karteEntries={karteEntries}
      onAddEntry={addKarteEntry}
      initialStudentId={initialStudentId}
    />
  );
}

export default function KartePage() {
  return (
    <Suspense fallback={null}>
      <KartePageContent />
    </Suspense>
  );
}
