"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface Student {
  id: number;
  name: string;
  classId: number;
  class: {
    id: number;
    name: string;
    teacher: string;
  };
  gradeAvg: number;
  parentEmail: string | null;
  phone: string | null;
  address: string | null;
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-800 rounded" /></td>
          <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded" /></td>
          <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-800 rounded-lg" /></td>
          <td className="px-6 py-4"><div className="mx-auto h-6 w-16 bg-slate-800 rounded-full" /></td>
          <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-800 rounded" /></td>
          <td className="px-6 py-4"><div className="ml-auto h-8 w-48 bg-slate-800 rounded-lg" /></td>
        </tr>
      ))}
    </>
  );
}

export default function StudentManagement() {
  const router = useRouter();

  // Table & Filter state
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  // Loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formClass, setFormClass] = useState("Class 6");
  const [formParentEmail, setFormParentEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Fetch students function
  const fetchStudents = useCallback(async (bypassCache = false) => {
    const isDefaultView = page === 1 && search === "" && classFilter === "All";
    let hasCache = false;

    if (isDefaultView && !bypassCache) {
      const cached = localStorage.getItem("edunexus_students_cache");
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setStudents(cachedData.students || []);
          setTotal(cachedData.total || 0);
          setPages(cachedData.pages || 1);
          setIsLoading(false);
          hasCache = true;
        } catch (e) {
          console.error("Failed to parse cached students", e);
        }
      }
    }

    if (!hasCache) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search,
      });
      if (classFilter !== "All") {
        queryParams.append("class", classFilter);
      }

      const res = await fetch(`${API_BASE_URL}/students?${queryParams.toString()}`, {
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
        throw new Error("Failed to fetch students data");
      }

      const data = await res.json();
      setStudents(data.students || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);

      if (isDefaultView) {
        localStorage.setItem("edunexus_students_cache", JSON.stringify(data));
      }
    } catch (err: any) {
      if (!hasCache) {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, search, classFilter, router]);

  // Load students on changes
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Reset form helper
  const resetForm = () => {
    setFormName("");
    setFormClass("Class 6");
    setFormParentEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormError(null);
  };

  // Add Student submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Full Name is required");
      return;
    }

    setIsFormSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("edunexus_token");
      const res = await fetch(`${API_BASE_URL}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          className: formClass,
          parentEmail: formParentEmail || null,
          phone: formPhone || null,
          address: formAddress || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create student");
      }

      setIsAddOpen(false);
      resetForm();
      fetchStudents(true);
    } catch (err: any) {
      setFormError(err.message || "Error submitting form");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Edit modal opener
  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormClass(student.class.name);
    setFormParentEmail(student.parentEmail || "");
    setFormPhone(student.phone || "");
    setFormAddress(student.address || "");
    setFormError(null);
  };

  // Edit Student submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !editingStudent) {
      setFormError("Full Name is required");
      return;
    }

    setIsFormSubmitting(true);
    setFormError(null);

    try {
      const token = localStorage.getItem("edunexus_token");
      const res = await fetch(`${API_BASE_URL}/students/${editingStudent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          className: formClass,
          parentEmail: formParentEmail || null,
          phone: formPhone || null,
          address: formAddress || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update student");
      }

      localStorage.removeItem(`edunexus_student_cache_${editingStudent.id}`);
      setEditingStudent(null);
      resetForm();
      fetchStudents(true);
    } catch (err: any) {
      setFormError(err.message || "Error updating student");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Delete Student
  const handleDeleteConfirm = async () => {
    if (!deletingStudentId) return;

    try {
      const token = localStorage.getItem("edunexus_token");
      const res = await fetch(`${API_BASE_URL}/students/${deletingStudentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete student");
      }

      localStorage.removeItem(`edunexus_student_cache_${deletingStudentId}`);
      setDeletingStudentId(null);
      fetchStudents(true);
    } catch (err: any) {
      alert(err.message || "Error deleting student");
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage, view, and edit enrolled school students.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-2"
        >
          <span>➕</span> Add Student
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-4 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400">🔍</span>
          <input
            type="text"
            placeholder="Search students by name or class..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950/50 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Dropdown filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">Filter Class:</label>
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 bg-slate-950/50 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer"
          >
            <option value="All">All Classes</option>
            <option value="Class 6">Class 6</option>
            <option value="Class 7">Class 7</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 10">Class 10</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-950/50 border border-rose-900/50 text-rose-400 p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">Error Loading Students</h2>
          <p>{error}</p>
        </div>
      )}

      {/* Main Table */}
      {!error && (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 rounded-lg">
                <tr>
                  <th className="px-6 py-4 rounded-l-lg">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4 text-center">Grade Average</th>
                  <th className="px-6 py-4">Parent Email</th>
                  <th className="px-6 py-4 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <SkeletonRows />
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No students found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">#{student.id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                        {student.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-500/10 text-indigo-400 py-1 px-2.5 rounded-lg text-xs font-bold border border-indigo-500/20">
                          {student.class.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`py-1 px-2.5 rounded-full font-bold text-xs ${
                            student.gradeAvg >= 85
                              ? "bg-green-500/20 text-green-400 border border-green-500/20"
                              : student.gradeAvg >= 70
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {student.gradeAvg.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{student.parentEmail || "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/admin/students/${student.id}`}
                            className="bg-slate-950 hover:bg-blue-600 hover:text-white text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs transition-all duration-200"
                          >
                            👁️ View
                          </Link>
                          <button
                            onClick={() => openEditModal(student)}
                            className="bg-slate-950 hover:bg-amber-600 hover:text-white text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs transition-all duration-200"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setDeletingStudentId(student.id)}
                            className="bg-slate-950 hover:bg-rose-600 hover:text-white text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs transition-all duration-200"
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

          {/* Pagination Controls */}
          {total > 0 && (
            <div className="bg-slate-950/40 px-6 py-4 flex items-center justify-between border-t border-white/5 text-xs text-slate-500">
              <div>
                Showing <span className="font-bold text-slate-300">{Math.min((page - 1) * 10 + 1, total)}</span> to{" "}
                <span className="font-bold text-slate-300">{Math.min(page * 10, total)}</span> of{" "}
                <span className="font-bold text-slate-300">{total}</span> students
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="bg-slate-900 border border-white/5 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  ◀ Previous
                </button>
                <span className="text-slate-400">
                  Page <span className="font-bold text-slate-200">{page}</span> of{" "}
                  <span className="font-bold text-slate-200">{pages}</span>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, pages))}
                  disabled={page === pages}
                  className="bg-slate-900 border border-white/5 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  Next ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-scale-up">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>➕</span> Add New Student
              </h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-500 hover:text-white text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && <div className="p-3 text-xs bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl">{formError}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Class *</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer"
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0199"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Parent Email</label>
                <input
                  type="email"
                  placeholder="e.g. parent@example.com"
                  value={formParentEmail}
                  onChange={(e) => setFormParentEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
                <textarea
                  placeholder="e.g. 123 School Lane, Cityville"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isFormSubmitting ? "Creating..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-scale-up">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>✏️</span> Edit Student Profile
              </h2>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-500 hover:text-white text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && <div className="p-3 text-xs bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl">{formError}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Class *</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer"
                  >
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0199"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Parent Email</label>
                <input
                  type="email"
                  placeholder="e.g. parent@example.com"
                  value={formParentEmail}
                  onChange={(e) => setFormParentEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
                <textarea
                  placeholder="e.g. 123 School Lane, Cityville"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isFormSubmitting ? "Updating..." : "Update Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-900/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-up">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚠️</span> Confirm Delete
              </h2>
              <button
                onClick={() => setDeletingStudentId(null)}
                className="text-slate-500 hover:text-white text-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Are you sure you want to delete this student record? This action is permanent and will cascade-delete all grades, attendance history, and invoice status related to this student.
              </p>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  onClick={() => setDeletingStudentId(null)}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-lg cursor-pointer"
                >
                  Yes, Delete Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
