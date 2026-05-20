"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
}

interface Grade {
  id: number;
  subject: string;
  score: number;
  examDate: string;
}

interface Fee {
  id: number;
  amount: number;
  paid: boolean;
  dueDate: string;
  paidAt: string | null;
}

interface StudentDetailData {
  id: number;
  name: string;
  class: {
    id: number;
    name: string;
    teacher: string;
  };
  gradeAvg: number;
  parentEmail: string | null;
  phone: string | null;
  address: string | null;
  attendanceSummary: AttendanceSummary;
  grades: Grade[];
  fees: Fee[];
}

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const studentId = params.id;

  const [student, setStudent] = useState<StudentDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `edunexus_student_cache_${studentId}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        setStudent(JSON.parse(cachedData));
        setIsLoading(false);
      } catch (e) {
        console.error("Failed to parse cached student details", e);
      }
    }

    async function fetchStudentDetail() {
      if (!cachedData) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const token = localStorage.getItem("edunexus_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("edunexus_token");
          router.push("/login");
          return;
        }

        if (res.status === 404) {
          throw new Error("Student record not found");
        }

        if (!res.ok) {
          throw new Error("Failed to load student details");
        }

        const data = await res.json();
        setStudent(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err: any) {
        if (!cachedData) {
          setError(err.message || "An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (studentId) {
      fetchStudentDetail();
    }
  }, [studentId, router]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-4">Loading student profile data...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-rose-950/50 border border-rose-900/50 text-rose-400 p-6 rounded-2xl space-y-4">
        <h2 className="text-xl font-bold">Error Loading Profile</h2>
        <p>{error || "Unable to display student details."}</p>
        <Link
          href="/dashboard/admin/students"
          className="inline-block bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs px-4 py-2 rounded-xl transition-colors border border-white/5"
        >
          Back to Students List
        </Link>
      </div>
    );
  }

  const { attendanceSummary } = student;
  const unpaidFeesCount = student.fees.filter((f) => !f.paid).length;
  const totalUnpaidAmount = student.fees.filter((f) => !f.paid).reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-8 pb-8 animate-fade-in-up">
      {/* Top Navigation & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/students"
            className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 hover:border-white/10 flex items-center justify-center hover:scale-105 hover:bg-slate-800 transition-all text-xl cursor-pointer"
            title="Go back to list"
          >
            ⬅️
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              {student.name}
              <span className="bg-blue-500/20 text-blue-400 py-1 px-3 rounded-full text-xs font-bold border border-blue-500/20">
                {student.class.name}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Student Profile Details & Metrics</p>
          </div>
        </div>
      </div>

      {/* KPI stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatKpiCard
          title="Grade Average"
          value={`${student.gradeAvg.toFixed(1)}%`}
          label="Cumulative GPA"
          color={student.gradeAvg >= 85 ? "green" : student.gradeAvg >= 70 ? "amber" : "rose"}
          icon="🎓"
        />
        <StatKpiCard
          title="Attendance Rate"
          value={`${attendanceSummary.rate}%`}
          label="Present & Late ratio"
          color={attendanceSummary.rate >= 90 ? "green" : attendanceSummary.rate >= 75 ? "amber" : "rose"}
          icon="📅"
        />
        <StatKpiCard
          title="Fees Outstanding"
          value={`$${totalUnpaidAmount.toLocaleString()}`}
          label={`${unpaidFeesCount} unpaid invoices`}
          color={totalUnpaidAmount === 0 ? "green" : "rose"}
          icon="💵"
        />
        <StatKpiCard
          title="Home Room"
          value={student.class.name}
          label={`Teacher: ${student.class.teacher}`}
          color="indigo"
          icon="🏫"
        />
      </div>

      {/* Profile Details & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Grades & Fees (Takes 2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Subject Grades */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span>📊</span> Subject Grades
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Subject</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Exam Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {student.grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-200">{grade.subject}</td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs py-1 px-2.5 rounded-full ${
                            grade.score >= 85
                              ? "bg-green-500/20 text-green-400"
                              : grade.score >= 70
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {grade.score}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-slate-500">{grade.examDate}</td>
                    </tr>
                  ))}
                  {student.grades.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                        No graded exams found for this student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fees Status */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span>🧾</span> Invoice & Fee Logs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {student.fees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-slate-200">${fee.amount.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs py-1 px-2.5 rounded-lg font-bold border ${
                            fee.paid
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {fee.paid ? "● Paid" : "○ Unpaid"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs">{fee.dueDate}</td>
                      <td className="px-4 py-4 text-right text-xs text-slate-500">{fee.paidAt || "—"}</td>
                    </tr>
                  ))}
                  {student.fees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No financial logs registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Details & Attendance Overview */}
        <div className="space-y-8">
          {/* Contact Details */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span>👤</span> Contact Information
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Parent Email</span>
                <span className="text-slate-200 break-all">{student.parentEmail || "—"}</span>
              </div>
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</span>
                <span className="text-slate-200">{student.phone || "—"}</span>
              </div>
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mailing Address</span>
                <span className="text-slate-200 line-clamp-3 leading-relaxed">{student.address || "—"}</span>
              </div>
            </div>
          </div>

          {/* Attendance Log summary */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span>📆</span> Attendance Overview
            </h3>

            {/* Micro attendance summary items */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm font-bold text-green-400">
                    P
                  </div>
                  <span className="font-semibold text-slate-300">Days Present</span>
                </div>
                <span className="font-mono font-bold text-slate-100 text-base">{attendanceSummary.present}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-sm font-bold text-rose-400">
                    A
                  </div>
                  <span className="font-semibold text-slate-300">Days Absent</span>
                </div>
                <span className="font-mono font-bold text-slate-100 text-base">{attendanceSummary.absent}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">
                    L
                  </div>
                  <span className="font-semibold text-slate-300">Days Late</span>
                </div>
                <span className="font-mono font-bold text-slate-100 text-base">{attendanceSummary.late}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-500/20 flex items-center justify-center text-sm font-bold text-slate-400">
                    Σ
                  </div>
                  <span className="font-semibold text-slate-300">Total Tracked Days</span>
                </div>
                <span className="font-mono font-bold text-slate-100 text-base">{attendanceSummary.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatKpiCard({
  title,
  value,
  label,
  color,
  icon,
}: {
  title: string;
  value: string;
  label: string;
  color: "indigo" | "green" | "amber" | "rose";
  icon: string;
}) {
  const colorStyles = {
    indigo: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400",
    green: "from-green-500/20 to-green-600/5 border-green-500/20 text-green-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    rose: "from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400",
  };

  const bgStyle = colorStyles[color];

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgStyle.split(" ")[0]} ${bgStyle.split(" ")[1]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-2xl font-extrabold text-white">{value}</h3>
          <p className="text-[10px] text-slate-500 mt-1">{label}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${bgStyle.split(" ")[2]} bg-slate-950/50 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
