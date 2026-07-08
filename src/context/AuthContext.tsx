"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { ADMIN_PASSWORD } from "@/lib/authConfig";

interface AuthValue {
  unlocked: boolean;
  tryUnlock: (password: string) => boolean;
  lock: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);

  const tryUnlock = (password: string) => {
    const ok = password === ADMIN_PASSWORD;
    if (ok) setUnlocked(true);
    return ok;
  };

  const lock = () => setUnlocked(false);

  return (
    <AuthContext.Provider value={{ unlocked, tryUnlock, lock }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
