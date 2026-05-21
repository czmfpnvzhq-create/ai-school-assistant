"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
}

interface AuthContextValue {
  user: UserPayload | null;
  token: string | null;
  hydrated: boolean;
  setSession: (token: string, user: UserPayload) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): UserPayload | null {
  try {
    const raw = localStorage.getItem("edunexus_user");
    return raw ? (JSON.parse(raw) as UserPayload) : null;
  } catch {
    return null;
  }
}

function readStoredToken(): string | null {
  return localStorage.getItem("edunexus_token");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setToken(readStoredToken());
    setHydrated(true);
  }, []);

  const setSession = useCallback((newToken: string, newUser: UserPayload) => {
    localStorage.setItem("edunexus_token", newToken);
    localStorage.setItem("edunexus_user", JSON.stringify(newUser));
    document.cookie = `token=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    setToken(newToken);
    setUser(newUser);
    setHydrated(true);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("edunexus_token");
    localStorage.removeItem("edunexus_user");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, hydrated, setSession, clearSession }),
    [user, token, hydrated, setSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
