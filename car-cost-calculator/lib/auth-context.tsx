"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as auth from "./auth";
import { PublicUser } from "./auth";

interface AuthContextValue {
  user: PublicUser | null;
  ready: boolean; // becomes true once we've checked localStorage on mount
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setUser(auth.getCurrentUser());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    // Same-tab updates (dispatched manually by lib/auth.ts) and cross-tab
    // updates (native "storage" event) both keep the header in sync.
    window.addEventListener("carcost:auth-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("carcost:auth-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const res = await auth.signUp(name, email, password);
    if (res.user) setUser(res.user);
    return { error: res.error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await auth.signIn(email, password);
    if (res.user) setUser(res.user);
    return { error: res.error };
  }, []);

  const signOut = useCallback(() => {
    auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
