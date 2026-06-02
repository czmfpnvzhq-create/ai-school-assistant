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
    <div className="min-h-screen bg-black text-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">EduNexus Portal</h2>
        <p className="text-sm text-slate-400 mb-6">Sign in to access your dashboard</p>

        {error && <div className="mb-4 text-red-400">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input className="w-full p-2 rounded bg-slate-800" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input type="password" className="w-full p-2 rounded bg-slate-800" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="w-full py-2 bg-blue-600 rounded text-white" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>

        <div className="mt-4 text-sm text-slate-400">
          Don&apos;t have an account? <Link href="/register" className="text-blue-400">Register</Link>
        </div>
      </div>
    </div>
  );
}
