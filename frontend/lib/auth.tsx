"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, type UserProfile } from "./api";

interface AuthCtx {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<UserProfile | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("ps_token");
    if (t) {
      setToken(t);
      authApi.me()
        .then(setUser)
        .catch(() => { localStorage.removeItem("ps_token"); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem("ps_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (data: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
  }) => {
    const res = await authApi.register(data);
    localStorage.setItem("ps_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("ps_token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
