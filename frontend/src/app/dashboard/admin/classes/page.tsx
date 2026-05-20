"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface TeacherInfo {
  id: number;
  name: string;
  subject: string;
}

interface ClassData {
  id: number;
  name: string;
  teacher: string;
  createdAt: string;
  studentCount: number;
  teacherCount: number;
  assignedTeachers: TeacherInfo[];
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 h-48">
          <div className="flex gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-800 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-24 bg-slate-800 rounded" />
              <div className="h-3 w-32 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-slate-800/50 rounded-xl" />
            <div className="h-16 bg-slate-800/50 rounded-xl" />
            <div className="h-16 bg-slate-800/50 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ClassManagement() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [formName, setFormName] = useState("");
  const [formTeacher, setFormTeacher] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const getToken = () => localStorage.getItem("edunexus_token");

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) { router.push("/login"); return; }

      const res = await fetch(`${API_BASE_URL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) { localStorage.removeItem("edunexus_token"); router.push("/login"); return; }
      if (!res.ok) throw new Error("Failed to load classes");

      setClasses(await res.json());
    } catch (err: any) {
      setError(err.message || "Failed to fetch classes.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const openCreateModal = () => {
    setEditingClass(null);
    setFormName("");
    setFormTeacher("");
    setShowModal(true);
  };

  const openEditModal = (cls: ClassData) => {
    setEditingClass(cls);
    setFormName(cls.name);
    setFormTeacher(cls.teacher);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormName("");
    setFormTeacher("");
  };

  const handleSave = async () => {
    if (!formName.trim() || !formTeacher.trim()) {
      setError("Class name and teacher name are required.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) { router.push("/login"); return; }

      const url = editingClass
        ? `${API_BASE_URL}/classes/${editingClass.id}`
        : `${API_BASE_URL}/classes`;

      const res = await fetch(url, {
        method: editingClass ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: formName.trim(), teacher: formTeacher.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save class");
      }

      closeModal();
      await fetchClasses();
    } catch (err: any) {
      setError(err.message || "Failed to save class.");
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

      const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete class");
      }

      await fetchClasses();
    } catch (err: any) {
      setError(err.message || "Failed to delete class.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  // Summary stats
  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
  const totalTeachers = classes.reduce((sum, c) => sum + c.teacherCount, 0);

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Class Management</h1>
          <p className="text-slate-400 text-sm mt-1">Organize classes, assign teachers, and track enrollment.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 cursor-pointer"
        >
          + Add New Class
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl shadow-lg hover:border-blue-500/20 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-2xl text-blue-500/10 group-hover:text-blue-500/20 transition-colors">🏫</div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Classes</span>
          <h2 className="text-2xl font-extrabold text-white mt-1.5">{classes.length}</h2>
          <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Active classes
          </span>
        </div>
        <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl shadow-lg hover:border-emerald-500/20 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-2xl text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">👨‍🎓</div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Students</span>
          <h2 className="text-2xl font-extrabold text-emerald-400 mt-1.5">{totalStudents}</h2>
          <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Enrolled across all classes
          </span>
        </div>
        <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl shadow-lg hover:border-purple-500/20 transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-2xl text-purple-500/10 group-hover:text-purple-500/20 transition-colors">👨‍🏫</div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Assigned Teachers</span>
          <h2 className="text-2xl font-extrabold text-purple-400 mt-1.5">{totalTeachers}</h2>
          <span className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> Teachers linked to classes
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 px-5 py-4 rounded-xl text-sm shadow-lg flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">✕</button>
        </div>
      )}

      {/* Classes Grid */}
      {isLoading ? (
        <SkeletonCards />
      ) : classes.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-3">🏫</p>
          <p className="text-sm">No classes have been created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl hover:border-blue-500/10 transition-all duration-300 animate-fade-in group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-400">
                    {cls.name.replace(/[^0-9]/g, "") || "?"}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{cls.name}</h3>
                    <p className="text-xs text-slate-500">Created {formatDate(cls.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(cls)}
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    disabled={deletingId === cls.id}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === cls.id ? "..." : "🗑"}
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-950/50 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xl font-extrabold text-white">{cls.studentCount}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">Students</p>
                </div>
                <div className="bg-slate-950/50 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-xl font-extrabold text-white">{cls.teacherCount}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">Teachers</p>
                </div>
                <div className="bg-slate-950/50 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-sm font-bold text-slate-300 truncate" title={cls.teacher}>{cls.teacher.split(" ").pop()}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">Class Head</p>
                </div>
              </div>

              {/* Assigned Teachers */}
              {cls.assignedTeachers.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned Teachers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.assignedTeachers.map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700"
                      >
                        👨‍🏫 {t.name} • {t.subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl mx-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-white">
                {editingClass ? "Edit Class" : "Add New Class"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white text-lg cursor-pointer">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Class 9"
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/30 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class Teacher (Head)</label>
                <input
                  type="text"
                  value={formTeacher}
                  onChange={(e) => setFormTeacher(e.target.value)}
                  placeholder="e.g. Mr. Hassan Ali"
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/30 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? "Saving..." : editingClass ? "💾 Update Class" : "🏫 Create Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
