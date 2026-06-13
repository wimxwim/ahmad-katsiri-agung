const ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'OPTIONS'];
const ORIGIN = 'https://ahmad-katsiri-agung.vercel.app';

// Simple per-IP rate limiter (Cloudflare Worker has persistent state per colo)
interface RateEntry {
  count: number;
  resetAt: number;
}
const rateStore = new Map<string, RateEntry>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
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

      // Stricter for POST (submissions), looser for GET (reads)
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
    headers.set('Host', new URL(ORIGIN).hostname);
    headers.set('X-From-Worker', 'akal-center');

    const isStatic = url.pathname.startsWith('/_next/static/');
    const isPdf = url.pathname.startsWith('/pdf/');
    const isAsset = /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/i.test(url.pathname);

    const upstreamRequest = new Request(upstreamUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    });

    let response = await fetch(upstreamRequest);

    // Only override Cache-Control for cacheable assets; let origin handle everything else
    if (isStatic) {
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (isPdf || isAsset) {
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=604800');
    } else if (!url.pathname.startsWith('/api/')) {
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }

    return response;
  },
};
