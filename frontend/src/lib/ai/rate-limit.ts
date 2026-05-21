const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: number): { allowed: boolean; retryAfterSec?: number } {
  const key = String(userId);
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true };
}
