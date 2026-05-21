/**
 * Shared hook to cache teacher class info in sessionStorage.
 * Eliminates the waterfall API call on every teacher page.
 */
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api/client";

interface TeacherClassInfo {
  teacherId: number;
  teacherName: string;
  subject: string;
  classId: number;
  className: string;
}

const CACHE_KEY = "edunexus_teacher_class";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(): TeacherClassInfo | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data as TeacherClassInfo;
  } catch {
    return null;
  }
}

function setCache(data: TeacherClassInfo) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
}

export function useTeacherData() {
  const router = useRouter();
  const [info, setInfo] = useState<TeacherClassInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(async () => {
    // If we already have cached data, don't show loading
    const cached = getCached();
    if (cached) {
      setInfo(cached);
      setIsLoading(false);
    }

    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) { router.push("/login"); return; }

      const data = await apiGet<{
        teacher: { id: number; name: string; subject: string };
        assignedClass: { id: number; name: string } | null;
      }>("/dashboard/teacher-stats", { ttlMs: 30_000 });
      if (data.assignedClass && data.teacher) {
        const classInfo: TeacherClassInfo = {
          teacherId: data.teacher.id,
          teacherName: data.teacher.name,
          subject: data.teacher.subject,
          classId: data.assignedClass.id,
          className: data.assignedClass.name,
        };
        setCache(classInfo);
        setInfo(classInfo);
      } else {
        setError("You are not assigned to any class.");
      }
    } catch (err: any) {
      if (!cached) {
        setError(err.message || "Failed to load teacher info.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setInfo(cached);
      setIsLoading(false);
    }
    fetchInfo();
  }, [fetchInfo]);

  return { info, isLoading, error, refetch: fetchInfo };
}

export function getToken() {
  return localStorage.getItem("edunexus_token");
}
