"use client";

import React from "react";
import Link from "next/link";
import { AdminAttendanceChart } from "@/components/dashboard/AdminAttendanceChart";
import { useAdminStats } from "@/lib/hooks/useAdminStats";

function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8 animate-pulse">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl h-32">
             <div className="h-4 w-32 bg-slate-800 rounded mb-4"></div>
             <div className="h-8 w-16 bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Skeleton */}
          <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-6 h-96">
            <div className="h-6 w-48 bg-slate-800 rounded mb-6"></div>
            <div className="w-full h-72 bg-slate-800/50 rounded"></div>
          </div>
          {/* Top Students Skeleton */}
          <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-6 h-80">
            <div className="h-6 w-48 bg-slate-800 rounded mb-6"></div>
            <div className="space-y-4">
               {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 w-full bg-slate-800/50 rounded"></div>)}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           {/* Quick Actions Skeleton */}
           <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-6 h-64">
             <div className="h-6 w-40 bg-slate-800 rounded mb-6"></div>
             <div className="space-y-3">
               {[1, 2, 3].map((i) => <div key={i} className="h-14 w-full bg-slate-800/50 rounded-xl"></div>)}
             </div>
           </div>
           {/* Notices Skeleton */}
           <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-6 h-80">
             <div className="h-6 w-32 bg-slate-800 rounded mb-6"></div>
             <div className="space-y-4">
               {[1, 2, 3].map((i) => <div key={i} className="h-20 w-full bg-slate-800/50 rounded-xl"></div>)}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { stats, isLoading, error } = useAdminStats();

  if (isLoading && !stats) {
    return <DashboardSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="bg-rose-950/50 border border-rose-900/50 text-rose-400 p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p>{error || "Unknown error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 animate-fade-in-up">
      {/* 1. KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard icon="👨‍🎓" label="Total Students" value={stats.totalStudents.toLocaleString()} color="indigo" />
        <KpiCard icon="👨‍🏫" label="Total Teachers" value={stats.totalTeachers.toLocaleString()} color="cyan" />
        <KpiCard icon="🏫" label="Total Classes" value={stats.totalClasses.toLocaleString()} color="purple" />
        <KpiCard icon="💰" label="Fees Collected" value={`$${stats.feesCollected.toLocaleString()}`} color="green" />
        <KpiCard icon="⏳" label="Pending Fees" value={stats.feesPending.toLocaleString()} color="amber" />
        <KpiCard icon="⚠️" label="Absent Today" value={stats.absentToday.toLocaleString()} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Chart & Students (Takes 2 columns on wide screens) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. Attendance Chart */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span>📈</span> 7-Day Attendance Trend
            </h3>
            <AdminAttendanceChart data={stats.attendanceData} />
          </div>

          {/* 3. Top 5 Students Table */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-2xl overflow-hidden">
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span>🏆</span> Top Performing Students
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Rank</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Grade Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topStudents.map((student) => (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-4 font-bold text-slate-300">
                        {student.rank === 1 ? '🥇 1st' : student.rank === 2 ? '🥈 2nd' : student.rank === 3 ? '🥉 3rd' : `#${student.rank}`}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{student.name}</td>
                      <td className="px-4 py-4">{student.className}</td>
                      <td className="px-4 py-4 text-right">
                        <span className="bg-green-500/20 text-green-400 py-1 px-2.5 rounded-full font-bold">
                          {student.gradeAvg.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.topStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No student data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Notices & Quick Actions */}
        <div className="space-y-8">
          
          {/* 5. Quick Action Buttons */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span>⚡</span> Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/dashboard/admin/students" className="flex items-center gap-4 bg-slate-950/50 hover:bg-blue-600/20 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">➕</div>
                <div className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">Add Student</div>
              </Link>
              <Link href="/dashboard/admin/attendance" className="flex items-center gap-4 bg-slate-950/50 hover:bg-green-600/20 p-4 rounded-xl border border-white/5 hover:border-green-500/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">✅</div>
                <div className="font-bold text-slate-200 group-hover:text-green-400 transition-colors">Mark Attendance</div>
              </Link>
              <Link href="/dashboard/admin/ai-assistant" className="flex items-center gap-4 bg-slate-950/50 hover:bg-purple-600/20 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🤖</div>
                <div className="font-bold text-slate-200 group-hover:text-purple-400 transition-colors">AI Assistant</div>
              </Link>
            </div>
          </div>

          {/* 4. Recent Notices */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2 relative z-10">
              <span>📢</span> Notice Board
            </h3>
            <div className="space-y-4 relative z-10">
              {stats.recentNotices.map((notice) => (
                <div key={notice.id} className="bg-slate-950/40 p-4 rounded-xl border border-white/5 hover:border-amber-500/20 transition-colors">
                  <div className="text-xs text-amber-400 font-bold mb-1">
                    {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h4 className="font-bold text-slate-200 text-sm mb-2">{notice.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              ))}
              {stats.recentNotices.length === 0 && (
                <div className="text-center text-slate-500 py-4 text-sm">No recent notices found.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: string, label: string, value: string, color: 'indigo'|'cyan'|'purple'|'green'|'amber'|'rose' }) {
  const colorStyles = {
    indigo: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    green: "from-green-500/20 to-green-600/5 border-green-500/20 text-green-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    rose: "from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400",
  };

  const bgStyle = colorStyles[color];

  return (
    <div className={`bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${bgStyle.split(' ')[0]} ${bgStyle.split(' ')[1]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <h3 className="text-3xl font-extrabold text-white">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${bgStyle.split(' ')[2]} bg-slate-950/50 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
