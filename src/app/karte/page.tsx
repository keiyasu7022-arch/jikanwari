"use client";

import { useAppData } from "@/context/AppDataContext";
import KarteView from "@/components/KarteView";

export default function KartePage() {
  const { students, teachers, karteEntries, addKarteEntry } = useAppData();

  return (
    <KarteView
      students={students}
      teachers={teachers}
      karteEntries={karteEntries}
      onAddEntry={addKarteEntry}
    />
  );
}
