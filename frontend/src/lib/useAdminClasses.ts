import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface ClassData {
  id: number;
  name: string;
  teacher: string;
}

const CACHE_KEY = "edunexus_admin_classes";
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCachedClasses(): ClassData[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data as ClassData[];
  } catch {
    return null;
  }
}

function setCacheClasses(data: ClassData[]) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
}

export function useAdminClasses() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>(getCachedClasses() || []);
  const [isLoading, setIsLoading] = useState(!getCachedClasses());
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    const cached = getCachedClasses();
    if (cached) {
      setClasses(cached);
      setIsLoading(false);
    }

    try {
      const token = localStorage.getItem("edunexus_token");
      if (!token) { router.push("/login"); return; }

      const res = await fetch(`${API_BASE_URL}/students/classes/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("edunexus_token");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to load classes");

      const data = await res.json();
      setClasses(data);
      setCacheClasses(data);
    } catch (err: any) {
      if (!cached) {
        setError(err.message || "Failed to load classes.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  return { classes, isLoading, error, refetch: fetchClasses };
}
