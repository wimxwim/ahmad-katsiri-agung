import "server-only";
import { Redis } from "@upstash/redis";

function getRedisConfig(): { url: string; token: string } | null {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) return { url: restUrl, token: restToken };

  const connStr = process.env.REDIS_URL;
  if (!connStr) return null;

  try {
    // Parse rediss://default:token@endpoint.upstash.io:6379
    const u = new URL(connStr);
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

const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local max_req = tonumber(ARGV[3])

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)

if count >= max_req then
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retry_after = math.ceil((oldest[2] + window - now) / 1000)
    return {0, count, retry_after}
end

redis.call('ZADD', key, now, now .. '-' .. count)
redis.call('EXPIRE', key, math.ceil(window / 1000) + 1)
return {1, count + 1, 0}
`;

export async function redisRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; retryAfter: number } | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const result = (await redis.eval(
      SLIDING_WINDOW_SCRIPT,
      [key],
      [Date.now(), windowMs, maxRequests],
    )) as [number, number, number];

    const allowed = result[0] === 1;
    const count = result[1];
    const retryAfter = result[2];
    return {
      allowed,
      remaining: allowed ? maxRequests - count : 0,
      retryAfter: retryAfter || 0,
    };
  } catch {
    return null;
  }
}
