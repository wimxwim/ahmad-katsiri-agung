import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID();

  const scriptSrc = [
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "'self'",
    "https://www.youtube.com",
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://va.vercel-scripts.com",
  ].join(" ");

  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com`,
    `media-src 'self' https://*.youtube.com https://*.googlevideo.com`,
    `connect-src 'self' https://*.vercel.app https://*.vercel-insights.com https://*.googleapis.com https://*.google-analytics.com https://*.youtube.com https://*.googlevideo.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `report-uri /api/csp-report`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|sitemap|robots).*)",
  ],
};
