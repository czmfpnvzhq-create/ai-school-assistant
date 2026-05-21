export default function DashboardRouteLoading() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      <div className="h-10 w-48 bg-slate-800/80 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-slate-900/50 rounded-2xl border border-white/5" />
        ))}
      </div>
      <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5" />
    </div>
  );
}
