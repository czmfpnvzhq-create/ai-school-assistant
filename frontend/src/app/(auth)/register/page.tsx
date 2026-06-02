"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch("/login");
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030313] to-[#050505] text-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="hidden lg:flex flex-col justify-center px-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="text-3xl bg-slate-800 p-3 rounded-xl border border-slate-700">🎓</div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Create your EduNexus account</h1>
            </div>
            <p className="text-slate-400 max-w-xl leading-relaxed">Get started with EduNexus — manage classes, take attendance, and stay connected with your school community.</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 shadow-md">
              <h3 className="text-sm text-slate-400 uppercase tracking-widest">Easy</h3>
              <p className="text-lg font-bold text-slate-200">Sign up in seconds</p>
            </div>
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 shadow-md">
              <h3 className="text-sm text-slate-400 uppercase tracking-widest">Secure</h3>
              <p className="text-lg font-bold text-slate-200">Trusted by schools</p>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.05] p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative z-10">
            <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Create Account</h2>
            <p className="text-gray-400 mb-6 text-sm">Join the EduNexus platform</p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder-gray-600"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder-gray-600"
              placeholder="you@edunexus.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder-gray-600"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white appearance-none"
            >
              <option value="STUDENT" className="bg-black">Student</option>
              <option value="TEACHER" className="bg-black">Teacher</option>
              <option value="PARENT" className="bg-black">Parent</option>
              <option value="ADMIN" className="bg-black">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.2)] hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              "Register Account"
            )}
          </button>
        </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account? {" "}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
