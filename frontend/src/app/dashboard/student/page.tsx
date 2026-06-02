"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface Notice {
  id: number;
  title: string;
  content: string;
  postedBy: string;
  createdAt: string;
}

interface Grade {
  id: number;
  subject: string;
  score: number;
  examDate: string;
}

interface StudentStats {
  student: {
    id: number;
    name: string;
    className: string;
    gradeAvg: number;
    attendance: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      percentage: number;
    };
    recentGrades: Grade[];
  } | null;
  recentNotices: Notice[];
}

// Skeleton loaders for premium feel
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-8">
      <div className="h-10 w-64 bg-slate-800 rounded-lg mb-2" />
      <div className="h-4 w-96 bg-slate-800 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-48 bg-slate-900/50 rounded-2xl" />
          <div className="h-64 bg-slate-900/50 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-slate-900/50 rounded-2xl" />
          <div className="h-80 bg-slate-900/50 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/dashboard/student-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("edunexus_token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data.");
      }

      const payload = await res.json();
      setData(payload);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getGradeLetter = (score: number) => {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-rose-400 mb-2">Failed to load dashboard</h2>
        <p className="text-slate-400 text-sm max-w-md">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const student = data?.student;
  const notices = data?.recentNotices || [];

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-6">📭</div>
        <h2 className="text-2xl font-bold text-white mb-2">No Student Records Found</h2>
        <p className="text-slate-400 text-sm max-w-md">
          We couldn't find a student record associated with your account name. Please contact the administration for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, {student.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Info */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">
              🎓
            </div>
            <h2 className="text-lg font-bold text-white mb-6">My Profile</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Student Name</p>
                <p className="text-lg font-extrabold text-slate-200">{student.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Class</p>
                <p className="text-lg font-extrabold text-slate-200">{student.className}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Grade</p>
                <p className="text-lg font-extrabold text-blue-400">{typeof student.gradeAvg === 'number' ? `${student.gradeAvg.toFixed(2)}%` : '-'} ({getGradeLetter(student.gradeAvg)})</p>
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Recent Exam Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-center">Grade</th>
                    <th className="px-6 py-4 text-right">Exam Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {student.recentGrades.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No recent exam results found.
                      </td>
                    </tr>
                  ) : (
                    student.recentGrades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-200">{grade.subject}</td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-300">{grade.score}%</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border
                            ${grade.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              grade.score >= 60 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                              'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            {getGradeLetter(grade.score)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400">{formatDate(grade.examDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Attendance Summary */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300">
            <h2 className="text-lg font-bold text-white mb-6">Attendance Summary</h2>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="36" cx="40" cy="40" />
                  <circle
                    className={`transition-all duration-1000 ease-out ${student.attendance.percentage >= 80 ? 'text-emerald-500' : student.attendance.percentage >= 60 ? 'text-amber-500' : 'text-rose-500'}`}
                    strokeWidth="6"
                    strokeDasharray={226.2}
                    strokeDashoffset={226.2 - (226.2 * student.attendance.percentage) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="36"
                    cx="40"
                    cy="40"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-extrabold text-white">{student.attendance.percentage}%</span>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present</span>
                  <span className="text-sm font-bold text-slate-200">{student.attendance.presentDays} d</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Absent</span>
                  <span className="text-sm font-bold text-slate-200">{student.attendance.absentDays} d</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
              Based on last {student.attendance.totalDays} recorded days
            </p>
          </div>

          {/* Recent Notices */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center justify-between">
                Notice Board
                <span className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">New</span>
              </h2>
            </div>
            <div className="p-6 space-y-5 flex-1">
              {notices.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <p className="text-2xl mb-2">📭</p>
                  <p className="text-xs">No recent announcements.</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="group relative">
                    <div className="absolute -inset-x-4 -inset-y-2 bg-white/[0.02] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-bold text-slate-200 truncate pr-2">{notice.title}</h3>
                        <span className="text-[10px] text-slate-500 shrink-0">{formatDate(notice.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{notice.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
