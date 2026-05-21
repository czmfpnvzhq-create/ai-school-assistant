"use client";

import React, { useMemo } from "react";
import { ParentPageShell } from "@/components/parent/ParentPageShell";
import { useParentData } from "@/lib/useParentData";
import { formatDate, getGradeLetter, getScoreColorClass } from "@/lib/parent/utils";

export default function ParentGradesPage() {
  const { child, isLoading, error, refetch } = useParentData();

  const grades = child?.grades ?? child?.recentGrades ?? [];

  const subjectAvg = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const g of grades) {
      const entry = map.get(g.subject) ?? { total: 0, count: 0 };
      entry.total += g.score;
      entry.count += 1;
      map.set(g.subject, entry);
    }
    return Array.from(map.entries()).map(([subject, { total, count }]) => ({
      subject,
      avg: parseFloat((total / count).toFixed(1)),
    }));
  }, [grades]);

  return (
    <ParentPageShell
      title="Child's Grades"
      subtitle="Exam results and subject performance"
      icon="📝"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      noChild={!isLoading && !error && !child}
      childName={child?.name}
    >
      {child && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 shadow-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Class</p>
              <p className="text-xl font-extrabold text-white">{child.className}</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-blue-500/20 p-5 shadow-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Average</p>
              <p className="text-xl font-extrabold text-blue-400">
                {child.gradeAvg}% <span className="text-sm text-slate-400">({getGradeLetter(child.gradeAvg)})</span>
              </p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 shadow-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Exams Recorded</p>
              <p className="text-xl font-extrabold text-white">{grades.length}</p>
            </div>
          </div>

          {/* Subject averages */}
          {subjectAvg.length > 0 && (
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">Performance by Subject</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {subjectAvg.map((s) => (
                  <div
                    key={s.subject}
                    className="bg-slate-950/50 rounded-xl border border-white/5 p-4 text-center hover:border-blue-500/20 transition-colors"
                  >
                    <p className="text-xs text-slate-400 mb-1 truncate">{s.subject}</p>
                    <p className="text-lg font-extrabold text-slate-100">{s.avg}%</p>
                    <span
                      className={`inline-flex mt-2 items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold border ${getScoreColorClass(s.avg)}`}
                    >
                      {getGradeLetter(s.avg)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full grades table */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">All Exam Results</h2>
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
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No exam results recorded yet.
                      </td>
                    </tr>
                  ) : (
                    grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-200">{grade.subject}</td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-300">{grade.score}%</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${getScoreColorClass(grade.score)}`}
                          >
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
        </>
      )}
    </ParentPageShell>
  );
}
