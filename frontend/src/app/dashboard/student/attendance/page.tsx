"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface AttendanceRecord {
  date: string;
  status: string;
}

function AttendanceSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-32 bg-slate-800 rounded" />
      <div className="h-48 bg-slate-800 rounded" />
    </div>
  );
}

export default function StudentAttendance() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [percentage, setPercentage] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) { router.push("/login"); return; }
      const res = await fetch(`${API_BASE_URL}/dashboard/student-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.removeItem("edunexus_token"); router.push("/login"); return; }
      if (!res.ok) throw new Error("Failed to load attendance.");
      const data = await res.json();
      const att = Array.isArray(data.student?.attendance?.records) ? data.student.attendance.records : []; // ensure array // fallback to empty array if no records
      setAttendance(att);
      setPercentage(data.student?.attendance?.percentage || 0);
      setTotalDays(data.student?.attendance?.totalDays || 0);
    } catch (err: any) {
      setError(err.message || "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (isLoading) return <AttendanceSkeleton />;
  if (error) return (
    <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 p-5 rounded-xl shadow-lg">
      <p>⚠️ {error}</p>
      <button onClick={() => setError(null)} className="mt-2 text-rose-300 underline">Dismiss</button>
    </div>
  );

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      <h1 className="text-3xl font-extrabold text-white tracking-tight">Attendance</h1>
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="36" cx="40" cy="40" />
            <circle
              className={`transition-all duration-1000 ease-out ${percentage >= 80 ? 'text-emerald-500' : percentage >= 60 ? 'text-amber-500' : 'text-rose-500'}`}
              strokeWidth="6"
              strokeDasharray={226.2}
              strokeDashoffset={226.2 - (226.2 * percentage) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="36"
              cx="40"
              cy="40"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-extrabold text-white">{percentage}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-slate-400">Your attendance rate based on the last {totalDays} recorded days.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mt-6">Recent Records</h2>
      {attendance.length === 0 ? (
        <p className="text-slate-500">No attendance records available.</p>
      ) : (
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950/50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {attendance.map((rec, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-2">{formatDate(rec.date)}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${rec.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : rec.status === 'late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}
                    >{rec.status.charAt(0).toUpperCase()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
