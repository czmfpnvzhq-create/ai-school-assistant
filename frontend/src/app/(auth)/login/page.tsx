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

  return (
    <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Login card */}
        <div className="mx-auto w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold mb-1">Welcome back</h2>
          <p className="text-sm text-slate-400 mb-6">Sign in to access your dashboard</p>

          {error && <div className="mb-4 text-red-400">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                placeholder="you@school.edu"
                className="w-full p-3 rounded-lg bg-slate-800 placeholder:text-slate-500"
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

            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-800 placeholder:text-slate-500"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button className="w-full py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-400">
            Don&apos;t have an account? <Link href="/register" className="text-blue-400">Register</Link>
          </div>
        </div>

        {/* Right: Test credentials panel */}
        <div className="mx-auto w-full max-w-md text-slate-300">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">TEST CREDENTIALS</h3>
          <div className="grid grid-cols-2 gap-4">
            {testCreds.map((t) => (
              <div key={t.role} className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <div className={`font-semibold ${t.color}`}>{t.role}</div>
                <div className="mt-2 text-sm text-slate-300">{t.email}</div>
                <div className="text-sm text-slate-400">{t.pass}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-xs text-slate-500">Tip: click a role and copy credentials to test login.</div>
        </div>
      </div>
    </div>
  );
}
