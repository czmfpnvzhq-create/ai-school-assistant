"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { useAdminClasses } from "@/lib/useAdminClasses";

interface StudentAttendance {
  studentId: number;
  studentName: string;
  status: "present" | "absent" | "late" | null;
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <tr key={i}>
          <td className="px-6 py-4">
            <div className="h-4 w-36 bg-slate-800 rounded animate-pulse" />
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-9 w-24 bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-9 w-24 bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-9 w-24 bg-slate-800 rounded-xl animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function AttendancePage() {
  const router = useRouter();

  // State parameters
  const { classes, isLoading: isLoadingClasses, error: classError } = useAdminClasses();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [attendanceState, setAttendanceState] = useState<
    Record<number, "present" | "absent" | "late">
  >({});

  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id.toString());
    }
  }, [classes, selectedClassId]);

  // Fetch students & attendance for selected class & date
  const fetchAttendanceRecords = useCallback(async () => {
    if (!selectedClassId || !selectedDate) return;

    setIsLoadingStudents(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/attendance?date=${selectedDate}&classId=${selectedClassId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("edunexus_token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load attendance records");
      }

      const data: StudentAttendance[] = await res.json();
      setStudents(data);

      // Pre-populate state
      const initialMap: Record<number, "present" | "absent" | "late"> = {};
      let allMarked = data.length > 0;
      data.forEach((s) => {
        if (s.status) {
          initialMap[s.studentId] = s.status;
        } else {
          allMarked = false;
        }
      });
      setAttendanceState(initialMap);
      setIsLocked(allMarked);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to fetch student attendance.");
    } finally {
      setIsLoadingStudents(false);
    }
  }, [selectedClassId, selectedDate, router]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

  // Handle changing status
  const handleStatusChange = (
    studentId: number,
    status: "present" | "absent" | "late"
  ) => {
    if (isLocked) return;
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Submit all attendance
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const recordsArray = Object.entries(attendanceState).map(
        ([studentIdStr, status]) => ({
          studentId: parseInt(studentIdStr, 10),
          date: selectedDate,
          status,
        })
      );

      // Ensure every listed student has a marked status
      const unmarkedStudents = students.filter((s) => !attendanceState[s.studentId]);
      if (unmarkedStudents.length > 0) {
        throw new Error(
          `Please mark attendance for all students. ${unmarkedStudents.length} remaining.`
        );
      }

      const res = await fetch(`${API_BASE_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ records: recordsArray }),
      });

      if (!res.ok) {
        throw new Error("Failed to save attendance.");
      }

      setSuccessMessage("Attendance saved successfully!");
      setIsLocked(true);
      // Flash message away after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const showSkeleton = isLoadingClasses || (isLoadingStudents && students.length === 0);

  return (
    <div className="space-y-6 pb-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Attendance Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Mark and modify student attendance for today or previous dates.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin/attendance/report")}
          className="bg-slate-900/50 hover:bg-slate-800/50 text-slate-200 font-semibold py-2.5 px-5 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center justify-center gap-2 animate-pulse-slow"
        >
          📈 View Reports
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            Select Class
          </label>
          {isLoadingClasses ? (
            <div className="h-11 w-full bg-slate-950/20 border border-white/5 animate-pulse rounded-xl" />
          ) : (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full h-11 bg-slate-950/50 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 text-sm text-slate-200 outline-none transition-all cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.teacher})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-11 bg-slate-950/50 border border-white/5 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 text-sm text-slate-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Locked Banner */}
      {isLocked && students.length > 0 && !showSkeleton && (
        <div className="bg-blue-950/40 border border-blue-900/50 text-blue-300 px-5 py-4 rounded-xl text-sm shadow-lg flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">🔒 Attendance is saved and locked for this date and class.</span>
          <button
            onClick={() => setIsLocked(false)}
            className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            🔓 Modify Attendance
          </button>
        </div>
      )}

      {/* Messages */}
      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-400 px-5 py-4 rounded-xl text-sm shadow-lg flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 px-5 py-4 rounded-xl text-sm shadow-lg flex items-center justify-between">
          <span>✨ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {/* Students List Table */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
              <tr>
                <th className="px-6 py-4 rounded-l-lg">Student Name</th>
                <th className="px-6 py-4 text-center rounded-r-lg">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {showSkeleton ? (
                <SkeletonRows />
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-16 text-center text-slate-500">
                    No students found in this class.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentStatus = attendanceState[student.studentId];
                  return (
                    <tr key={student.studentId} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4.5 font-semibold text-slate-200">
                        {student.studentName}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-center gap-3">
                          {/* Present Button */}
                          <button
                            onClick={() => handleStatusChange(student.studentId, "present")}
                            disabled={isLocked}
                            className={`flex-1 max-w-[120px] py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                              currentStatus === "present"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                : "bg-slate-950/50 hover:bg-slate-800 text-slate-400 border border-white/5"
                            } ${isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            🟢 Present
                          </button>

                          {/* Late Button */}
                          <button
                            onClick={() => handleStatusChange(student.studentId, "late")}
                            disabled={isLocked}
                            className={`flex-1 max-w-[120px] py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                              currentStatus === "late"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                                : "bg-slate-950/50 hover:bg-slate-800 text-slate-400 border border-white/5"
                            } ${isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            🟡 Late
                          </button>

                          {/* Absent Button */}
                          <button
                            onClick={() => handleStatusChange(student.studentId, "absent")}
                            disabled={isLocked}
                            className={`flex-1 max-w-[120px] py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                              currentStatus === "absent"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                                : "bg-slate-950/50 hover:bg-slate-800 text-slate-400 border border-white/5"
                            } ${isLocked ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            🔴 Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      {students.length > 0 && !showSkeleton && !isLocked && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="w-full md:w-auto min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving Attendance...
              </>
            ) : (
              <>💾 Save All Attendance</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
