import { getRedis } from "./redis";

const MAX_STORE_SIZE = 5_000;
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

interface CountEntry {
  count: number;
  resetAt: number;
}

const perUser = new Map<string, CountEntry>();
const perUserConcurrent = new Map<string, number>();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [k, e] of perUser) {
    if (now > e.resetAt) perUser.delete(k);
  }
}

function evictOldest() {
  let oldestKey: string | null = null;
  let oldestReset = Infinity;
  for (const [k, e] of perUser) {
    if (e.resetAt < oldestReset) {
      oldestReset = e.resetAt;
      oldestKey = k;
    }
  }
  if (oldestKey) perUser.delete(oldestKey);
}

function ensureCapacity() {
  cleanup();
  if (perUser.size >= MAX_STORE_SIZE) evictOldest();
}

function perUserRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfter: number } {
  ensureCapacity();
  const now = Date.now();
  const entry = perUser.get(key);

  if (!entry || now > entry.resetAt) {
    perUser.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, remaining: maxRequests - entry.count, retryAfter: 0 };
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  try {
    const cacheKey = `rl:${key}`;
    const r = getRedis();
    if (r) {
      const count = await r.incr(cacheKey);
      if (count === 1) {
        await r.pexpire(cacheKey, windowMs);
      }
      if (count > maxRequests) {
        const ttl = await r.pttl(cacheKey);
        return { allowed: false, remaining: 0, retryAfter: Math.ceil((ttl || windowMs) / 1000) };
      }
      return { allowed: true, remaining: maxRequests - count, retryAfter: 0 };
    }
  } catch {
    // redis down → fallback memory
  }
  return perUserRateLimit(key, maxRequests, windowMs);
}

export function checkRateLimitSync(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfter: number } {
  return perUserRateLimit(key, maxRequests, windowMs);
}

/**
 * Rate limit per user (bukan per IP) — counter disimpan terpisah dengan prefix `u:`.
 * Gunanya: 1 guru tidak bisa bypass limit dengan ganti IP.
 */
export async function checkRateLimitPerUser(
  userKey: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  return checkRateLimit(`u:${userKey}`, maxRequests, windowMs);
}

/**
 * Cek apakah user boleh menambah job concurrent baru.
 * Pakai Redis DECR/INCR counter sebagai semaphore.
 */
export async function checkConcurrentLimit(
  userKey: string,
  maxConcurrent: number,
  ttlMs = 30 * 60 * 1000,
): Promise<{ allowed: boolean; current: number }> {
  try {
    const cacheKey = `conc:${userKey}`;
    const r = getRedis();
    if (r) {
      const current = await r.incr(cacheKey);
      if (current === 1) await r.pexpire(cacheKey, ttlMs);
      if (current > maxConcurrent) {
        await r.decr(cacheKey);
        return { allowed: false, current: current - 1 };
      }
      return { allowed: true, current };
    }
  } catch {
    // ignore
  }
  const current = (perUserConcurrent.get(userKey) || 0) + 1;
  perUserConcurrent.set(userKey, current);
  if (current > maxConcurrent) {
    return { allowed: false, current };
  }
  return { allowed: true, current };
}

export async function releaseConcurrent(userKey: string): Promise<void> {
  try {
    const cacheKey = `conc:${userKey}`;
    const r = getRedis();
    if (r) {
      await r.decr(cacheKey);
      return;
    }
  } catch {
    // ignore
  }
  const current = perUserConcurrent.get(userKey) || 0;
  perUserConcurrent.set(userKey, Math.max(0, current - 1));
}

export function ipFromRequest(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") || "unknown";
}
