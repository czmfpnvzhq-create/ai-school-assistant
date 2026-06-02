// TeacherDashboardClient.tsx – Client component for Teacher Dashboard
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { getToken } from "@/lib/useTeacherData";
import DashboardSkeleton from "../loading";
import ErrorComponent from "../error";

// Types
interface Stats {
  totalStudents: number;
  averageScore: number;
  classesTaught: number;
  // add other fields as needed
}

interface StudentRow {
  id: string;
  name: string;
  email: string;
  // add other fields as needed
}

interface TeacherDashboardClientProps {
  classId: string;
}

export default function TeacherDashboardClient({ classId }: TeacherDashboardClientProps) {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Prefetch the dashboard route for faster navigation (example)
  useEffect(() => {
    router.prefetch(`/dashboard/teacher`);
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/dashboard/teacher-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      // Backend returns a flat object with fields like totalStudents, classGradeAvg, students, etc.
      // Map that shape to the UI-friendly `stats` and `students` used by this component.
      setStats({
        totalStudents: data.totalStudents ?? 0,
        averageScore: data.classGradeAvg ?? 0,
        classesTaught: data.assignedClass ? 1 : 0,
      });

      // Normalize students to the expected StudentRow shape
      const studentsFromApi = Array.isArray(data.students) ? data.students : [];
      const normalized: StudentRow[] = studentsFromApi.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        email: s.email ?? "",
      }));
      setStudents(normalized);
      // Initialize attendance map
      const initialAttendance: Record<string, boolean> = {};
      data.students.forEach((s: StudentRow) => {
        initialAttendance[s.id] = false;
      });
      setAttendance(initialAttendance);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const saveAttendance = async () => {
    setIsSavingAttendance(true);
    try {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      const presentIds = Object.entries(attendance)
        .filter(([, present]) => present)
        .map(([id]) => id);
      const res = await fetch(`${API_BASE_URL}/dashboard/teacher-attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classId, presentIds }),
      });
      if (!res.ok) throw new Error("Failed to save attendance");
      // Optionally refresh stats after saving
      await fetchStats();
    } catch (err: any) {
      setError(err);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorComponent error={error} />;

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Teacher Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of your class and quick actions.</p>
      </div>

      {/* Stats Cards (styled like other dashboards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Students</p>
          <p className="text-3xl font-extrabold text-slate-200">{stats?.totalStudents ?? "-"}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Average Score</p>
          <p className="text-3xl font-extrabold text-blue-400">{typeof stats?.averageScore === 'number' ? stats.averageScore.toFixed(2) + '%' : '-'}</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Classes Taught</p>
          <p className="text-3xl font-extrabold text-slate-200">{stats?.classesTaught ?? "-"}</p>
        </div>
      </div>

      {/* Attendance Section (match app table styles) */}
      <section className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Mark Attendance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Present</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-slate-500">No students found.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">{student.name}</td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={attendance[student.id] || false}
                        onChange={() => toggleAttendance(student.id)}
                        className="rounded"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button
          onClick={saveAttendance}
          disabled={isSavingAttendance}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded"
        >
          {isSavingAttendance ? "Saving..." : "Save Attendance"}
        </button>
      </section>
    </div>
  );
}
