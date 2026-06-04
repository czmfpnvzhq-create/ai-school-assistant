import crypto from "crypto";

// Simple in-memory cache for AI responses (frontend server)
export const aiResponseCache = new Map<string, { answer: string; expiresAt: number }>();

export function getCacheKey(messages: { role: string; content: string }[]): string {
  const hash = crypto.createHash("sha256");
  const payload = JSON.stringify(messages.map((m) => ({ role: m.role, content: m.content })));
  hash.update(payload);
  return hash.digest("hex");
}

export function getCache(key: string): string | null {
  const entry = aiResponseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    aiResponseCache.delete(key);
    return null;
  }
  return entry.answer;
}

export function setCache(key: string, answer: string, ttlMs = 5 * 60 * 1000) {
  aiResponseCache.set(key, { answer, expiresAt: Date.now() + ttlMs });
}
