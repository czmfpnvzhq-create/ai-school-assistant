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

export default function NoticeBoard() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) { router.push("/login"); return; }

      const res = await fetch(`${API_BASE_URL}/notices`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) { localStorage.removeItem("edunexus_token"); router.push("/login"); return; }
      if (!res.ok) throw new Error("Failed to load notices");

      setNotices(await res.json());
    } catch (err: any) {
      setError(err.message || "Failed to fetch notices.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">📢 Notice Board</h1>
        <p className="text-slate-400 text-sm mt-1">Stay updated with the latest school announcements.</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 px-5 py-4 rounded-xl text-sm shadow-lg flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">✕</button>
        </div>
      )}

      {/* Notices */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No notices available at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice, index) => (
            <div
              key={notice.id}
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl hover:border-blue-500/10 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center text-lg">
                  📢
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{notice.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">🕐 {formatDate(notice.createdAt)}</span>
                    <span className="flex items-center gap-1">👤 {notice.postedBy}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed pl-12">{notice.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
