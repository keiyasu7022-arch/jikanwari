"use client";

import { FormEvent, useState } from "react";
import Modal from "./Modal";
import { useAuth } from "@/context/AuthContext";

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

export default function PasswordPromptModal({ onSuccess, onClose }: Props) {
  const { tryUnlock } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tryUnlock(password)) {
      onSuccess();
    } else {
      setError("パスワードが違います。");
      setPassword("");
    }
  };

  return (
    <Modal title="パスワードを入力" onClose={onClose} widthClass="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-sm text-slate-500">
          コマの追加・変更にはパスワードが必要です。
        </p>
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
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            解除する
          </button>
        </div>
      </form>
    </Modal>
  );
}
