import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  feesCollected: number;
  feesPending: number;
  absentToday: number;
  topStudents: {
    id: number;
    rank: number;
    name: string;
    className: string;
    gradeAvg: number;
  }[];
  recentNotices: {
    id: number;
    title: string;
    content: string;
    createdAt: string;
  }[];
  attendanceData: { name: string; rate: number }[];
}

const CACHE_KEY = "edunexus_admin_stats";

function readSessionCache(): AdminStats | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AdminStats) : null;
  } catch {
    return null;
  }
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (skipCache = false) => {
    setError(null);
    try {
      const data = await apiGet<AdminStats>("/dashboard/admin-stats", {
        ttlMs: 60_000,
        skipCache,
      });
      setStats(data);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err: unknown) {
      setError((prev) =>
        prev ?? (err instanceof Error ? err.message : "Failed to load dashboard")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = readSessionCache();
    if (cached) {
      setStats(cached);
      setIsLoading(false);
    }
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading: isLoading && !stats, error, refetch: () => fetchStats(true) };
}
