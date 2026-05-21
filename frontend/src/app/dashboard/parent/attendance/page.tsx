"use client";

import React, { useMemo } from "react";
import { ParentPageShell } from "@/components/parent/ParentPageShell";
import { useParentData } from "@/lib/useParentData";
import {
  formatDate,
  getAttendanceStatusLabel,
  getAttendanceStatusStyle,
} from "@/lib/parent/utils";

export default function ParentAttendancePage() {
  const { child, isLoading, error, refetch } = useParentData();

  const records = child?.attendance?.records ?? [];
  const att = child?.attendance;

  const statusCounts = useMemo(() => {
    return records.reduce(
      (acc, r) => {
        if (r.status === "present") acc.present += 1;
        else if (r.status === "late") acc.late += 1;
        else acc.absent += 1;
        return acc;
      },
      { present: 0, late: 0, absent: 0 }
    );
  }, [records]);

  return (
    <ParentPageShell
      title="Child's Attendance"
      subtitle="Daily attendance history and summary"
      icon="✅"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      noChild={!isLoading && !error && !child}
      childName={child?.name}
    >
      {child && att && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ring chart card */}
            <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col items-center justify-center">
              <h2 className="text-lg font-bold text-white mb-6 w-full text-left">Attendance Rate</h2>
              <div className="relative w-32 h-32 mb-6">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className={`transition-all duration-1000 ease-out ${
                      att.percentage >= 80
                        ? "text-emerald-500"
                        : att.percentage >= 60
                        ? "text-amber-500"
                        : "text-rose-500"
                    }`}
                    strokeWidth="8"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 - (351.86 * att.percentage) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-extrabold text-white">{att.percentage}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center uppercase tracking-widest font-bold">
                Last {att.totalDays} school days
              </p>
            </div>

            {/* Stats breakdown */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Present" value={att.presentDays} color="emerald" icon="✓" />
              <StatCard label="Late" value={att.lateDays ?? statusCounts.late} color="amber" icon="⏰" />
              <StatCard label="Absent" value={att.absentDays} color="rose" icon="✕" />
            </div>
          </div>

          {/* Records table */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Attendance Log</h2>
              <span className="text-xs text-slate-500">{records.length} records</span>
            </div>
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Day</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    records.map((rec, i) => {
                      const d = new Date(rec.date);
                      return (
                        <tr key={`${rec.date}-${i}`} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-200">{formatDate(rec.date)}</td>
                          <td className="px-6 py-4 text-center text-slate-500">
                            {d.toLocaleDateString("en-US", { weekday: "short" })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getAttendanceStatusStyle(rec.status)}`}
                            >
                              {getAttendanceStatusLabel(rec.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </ParentPageShell>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber" | "rose";
  icon: string;
}) {
  const styles = {
    emerald: "border-emerald-500/20 from-emerald-500/10",
    amber: "border-amber-500/20 from-amber-500/10",
    rose: "border-rose-500/20 from-rose-500/10",
  };
  const textStyles = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${styles[color]} to-transparent backdrop-blur-md rounded-2xl border p-6 shadow-xl`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-3xl font-extrabold ${textStyles[color]}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">days</p>
    </div>
  );
}
