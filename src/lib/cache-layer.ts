import "server-only";
import { getRedis } from "./redis";

const DEFAULT_TTL = 30;

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    return await redis.get<T>(`cache:${key}`);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, data: unknown, ttl = DEFAULT_TTL): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(`cache:${key}`, data, { ex: ttl });
  } catch {
    // non-critical
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.del(`cache:${key}`);
  } catch {
    // non-critical
  }
}

export function cacheKey(...parts: string[]): string {
  return parts.join(":");
}