const ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'OPTIONS'];
const ORIGIN = 'https://ahmad-katsiri-agung.vercel.app';
const TIMEOUT_MS = 15_000;

// ── Rate limiter ──
interface RateEntry {
  count: number;
  resetAt: number;
}
const rateStore = new Map<string, RateEntry>();
const MAX_STORE_SIZE = 10_000;

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  if (rateStore.size > MAX_STORE_SIZE) return true; // degrace gracefully
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  if (entry.count > maxRequests) return false;
  return true;
}

// Cleanup stale entries every 60s
let lastCleanup = Date.now();
function cleanupStore() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of rateStore) {
    if (now > entry.resetAt) rateStore.delete(key);
  }
}

// ── Security headers that the Worker ›preserves‹ from origin
// (we only add what Vercel doesn't already set)
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export default {
  async fetch(request) {
    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response(null, { status: 405, statusText: 'Method Not Allowed' });
    }

    const url = new URL(request.url);

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
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(windowMs / 1000)),
          },
        });
      }
    }

    const upstreamUrl = ORIGIN + url.pathname + url.search;

    const headers = new Headers(request.headers);
    headers.set('X-From-Worker', 'akal-center');

    const isStatic = url.pathname.startsWith('/_next/static/');
    const isPdf = url.pathname.startsWith('/pdf/');
    const isAsset = /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/i.test(url.pathname);

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
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
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
        const encodedOrigin = encodeURIComponent(ORIGIN);
        const decodedOrigin = ORIGIN;
        if (location.includes(decodedOrigin) || location.includes(encodedOrigin)) {
          const fixed = location.replaceAll(decodedOrigin, actualOrigin).replaceAll(encodedOrigin, encodeURIComponent(actualOrigin));
          response = new Response(response.body, response);
          response.headers.set('location', fixed);
        }
      }
    }

    // Create a mutable response for header overrides
    response = new Response(response.body, response);

    // Only override Cache-Control for cacheable assets; let origin handle everything else
    if (isStatic) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (isPdf || isAsset) {
      response.headers.set('Cache-Control', 'public, max-age=604800');
    } else if (!url.pathname.startsWith('/api/')) {
      // Static HTML: cache 2 min at edge, serve stale up to 5 min while revalidating
      // CSP is now stable in next.config.ts (static header), so edge caching is safe
      response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    }

    // Security headers (defense-in-depth; don't override origin's CSP)
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      if (!response.headers.has(key)) {
        response.headers.set(key, value);
      }
    }

    return response;
  },
};
