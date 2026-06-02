"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import { useAuthContext } from "@/lib/auth/AuthProvider";
import type { UserPayload } from "@/lib/auth/AuthProvider";

const ROLE_DASHBOARD: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  PARENT: "/dashboard/parent",
};

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const prefetchDashboard = (role: string) => {
    const path = ROLE_DASHBOARD[role];
    if (path) router.prefetch(path);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Login failed");
      }

      const user = data.user as UserPayload;
      setSession(data.token, user);
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
      router.prefetch(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  const testCreds = [
    { role: "Admin", email: "admin@edunexus.com", pass: "admin123", color: "text-sky-400" },
    { role: "Teacher", email: "teacher@edunexus.com", pass: "teacher123", color: "text-fuchsia-400" },
    { role: "Student", email: "student@edunexus.com", pass: "student123", color: "text-emerald-400" },
    { role: "Parent", email: "parent@edunexus.com", pass: "parent123", color: "text-orange-400" },
  ];

  const [copied, setCopied] = useState<string | null>(null);

  const copyAndFill = async (emailVal: string, passVal: string) => {
    try {
      await navigator.clipboard.writeText(`${emailVal}\n${passVal}`);
      setCopied(emailVal);
      setTimeout(() => setCopied(null), 1800);
    } catch (_) {
      setCopied(null);
    }
    setEmail(emailVal);
    setPassword(passVal);
  };

  const signInWith = async (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal, password: passVal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Login failed");
      const user = data.user as UserPayload;
      setSession(data.token, user);
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Login + hero */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 opacity-30 blur-3xl pointer-events-none" />
          <div className="absolute -right-16 bottom-10 w-56 h-56 rounded-full bg-gradient-to-r from-rose-500 to-yellow-400 opacity-20 blur-2xl pointer-events-none" />

          <div className="relative bg-gradient-to-br from-slate-900/60 to-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-white">EduNexus</h1>
              <p className="text-slate-300 mt-2">Smart dashboards for teachers, students and parents — built with Next.js & Tailwind.</p>
            </div>

            {error && <div className="mb-4 text-red-400">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  placeholder="you@school.edu"
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/5 placeholder:text-slate-500 text-white"
                  value={email}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEmail(v);
                    const lower = v.toLowerCase();
                    if (lower.includes("admin")) prefetchDashboard("ADMIN");
                    else if (lower.includes("teacher")) prefetchDashboard("TEACHER");
                    else if (lower.includes("student")) prefetchDashboard("STUDENT");
                    else if (lower.includes("parent")) prefetchDashboard("PARENT");
                  }}
                  aria-label="email"
                />
              </div>

              <div className="relative">
                <label className="block text-sm text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/5 placeholder:text-slate-500 text-white"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-300 hover:text-white transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-xl text-white font-semibold shadow-[0_8px_30px_rgba(99,102,241,0.15)] transition-all" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="mt-4 text-sm text-slate-400 flex items-center justify-between">
              <div>Don&apos;t have an account? <Link href="/register" className="text-indigo-300">Register</Link></div>
              <div className="text-xs text-slate-500">Portfolio-ready · Tailwind</div>
            </div>
          </div>
        </div>

        {/* Right: Test credentials panel */}
        <div className="mx-auto w-full max-w-md text-slate-300">
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-900/40 p-6 border border-slate-800 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">TEST CREDENTIALS</h3>
            <div className="grid grid-cols-2 gap-4">
              {testCreds.map((t) => (
                <button
                  key={t.role}
                  type="button"
                  onClick={() => copyAndFill(t.email, t.pass)}
                  className="text-left bg-slate-800 hover:bg-slate-700/80 p-4 rounded-lg border border-slate-800 transition"
                >
                  <div className={`font-semibold ${t.color}`}>{t.role}</div>
                  <div className="mt-2 text-sm text-slate-300">{t.email}</div>
                  <div className="text-sm text-slate-400">{t.pass}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-xs text-slate-500">Tip: click a card to fill and copy credentials.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
