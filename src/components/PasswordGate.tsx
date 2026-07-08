"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  title: string;
  children: ReactNode;
}

export default function PasswordGate({ title, children }: Props) {
  const { unlocked, tryUnlock } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (unlocked) return <>{children}</>;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tryUnlock(password)) {
      setError("パスワードが違います。");
      setPassword("");
    }
  };

  return (
    <div className="flex justify-center py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 text-center">
          <div className="mb-2 text-2xl">🔒</div>
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <p className="mt-1 text-xs text-slate-400">
            このページの閲覧にはパスワードが必要です。
          </p>
        </div>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="パスワード"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          解除する
        </button>
      </form>
    </div>
  );
}
