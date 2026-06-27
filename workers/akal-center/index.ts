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
  if (rateStore.size > MAX_STORE_SIZE) return true;
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
          headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(windowMs / 1000)) },
        });
      }
    }

    const isHtmlPage = !url.pathname.startsWith('/api/')
      && !url.pathname.startsWith('/_next/static/')
      && !url.pathname.startsWith('/pdf/')
      && !/\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/i.test(url.pathname);

    // ── Fetch from Vercel origin ──
    const upstreamUrl = ORIGIN + url.pathname + url.search;
    const headers = new Headers(request.headers);
    headers.set('X-From-Worker', 'akal-center');

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
        for (const originVariant of [ORIGIN, encodeURIComponent(ORIGIN)]) {
          if (location.includes(originVariant)) {
            const fixed = location.replaceAll(originVariant, originVariant === ORIGIN ? actualOrigin : encodeURIComponent(actualOrigin));
            response = new Response(response.body, response);
            response.headers.set('location', fixed);
            break;
          }
        }
      }
    }

    // Create a mutable copy. If it was a redirect, the earlier code already cloned it.
    if (!(response.status >= 300 && response.status < 400)) {
      response = new Response(response.body, response);
    }

    // Cache-Control
    if (url.pathname.startsWith('/_next/static/')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (url.pathname.startsWith('/pdf/') || /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/i.test(url.pathname)) {
      response.headers.set('Cache-Control', 'public, max-age=604800');
    } else if (isHtmlPage && request.method === 'GET') {
      response.headers.delete('Cache-Control');
      response.headers.set('Cache-Control', 'public, max-age=86400');
    } else {
      response.headers.set('Cache-Control', 'no-cache');
    }

    // Strip Next.js RSC vary so CF edge cache can work
    if (isHtmlPage) {
      response.headers.set('Vary', 'Accept-Encoding');
    }

    // Security headers (don't override existing CSP)
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      if (!response.headers.has(key)) response.headers.set(key, value);
    }

    response.headers.set('X-Worker', 'akal-center');

    return response;
  },
};
