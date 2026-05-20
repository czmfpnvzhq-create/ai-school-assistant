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

function SkeletonNotices() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 animate-pulse">
          <div className="flex gap-3 mb-2">
            <div className="h-6 w-6 bg-slate-800 rounded-full" />
            <div className="h-6 w-1/3 bg-slate-800 rounded" />
          </div>
          <div className="space-y-2 mt-4">
            <div className="h-4 w-full bg-slate-800 rounded" />
            <div className="h-4 w-5/6 bg-slate-800 rounded" />
          </div>
          <div className="flex gap-4 mt-6">
            <div className="h-3 w-24 bg-slate-800 rounded" />
            <div className="h-3 w-24 bg-slate-800 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function AdminNotices() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const getToken = () => localStorage.getItem("edunexus_token");

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
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

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) { setError("Title and content are required."); return; }
    setIsSaving(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) { router.push("/login"); return; }

      const res = await fetch(`${API_BASE_URL}/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) throw new Error("Failed to post notice");

      setTitle("");
      setContent("");
      setShowModal(false);
      await fetchNotices();
    } catch (err: any) {
      setError(err.message || "Failed to post notice.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setError(null);
    try {
      const token = getToken();
      if (!token) { router.push("/login"); return; }

      const res = await fetch(`${API_BASE_URL}/notices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete notice");
      await fetchNotices();
    } catch (err: any) {
      setError(err.message || "Failed to delete notice.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Notice Board</h1>
          <p className="text-slate-400 text-sm mt-1">Post announcements and updates for the entire school.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 cursor-pointer"
        >
          + Post New Notice
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 px-5 py-4 rounded-xl text-sm shadow-lg flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">✕</button>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-4">
        {isLoading ? (
          <SkeletonNotices />
        ) : notices.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">No notices have been posted yet.</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl hover:border-blue-500/10 transition-all duration-300 animate-fade-in"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">📢</span>
                    <h3 className="text-lg font-bold text-white truncate">{notice.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">🕐 {formatDate(notice.createdAt)}</span>
                    <span className="flex items-center gap-1">👤 {notice.postedBy}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notice.id)}
                  disabled={deletingId === notice.id}
                  className="shrink-0 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {deletingId === notice.id ? "..." : "🗑 Delete"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl mx-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-white">Post New Notice</h2>
              <button
                onClick={() => { setShowModal(false); setTitle(""); setContent(""); }}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Exam Schedule Released"
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/30 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder="Write the full announcement here..."
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/30 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setTitle(""); setContent(""); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? "Posting..." : "📢 Post Notice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
