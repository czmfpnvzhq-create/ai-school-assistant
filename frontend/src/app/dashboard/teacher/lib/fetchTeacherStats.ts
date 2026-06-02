// fetchTeacherStats.ts – Server‑side helper for Teacher Dashboard
"use server";

import { API_BASE_URL } from "@/lib/config";
import { getToken } from "@/lib/useTeacherData";

export interface Stats {
  totalStudents: number;
  averageScore: number;
  classesTaught: number;
  // extend as needed
}

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  // extend as needed
}

export interface TeacherData {
  stats: Stats;
  students: StudentRow[];
}

/**
 * Fetch teacher dashboard data (stats and student list).
 * Returns the data or throws an error which should be caught by the caller.
 */
export async function fetchTeacherStats(): Promise<TeacherData> {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token missing");
  }

  const res = await fetch(`${API_BASE_URL}/dashboard/teacher-stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const msg = `Failed to fetch teacher stats: ${res.status}`;
    throw new Error(msg);
  }
  const data = await res.json();
  // Expecting shape { stats: {...}, students: [...] }
  return data as TeacherData;
}
