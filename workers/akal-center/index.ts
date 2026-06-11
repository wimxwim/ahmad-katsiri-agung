const ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'OPTIONS'];
const ORIGIN = 'https://ahmad-katsiri-agung.vercel.app';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.googletagmanager.com https://*.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "frame-src 'self' https://www.youtube.com",
  "connect-src 'self' https://*.vercel.app https://*.googleapis.com https://*.google-analytics.com",
].join('; ');

function addSecurityHeaders(headers) {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Content-Security-Policy', CSP);
}

export default {
  async fetch(request) {
    if (!ALLOWED_METHODS.includes(request.method)) {
      return new Response(null, { status: 405, statusText: 'Method Not Allowed' });
    }

    const url = new URL(request.url);
    const upstreamUrl = ORIGIN + url.pathname + url.search;

    const headers = new Headers(request.headers);
    headers.set('Host', new URL(ORIGIN).hostname);
    headers.set('X-From-Worker', 'akal-center');

    const isApi = url.pathname.startsWith('/api/');
    const isStatic = url.pathname.startsWith('/_next/static/');
    const isPdf = url.pathname.startsWith('/pdf/');
    const isAsset = /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/i.test(url.pathname);

    const upstreamRequest = new Request(upstreamUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    });

    let response = await fetch(upstreamRequest);

    if (isStatic) {
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (isPdf || isAsset) {
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=604800');
    } else if (!isApi) {
      response = new Response(response.body, response);
      response.headers.set('Cache-Control', 'public, max-age=300');
    }

    if (!isStatic) {
      const respHeaders = new Headers(response.headers);
      addSecurityHeaders(respHeaders);
      response = new Response(response.body, { ...response, headers: respHeaders });
    }

    return response;
  },
};
