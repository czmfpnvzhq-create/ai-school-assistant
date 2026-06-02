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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030313] to-[#050505] text-gray-200 flex items-center justify-center p-6">
      {/* Decorative ambient glows */}
      <div className="absolute left-8 top-8 w-48 h-48 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute right-12 bottom-12 w-56 h-56 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left hero */}
        <div className="hidden lg:flex flex-col justify-center px-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="text-3xl bg-slate-800 p-3 rounded-xl border border-slate-700">🎓</div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">EduNexus</h1>
            </div>
            <p className="text-slate-400 max-w-xl leading-relaxed">A beautiful school management portal — fast, secure, and delightful to use. Sign in to manage your classes, attendance, grades and more.</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 shadow-md">
              <h3 className="text-sm text-slate-400 uppercase tracking-widest">Secure</h3>
              <p className="text-lg font-bold text-slate-200">Enterprise-grade auth</p>
            </div>
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 shadow-md">
              <h3 className="text-sm text-slate-400 uppercase tracking-widest">Fast</h3>
              <p className="text-lg font-bold text-slate-200">Optimized for teachers</p>
            </div>
          </div>
        </div>

        {/* Right: form card */}
        <div className="w-full flex items-center justify-center">
          <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.05] p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">EduNexus Portal</h2>
                <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
              </div>
              <div className="text-sm text-slate-400">Welcome back 👋</div>
            </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (email.includes("admin")) prefetchDashboard("ADMIN");
                else if (email.includes("teacher")) prefetchDashboard("TEACHER");
                else if (email.includes("student")) prefetchDashboard("STUDENT");
                else if (email.includes("parent")) prefetchDashboard("PARENT");
              }}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600"
              placeholder="you@edunexus.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
            Register here
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Test Credentials</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div className="bg-white/5 p-2 rounded border border-white/5">
              <span className="text-blue-400 block mb-1">Admin</span>
              admin@edunexus.com<br />admin123
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/5">
              <span className="text-purple-400 block mb-1">Teacher</span>
              teacher@edunexus.com<br />teacher123
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/5">
              <span className="text-green-400 block mb-1">Student</span>
              student@edunexus.com<br />student123
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/5">
              <span className="text-orange-400 block mb-1">Parent</span>
              parent@edunexus.com<br />parent123
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
