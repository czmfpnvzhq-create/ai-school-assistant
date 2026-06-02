"use client";

// error.tsx – Simple error UI for Teacher Dashboard

export default function Error({ error }: { error: any }) {
  return (
    <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 p-5 rounded-xl">
      ⚠️ {error?.message || "An error occurred"}
    </div>
  );
}
