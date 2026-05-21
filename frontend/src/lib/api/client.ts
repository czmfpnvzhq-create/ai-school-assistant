import { API_BASE_URL } from "@/lib/config";

type CacheEntry = { data: unknown; expires: number };
const memoryCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("edunexus_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }
}

export async function apiGet<T>(
  path: string,
  options?: { ttlMs?: number; skipCache?: boolean }
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const cacheKey = `GET:${url}`;
  const ttl = options?.ttlMs ?? 0;

  if (ttl > 0 && !options?.skipCache) {
    const hit = memoryCache.get(cacheKey);
    if (hit && hit.expires > Date.now()) {
      return hit.data as T;
    }
  }

  if (inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey) as Promise<T>;
  }

  const promise = (async () => {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        (errBody as { message?: string; error?: string }).message ||
          (errBody as { error?: string }).error ||
          `Request failed (${res.status})`
      );
    }

    const data = (await res.json()) as T;
    if (ttl > 0) {
      memoryCache.set(cacheKey, { data, expires: Date.now() + ttl });
    }
    return data;
  })();

  inFlight.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(cacheKey);
  }
}

export async function apiMutate<T>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
  invalidatePrefix?: string
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      (errBody as { message?: string; error?: string }).message ||
        (errBody as { error?: string }).error ||
        `Request failed (${res.status})`
    );
  }

  if (invalidatePrefix) clearApiCache(invalidatePrefix);
  return res.json() as Promise<T>;
}
