import "server-only";
import { Redis } from "@upstash/redis";

function getRedisConfig(): { url: string; token: string } | null {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) return { url: restUrl, token: restToken };

  const connStr = process.env.REDIS_URL;
  if (!connStr) return null;

  try {
    const u = new URL(connStr);
    if (u.protocol === "redis:" || u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      return null;
    }
    const token = decodeURIComponent(u.password || u.username);
    const endpoint = u.hostname;
    return { url: `https://${endpoint}`, token };
  } catch {
    return null;
  }
}

let redisClient: Redis | null = null;

export function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const config = getRedisConfig();
  if (!config) return null;
  redisClient = new Redis({ url: config.url, token: config.token });
  return redisClient;
}

// Removed dead sliding-window rate limit code
