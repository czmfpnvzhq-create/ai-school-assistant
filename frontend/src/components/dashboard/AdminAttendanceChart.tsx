"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(
  () => import("./AdminAttendanceChartInner").then((m) => m.AdminAttendanceChartInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full bg-slate-800/30 rounded-xl animate-pulse flex items-center justify-center text-slate-500 text-sm">
        Loading chart…
      </div>
    ),
  }
);

export function AdminAttendanceChart({
  data,
}: {
  data: { name: string; rate: number }[];
}) {
  return <Chart data={data} />;
}
