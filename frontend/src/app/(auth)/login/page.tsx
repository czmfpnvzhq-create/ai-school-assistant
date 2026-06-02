"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import { useAuthContext } from "@/lib/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Teacher");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setSession(data.token, data.user);
      router.replace(`/dashboard/${data.user.role.toLowerCase()}`);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col justify-center px-8 py-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg">
          <h1 className="text-4xl font-extrabold text-white mb-2">EduNexus</h1>
          <p className="text-slate-300 max-w-md">A modern school management portal — clean dashboards for teachers, students, and parents. Welcome back, please sign in to continue.</p>
          <div className="mt-8">
            <div className="inline-flex items-center gap-3 text-sm text-slate-400">
              <span className="px-3 py-1 bg-slate-700 rounded-full">Portfolio-ready</span>
              <span className="px-3 py-1 bg-slate-700 rounded-full">Tailwind</span>
              <span className="px-3 py-1 bg-slate-700 rounded-full">Next.js</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto bg-slate-900 p-8 rounded-2xl shadow-xl">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">EduNexus Portal</h2>
            <p className="text-sm text-slate-400">Sign in to access your dashboard</p>
          </div>

          {error && <div className="mb-4 text-red-400">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                placeholder="you@school.edu"
                className="w-full p-3 rounded-lg bg-slate-800 placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="email"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-800 appearance-none"
                  aria-label="role"
                >
                  <option>Teacher</option>
                  <option>Student</option>
                  <option>Parent</option>
                  <option>Admin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">▾</div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Password</label>
              <input
                type="password"
                placeholder="Your password"
                className="w-full p-3 rounded-lg bg-slate-800 placeholder:text-slate-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="password"
              />
            </div>

            <button className="w-full py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-sm text-slate-400 flex justify-between items-center">
            <div>Don&apos;t have an account? <Link href="/register" className="text-blue-400">Register</Link></div>
            <div className="text-xs text-slate-500">Role shown is for convenience — actual role validated on login</div>
          </div>
        </div>
      </div>
    </div>
  );
}
