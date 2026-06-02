// loading.tsx – Skeleton UI for Teacher Dashboard

export default function DashboardSkeleton() {
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
          <div
            key={i}
            className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl h-32"
          >
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
