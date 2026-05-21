import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api/client";

export interface ParentGrade {
  id: number;
  subject: string;
  score: number;
  examDate: string;
}

export interface ParentAttendanceRecord {
  date: string;
  status: string;
}

export interface ParentFee {
  id: number;
  amount: number;
  paid: boolean;
  dueDate: string;
  paidAt: string | null;
}

export interface ParentChild {
  id: number;
  name: string;
  className: string;
  gradeAvg: number;
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays?: number;
    percentage: number;
    records: ParentAttendanceRecord[];
  };
  recentGrades: ParentGrade[];
  grades: ParentGrade[];
  fees: ParentFee[];
  latestFee: ParentFee | null;
  feeSummary: {
    total: number;
    paid: number;
    pending: number;
  };
}

export interface ParentNotice {
  id: number;
  title: string;
  content: string;
  postedBy: string;
  createdAt: string;
}

export interface ParentStats {
  child: ParentChild | null;
  recentNotices: ParentNotice[];
}

const CACHE_KEY = "edunexus_parent_stats";
const CACHE_TTL = 3 * 60 * 1000;

function getCached(): ParentStats | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data as ParentStats;
  } catch {
    return null;
  }
}

function setCache(data: ParentStats) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
}

export function useParentData() {
  const router = useRouter();
  const [data, setData] = useState<ParentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(
    async (bypassCache = false) => {
      if (!bypassCache) {
        const cached = getCached();
        if (cached) {
          setData(cached);
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        if (!localStorage.getItem("edunexus_token")) {
          router.push("/login");
          return;
        }

        const payload = await apiGet<ParentStats>("/dashboard/parent-stats", {
          ttlMs: 30_000,
          skipCache: bypassCache,
        });
        setData(payload);
        setCache(payload);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        if (!getCached()) {
          setError(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setData(cached);
      setIsLoading(false);
    }
    fetchStats();
  }, [fetchStats]);

  return { data, child: data?.child ?? null, isLoading, error, refetch: () => fetchStats(true) };
}
