"use client";

export type TabKey = "timetable" | "karte" | "salary" | "manage";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "timetable", label: "時間割", icon: "🗓️" },
  { key: "karte", label: "指導カルテ", icon: "📋" },
  { key: "salary", label: "給与管理", icon: "💰" },
  { key: "manage", label: "講師・生徒管理", icon: "👥" },
];

export default function TabNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <nav className="flex gap-1 border-b border-slate-200 px-2 sm:px-6">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-medium transition-colors ${
            active === tab.key
              ? "text-indigo-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
          {active === tab.key && (
            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-indigo-600" />
          )}
        </button>
      ))}
    </nav>
  );
}
