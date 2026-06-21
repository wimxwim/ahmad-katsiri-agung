import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";

// Semua rute publik — hanya /pendidik yang butuh session guru
const PUBLIC_ROUTES = [
  "/",
  "/materi",
  "/game",
  "/evaluasi",
  "/video",
  "/hafalan",
  "/dalil",
  "/diskusi",
  "/tentang",
  "/peserta-didik",
  "/refleksi",
  "/masuk",
  "/masuk-guru",
  "/keystatic",
  "/session",
];

export async function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const { pathname } = request.nextUrl;

  // ── CSP & Security Headers ──────────────────────────────────────
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
    `connect-src 'self' https://*.vercel.app https://*.vercel-insights.com https://*.googleapis.com https://*.google-analytics.com https://*.youtube.com https://*.googlevideo.com https://api.github.com https://*.githubusercontent.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `report-uri /api/csp-report`,
    `report-to csp-endpoint`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Reporting-Endpoints", 'csp-endpoint="/api/csp-report"');

  // ── Session Guard (hanya /pendidik yang butuh login guru) ──────
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return response;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = sessionCookie?.value
    ? await verifySession(sessionCookie.value)
    : null;

  if (!session || session.role !== "guru") {
    const loginUrl = new URL("/masuk-guru", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/data|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|sitemap|robots).*)",
  ],
};
