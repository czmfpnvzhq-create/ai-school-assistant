"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface Grade {
  id: number;
  subject: string;
  score: number;
  examDate: string;
}

function GradesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-32 bg-slate-800 rounded" />
      <div className="grid grid-cols-1 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-800 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function StudentGrades() {
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/dashboard/student-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("edunexus_token");
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load grades.");

      const data = await res.json();
      setGrades(data.student?.recentGrades ?? []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getGradeLetter = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  if (isLoading) return <GradesSkeleton />;

  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 p-5 rounded-xl shadow-lg">
        <p>⚠️ {error}</p>
        <button onClick={() => setError(null)} className="mt-2 text-rose-300 underline">
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      <h1 className="text-3xl font-extrabold text-white tracking-tight">
        My Grades
      </h1>
      {grades.length === 0 ? (
        <p className="text-slate-500">No grades available.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/30 backdrop-blur-md shadow-lg">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3 text-center">Score</th>
                <th className="px-6 py-3 text-center">Grade</th>
                <th className="px-6 py-3 text-right">Exam Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {grades.map((g) => (
                <tr key={g.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{g.subject}</td>
                  <td className="px-6 py-4 text-center text-slate-300">{g.score}%</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${
                        g.score >= 80
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : g.score >= 60
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {getGradeLetter(g.score)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">{formatDate(g.examDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
