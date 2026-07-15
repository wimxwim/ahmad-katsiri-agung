const ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

import queueConsumer from "./queue-consumer";
export const queue = queueConsumer.queue;
const DEFAULT_TIMEOUT_MS = 15_000;
const TIMEOUT_MS = Math.max(
  5_000,
  Number.parseInt(process.env.WORKER_TIMEOUT_MS || String(DEFAULT_TIMEOUT_MS), 10) || DEFAULT_TIMEOUT_MS,
);

function getOrigin(): string {
  const origin = process.env.ORIGIN_URL;
  if (!origin) {
    throw new Error("ORIGIN_URL environment variable wajib diset. Contoh: https://origin.akalcenter.my.id");
  }
  return origin;
}

// ── Rate limiter ──
interface RateEntry {
  count: number;
  resetAt: number;
}
const rateStore = new Map<string, RateEntry>();
const MAX_STORE_SIZE = 10_000;

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || now > entry.resetAt) {
    if (rateStore.size >= MAX_STORE_SIZE) {
      let oldestKey: string | null = null;
      let oldestReset = Infinity;
      for (const [k, v] of rateStore) {
        if (v.resetAt < oldestReset) { oldestReset = v.resetAt; oldestKey = k; }
      }
      if (oldestKey) rateStore.delete(oldestKey);
    }
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  if (entry.count > maxRequests) return false;
  return true;
}

let lastCleanup = Date.now();
function cleanupStore() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of rateStore) {
    if (now > entry.resetAt) rateStore.delete(key);
  }
}

// ── Security headers (defense-in-depth; don't override origin's CSP)
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// ── Path configuration ──
const BLOCKED_PATHS: string[] = [];

const STATIC_ASSET_EXTS = /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/i;

function isBlocked(pathname: string): boolean {
  return BLOCKED_PATHS.some((p) => pathname.startsWith(p));
}

function isStaticAsset(pathname: string): boolean {
  return pathname.startsWith('/_next/static/')
    || pathname.startsWith('/pdf/')
    || STATIC_ASSET_EXTS.test(pathname);
}

function isHtmlPage(pathname: string): boolean {
  return !pathname.startsWith('/api/')
    && !pathname.startsWith('/_next/static/')
    && !pathname.startsWith('/pdf/')
    && !STATIC_ASSET_EXTS.test(pathname);
}

function hasSessionCookie(request: Request): boolean {
  const cookie = request.headers.get('Cookie') || '';
  return cookie.includes('akal_sesi=');
}

function isCacheablePublicApi(pathname: string, method: string, request: Request): { cacheable: boolean; ttl: number } {
  if (method !== 'GET') return { cacheable: false, ttl: 0 };
  if (pathname === '/api/v1/katalog') return { cacheable: true, ttl: 300 };
  if (pathname === '/api/v1/auth/jwks') return { cacheable: true, ttl: 3600 };
  if (pathname.startsWith('/api/v1/kursus') && !hasSessionCookie(request)) return { cacheable: true, ttl: 120 };
  if (pathname.startsWith('/api/v1/pengumuman') && !hasSessionCookie(request)) return { cacheable: true, ttl: 60 };
  return { cacheable: false, ttl: 0 };
}

export default {
  async fetch(request: Request, env: Record<string, unknown>, ctx: ExecutionContext) {
    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response(null, { status: 405, statusText: 'Method Not Allowed' });
    }

    const url = new URL(request.url);

    if (isBlocked(url.pathname)) {
      return new Response(null, { status: 403 });
    }

    // AI Proxy — forward POST /v1/chat/completions ke NaraRouter
    if (url.pathname === '/v1/chat/completions' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization') || '';
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const aiBaseUrl = (process.env.AI_BASE_URL as string) || 'https://router.bynara.id/v1';
      const aiUrl = `${aiBaseUrl}/chat/completions`;
      const body = await request.text();
      const aiReq = new Request(aiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body,
      });
      const aiRes = await fetch(aiReq);
      const aiBody = await aiRes.text();
      return new Response(aiBody, {
        status: aiRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // AI Generation Queue — enqueue job untuk diproses Worker
    if (url.pathname === '/v1/ai/generate' && request.method === 'POST') {
      const body = await request.text();
      const msg = JSON.parse(body);
      await (env as { AI_GENERATION: Queue }).AI_GENERATION.send(msg);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting for API endpoints (worker-level; defense-in-depth)
    if (url.pathname.startsWith('/api/')) {
      cleanupStore();
      const ip = request.headers.get('cf-connecting-ip')
        || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || 'unknown';
      const maxReq = request.method === 'POST' ? 10 : 30;
      const windowMs = request.method === 'POST' ? 30_000 : 60_000;
      const key = `${request.method}:${url.pathname}:${ip}`;
      if (!checkRateLimit(key, maxReq, windowMs)) {
        return new Response(JSON.stringify({ error: 'Terlalu banyak permintaan' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(windowMs / 1000)) },
        });
      }
    }

    // ── Cache API: public content endpoints ──
    const cacheCheck = isCacheablePublicApi(url.pathname, request.method, request);
    if (cacheCheck.cacheable) {
      const cacheKey = new Request(url.toString(), request);
      const cache = caches.default;
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const response = new Response(cachedResponse.body, cachedResponse);
        response.headers.set('X-Cache', 'HIT');
        return response;
      }
    }

    const page = isHtmlPage(url.pathname);

    // ── Fetch from Vercel origin ──
    const targetUrl = new URL(getOrigin());
    if (url.hostname === targetUrl.hostname) {
      return new Response(JSON.stringify({ error: 'Proxy loop detected: ORIGIN_URL tidak boleh sama dengan domain publik' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const upstreamUrl = getOrigin() + url.pathname + url.search;
    const headers = new Headers(request.headers);
    headers.set('X-From-Worker', 'akal-center');
    headers.set('Host', targetUrl.host);
    headers.set('X-Forwarded-Host', url.host);
    headers.set('X-Forwarded-Proto', url.protocol.slice(0, -1));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const upstreamRequest = new Request(upstreamUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      redirect: 'manual',
      signal: controller.signal,
    });

    let response;
    try {
      response = await fetch(upstreamRequest);
    } catch (err: unknown) {
      clearTimeout(timeout);
      const e = err as Error;
      if (e.name === 'AbortError') {
        console.error(JSON.stringify({ event: 'worker.upstream_timeout', method: request.method, path: url.pathname, timeout_ms: TIMEOUT_MS }));
        return new Response(JSON.stringify({ error: 'Upstream timeout' }), {
          status: 504,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Upstream error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    clearTimeout(timeout);

    // Fix redirect URLs: replace Vercel origin with the actual domain
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        const actualOrigin = `${url.protocol}//${url.host}`;
        const originStr = getOrigin();
        for (const originVariant of [originStr, encodeURIComponent(originStr)]) {
          if (location.includes(originVariant)) {
            const fixed = location.replaceAll(originVariant, originVariant === originStr ? actualOrigin : encodeURIComponent(actualOrigin));
            response = new Response(response.body, response);
            response.headers.set('location', fixed);
            break;
          }
        }
      }
    }

    response = new Response(response.body, response);

    // ── Cache API: store response for public endpoints ──
    if (cacheCheck.cacheable && response.status === 200) {
      const cacheKey = new Request(url.toString(), request);
      const cache = caches.default;
      const cachedResponse = new Response(response.body, response);
      cachedResponse.headers.set('Cache-Control', `public, max-age=${cacheCheck.ttl}, s-maxage=${cacheCheck.ttl}`);
      cachedResponse.headers.set('X-Cache', 'MISS');
      ctx.waitUntil(cache.put(cacheKey, cachedResponse));
    }

    // Cache-Control
    if (url.pathname.startsWith('/_next/static/')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (isStaticAsset(url.pathname)) {
      response.headers.set('Cache-Control', 'public, max-age=604800');
    } else if (page && request.method === 'GET') {
      response.headers.set('Cache-Control', 'private, no-cache, must-revalidate');
    } else if (cacheCheck.cacheable) {
      response.headers.set('Cache-Control', `public, max-age=${cacheCheck.ttl}, s-maxage=${cacheCheck.ttl}`);
    } else {
      response.headers.set('Cache-Control', 'no-cache');
    }

    // Strip Next.js RSC vary so CF edge cache can work
    if (page) {
      response.headers.set('Vary', 'Accept-Encoding');
    }

    // CSP: Next.js 16 auto-injects nonce for Server Actions on static pre-rendered pages,
    // causing nonce mismatch → all inline hydration scripts blocked → blank white screen.
    // Replace any nonce-based CSP with 'unsafe-inline' version.
    const cspHeader = response.headers.get('Content-Security-Policy');
    if (cspHeader && cspHeader.includes("'nonce-")) {
      const fixedCsp = cspHeader.replace(
        /script-src\s+'self'\s+'nonce-[^']+'/,
        "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com"
      );
      response.headers.set('Content-Security-Policy', fixedCsp);
    }
    if (!cspHeader) {
      response.headers.set('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://cdn.equran.id https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https:",
        "font-src 'self' https://fonts.gstatic.com data:",
        "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
        "media-src 'self' https://cdn.equran.id https://*.youtube.com https://*.googlevideo.com",
        "connect-src 'self' https://equran.id https://*.vercel.app https://*.vercel-insights.com https://*.googleapis.com https://*.google-analytics.com https://*.youtube.com https://*.googlevideo.com https://api.github.com https://*.githubusercontent.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "));
    }

    // Security headers (don't override existing)
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      if (!response.headers.has(key)) response.headers.set(key, value);
    }

    response.headers.set('X-Worker', 'akal-center');

    return response;
  },

  async scheduled(_event: ScheduledEvent, env: Record<string, unknown>, _ctx: ExecutionContext) {
    const cronSecret = (env.CRON_SECRET as string) || (process.env.CRON_SECRET as string);
    const origin = getOrigin();

    // Anti-pause: ping health endpoint setiap 6 jam
    try {
      const healthUrl = `${origin}/api/health`;
      const healthRes = await fetch(healthUrl);
      console.log(JSON.stringify({
        event: 'cron.health_ping',
        status: healthRes.status,
        timestamp: new Date().toISOString(),
      }));
    } catch (err: unknown) {
      console.error(JSON.stringify({
        event: 'cron.health_ping_failed',
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      }));
    }

    // Prune event_store: hapus auth events >30 hari, gen events >90 hari
    if (cronSecret) {
      try {
        const pruneUrl = `${origin}/api/v1/cron/prune-events`;
        const pruneRes = await fetch(pruneUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cronSecret}`,
            'Content-Type': 'application/json',
          },
        });
        const pruneBody = await pruneRes.text();
        console.log(JSON.stringify({
          event: 'cron.prune_events',
          status: pruneRes.status,
          body: pruneBody,
          timestamp: new Date().toISOString(),
        }));
      } catch (err: unknown) {
        console.error(JSON.stringify({
          event: 'cron.prune_events_failed',
          error: (err as Error).message,
          timestamp: new Date().toISOString(),
        }));
      }
    }
  },
};