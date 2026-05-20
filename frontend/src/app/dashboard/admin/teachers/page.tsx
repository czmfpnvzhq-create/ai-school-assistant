"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface ClassData {
  id: number;
  name: string;
  teacher: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  subject: string;
  classId: number | null;
  class: ClassData | null;
  createdAt: string;
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-800 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
          <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-800 rounded-full" /></td>
          <td className="px-6 py-4"><div className="ml-auto h-8 w-32 bg-slate-800 rounded-lg" /></td>
        </tr>
      ))}
    </>
  );
}

export default function TeacherManagement() {
  const router = useRouter();

  // List states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<number | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formClassId, setFormClassId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/teachers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("edunexus_token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load teachers data.");
      }

      const data = await res.json();
      setTeachers(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch teachers.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/students/classes/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (err) {
      console.error("Failed to load classes", err);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, [fetchTeachers, fetchClasses]);

  // Reset Form
  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormSubject("");
    setFormClassId("");
    setFormError(null);
  };

  // Open Edit Modal
  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormName(teacher.name);
    setFormEmail(teacher.email);
    setFormSubject(teacher.subject);
    setFormClassId(teacher.classId ? teacher.classId.toString() : "");
    setFormError(null);
  };

  // Handle Add Submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsFormSubmitting(true);

    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          subject: formSubject,
          classId: formClassId ? parseInt(formClassId, 10) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create teacher.");
      }

      setIsAddOpen(false);
      resetForm();
      fetchTeachers();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Handle Edit Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    setFormError(null);
    setIsFormSubmitting(true);

    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/teachers/${editingTeacher.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          subject: formSubject,
          classId: formClassId ? parseInt(formClassId, 10) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update teacher.");
      }

      setEditingTeacher(null);
      resetForm();
      fetchTeachers();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingTeacherId) return;

    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/teachers/${deletingTeacherId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete teacher.");
      }

      setDeletingTeacherId(null);
      fetchTeachers();
    } catch (err: any) {
      alert(err.message || "Could not delete teacher.");
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Teachers Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage institutional instructors, subjects, and class assignments.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>➕</span> Add Teacher
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 px-5 py-4 rounded-xl text-sm shadow-lg flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">✕</button>
        </div>
      )}

      {/* Teachers Table Panel */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
              <tr>
                <th className="px-6 py-4 rounded-l-lg">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Assigned Class</th>
                <th className="px-6 py-4 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <SkeletonRows />
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    No teacher records found. Click "Add Teacher" to populate the database.
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-white/[0.01] transition-colors animate-fade-in">
                    <td className="px-6 py-4.5 font-bold text-slate-200">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4.5 text-slate-300">
                      {teacher.email}
                    </td>
                    <td className="px-6 py-4.5 font-medium text-slate-400">
                      {teacher.subject}
                    </td>
                    <td className="px-6 py-4.5">
                      {teacher.class ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20">
                          🏫 {teacher.class.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(teacher)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold py-1.5 px-3 rounded-lg text-xs border border-white/5 transition-all cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeletingTeacherId(teacher.id)}
                          className="bg-rose-950/30 hover:bg-rose-950/80 text-rose-400 hover:text-rose-300 font-semibold py-1.5 px-3 rounded-lg text-xs border border-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-scale-up">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>➕</span> Add New Teacher
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-500 hover:text-white text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Professor Smith"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. smith@school.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Subject Expertise *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Calculus, English"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Assign Class
                </label>
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer"
                >
                  <option value="">Unassigned / None</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all shadow-lg cursor-pointer"
                >
                  {isFormSubmitting ? "Creating..." : "Save Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-scale-up">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>✏️</span> Edit Teacher Details
              </h2>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-slate-500 hover:text-white text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Professor Smith"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. smith@school.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Subject Expertise *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, Calculus, English"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Assign Class
                </label>
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer"
                >
                  <option value="">Unassigned / None</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all shadow-lg cursor-pointer"
                >
                  {isFormSubmitting ? "Updating..." : "Update Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeacherId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/20 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-white">Delete Teacher Account?</h3>
              <p className="text-slate-400 text-sm">
                This action is irreversible. Deleting this teacher will also delete their corresponding login user account.
              </p>
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => setDeletingTeacherId(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all shadow-lg cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
