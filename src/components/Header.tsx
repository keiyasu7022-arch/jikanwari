"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/", label: "時間割", icon: "🗓️" },
  { href: "/karte", label: "指導カルテ", icon: "📋" },
  { href: "/salary", label: "給与管理", icon: "💰" },
  { href: "/manage", label: "講師・生徒管理", icon: "👥" },
];

export default function Header() {
  const pathname = usePathname();
  const { unlocked, lock } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-start justify-between px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">塾管理システム</h1>
          <p className="text-sm text-slate-400">時間割・指導カルテ・給与管理</p>
        </div>
        {unlocked && (
          <button
            onClick={lock}
            title="編集権限をロックする"
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            🔓 <span className="hidden sm:inline">ロックする</span>
          </button>
        )}
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 px-2 sm:px-6">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-medium transition-colors ${
                active ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
