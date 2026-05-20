"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { useTeacherData, getToken } from "@/lib/useTeacherData";

interface StudentRow {
  id: number;
  name: string;
  gradeAvg: number;
  todayStatus: string | null;
}

interface GradeEntry {
  id: number;
  studentName: string;
  subject: string;
  score: number;
  examDate: string;
}

interface TeacherDashboardStats {
  totalStudents: number;
  todayAttendanceRate: number;
  todayMarked: boolean;
  classGradeAvg: number;
  students: StudentRow[];
  recentGrades: GradeEntry[];
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-64 bg-slate-800 rounded-lg mb-2"></div>
        <div className="h-4 w-48 bg-slate-800 rounded"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl h-32">
             <div className="h-3 w-24 bg-slate-800 rounded mb-4"></div>
             <div className="h-8 w-16 bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Quick Mark Attendance Skeleton */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 h-64">
        <div className="h-6 w-48 bg-slate-800 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
             <div key={i} className="h-8 w-full bg-slate-800 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { info, isLoading: isClassLoading, error: classError } = useTeacherData();

  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Attendance marking states
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) { router.push("/login"); return; }

      const res = await fetch(`${API_BASE_URL}/dashboard/teacher-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) { localStorage.removeItem("edunexus_token"); router.push("/login"); return; }
      if (!res.ok) throw new Error("Failed to load dashboard");

      const result = await res.json();
      setStats(result);

      // Pre-fill attendance from existing records
      const initial: Record<number, string> = {};
      result.students.forEach((s: any) => {
        if (s.todayStatus) initial[s.id] = s.todayStatus;
      });
      setAttendance(initial);
      setAttendanceSaved(result.todayMarked);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setIsLoadingStats(false);
    }
  }, [router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const setStudentAttendance = (studentId: number, status: string) => {
    if (attendanceSaved) return;
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!info?.classId) return;

    const entries = Object.entries(attendance);
    if (entries.length === 0) {
      setError("Please mark attendance for at least one student.");
      return;
    }

    setIsSavingAttendance(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) { router.push("/login"); return; }

      const today = new Date().toISOString().split("T")[0];
      const records = entries.map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        date: today,
        status,
      }));

      const res = await fetch(`${API_BASE_URL}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ records }),
      });

      if (!res.ok) throw new Error("Failed to save attendance");

      setAttendanceSaved(true);
      await fetchStats();
    } catch (err: any) {
      setError(err.message || "Failed to save attendance.");
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const getGradeLetter = (score: number) => {
    if (score >= 90) return { letter: "A", color: "text-emerald-400" };
    if (score >= 80) return { letter: "B", color: "text-blue-400" };
    if (score >= 70) return { letter: "C", color: "text-yellow-400" };
    if (score >= 60) return { letter: "D", color: "text-orange-400" };
    return { letter: "F", color: "text-rose-400" };
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const showSkeleton = isClassLoading || isLoadingStats;

  if (showSkeleton) {
    return <DashboardSkeleton />;
  }

  if (classError || !info?.classId) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Teacher Dashboard</h1>
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 text-center shadow-xl">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-400">{classError || "You are not currently assigned to any class."}</p>
          <p className="text-slate-500 text-sm mt-1">Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{info.teacherName}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {info.className} • {info.subject} • {today}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 px-5 py-4 rounded-xl text-sm shadow-lg flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl shadow-lg hover:border-blue-500/20 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-2xl text-blue-500/10 group-hover:text-blue-500/20 transition-colors">👨‍🎓</div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">My Students</span>
          <h2 className="text-3xl font-extrabold text-white mt-1.5">{stats.totalStudents}</h2>
          <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Enrolled in {info.className}
          </span>
        </div>

        <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl shadow-lg hover:border-emerald-500/20 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-2xl text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">✅</div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Today&apos;s Attendance</span>
          <h2 className={`text-3xl font-extrabold mt-1.5 ${stats.todayMarked ? (stats.todayAttendanceRate >= 80 ? "text-emerald-400" : "text-yellow-400") : "text-slate-500"}`}>
            {stats.todayMarked ? `${stats.todayAttendanceRate}%` : "Not Marked"}
          </h2>
          <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${stats.todayMarked ? "bg-emerald-500" : "bg-slate-600"}`}></span>
            {stats.todayMarked ? "Attendance recorded" : "Mark below"}
          </span>
        </div>

        <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl shadow-lg hover:border-purple-500/20 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-2xl text-purple-500/10 group-hover:text-purple-500/20 transition-colors">📊</div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Class Average</span>
          <h2 className="text-3xl font-extrabold text-purple-400 mt-1.5">{stats.classGradeAvg}%</h2>
          <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> Grade average across subjects
          </span>
        </div>
      </div>

      {/* Quick Mark Attendance */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ✅ Quick Attendance — {info.className}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">{today}</p>
          </div>
          {attendanceSaved && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ✓ Saved
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3 text-center">Present</th>
                <th className="px-6 py-3 text-center">Absent</th>
                <th className="px-6 py-3 text-center">Late</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.students.map((student, idx) => {
                const status = attendance[student.id];
                return (
                  <tr key={student.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-3 text-slate-500 text-xs">{idx + 1}</td>
                    <td className="px-6 py-3 font-bold text-slate-200">{student.name}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => setStudentAttendance(student.id, "present")}
                        disabled={attendanceSaved}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all cursor-pointer disabled:cursor-default ${
                          status === "present"
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                            : "bg-slate-800 text-slate-500 hover:bg-emerald-500/20 hover:text-emerald-400 disabled:hover:bg-slate-800 disabled:hover:text-slate-500"
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => setStudentAttendance(student.id, "absent")}
                        disabled={attendanceSaved}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all cursor-pointer disabled:cursor-default ${
                          status === "absent"
                            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                            : "bg-slate-800 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 disabled:hover:bg-slate-800 disabled:hover:text-slate-500"
                        }`}
                      >
                        ✕
                      </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => setStudentAttendance(student.id, "late")}
                        disabled={attendanceSaved}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all cursor-pointer disabled:cursor-default ${
                          status === "late"
                            ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30"
                            : "bg-slate-800 text-slate-500 hover:bg-yellow-500/20 hover:text-yellow-400 disabled:hover:bg-slate-800 disabled:hover:text-slate-500"
                        }`}
                      >
                        !
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!attendanceSaved && (
          <div className="px-6 py-4 border-t border-white/5 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={isSavingAttendance || Object.keys(attendance).length === 0}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSavingAttendance ? "Saving..." : `💾 Save Attendance (${Object.keys(attendance).length}/${stats.students.length})`}
            </button>
          </div>
        )}
      </div>

      {/* Recent Grades */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">📝 Recent Grades — {info.className}</h2>
        </div>
        {stats.recentGrades.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500 text-sm">No grades recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Grade</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.recentGrades.map((g) => {
                  const grade = getGradeLetter(g.score);
                  return (
                    <tr key={g.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-3 font-bold text-slate-200">{g.studentName}</td>
                      <td className="px-6 py-3">{g.subject}</td>
                      <td className="px-6 py-3 font-bold text-white">{g.score}</td>
                      <td className="px-6 py-3">
                        <span className={`font-extrabold ${grade.color}`}>{grade.letter}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-500">{formatDate(g.examDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
