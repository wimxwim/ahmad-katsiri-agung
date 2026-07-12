import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const PUBLIC_PREFIXES = [
  "/masuk",
  "/daftar",
  "/keystatic",
  "/session",
  "/api/v1/auth",
  "/api/health",
  "/api/readyz",
  "/api/csp-report",
  "/api/v1/payment/webhook",
];

const PUBLIC_PATHS = new Set([
  "/",
  "/fitur",
  "/harga",
  "/tentang",
  "/kursus",
  "/quran",
  "/game",
  "/pembayaran",
  "/kebijakan-privasi",
  "/syarat-layanan",
  "/panduan-ai",
  "/profil",
  "/verify",
  "/undang",
  "/icon.png",
  "/icon.svg",
  "/opengraph-image.png",
  "/sitemap.xml",
]);

const GURU_PREFIXES = ["/guru", "/pendidik"];
const SISWA_PREFIXES = ["/siswa"];
const OWNER_PREFIXES = ["/owner"];
const ADMIN_SEKOLAH_PREFIXES = ["/admin-sekolah"];
const ORANG_TUA_PREFIXES = ["/orang-tua"];

const ROLE_ROUTE_MAP: Record<string, string[]> = {
  guru: GURU_PREFIXES,
  murid: SISWA_PREFIXES,
  owner: OWNER_PREFIXES,
  admin_sekolah: ADMIN_SEKOLAH_PREFIXES,
  orang_tua: ORANG_TUA_PREFIXES,
};

export async function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const { pathname } = request.nextUrl;

  const scriptSrc = [
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "'self'",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://va.vercel-scripts.com",
    "https://cdn.equran.id",
  ].join(" ");

  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com`,
    `media-src 'self' https://cdn.equran.id https://*.youtube.com https://*.googlevideo.com`,
    `connect-src 'self' https://equran.id https://*.vercel.app https://*.vercel-insights.com https://*.googleapis.com https://*.google-analytics.com https://*.youtube.com https://*.googlevideo.com https://api.github.com https://*.githubusercontent.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
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
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  const isPublic =
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.startsWith("/kursus/") ||
    pathname.startsWith("/verify/") ||
    pathname.startsWith("/undang/");
  if (isPublic) return response;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) {
    const loginUrl = new URL("/masuk", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { verifySession } = await import("./lib/auth");
  const result = await verifySession(sessionCookie.value);

  if (!result.success) {
    const loginUrl = new URL("/masuk", request.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  const session = result.data;

  response.headers.set("x-user-id", session.userId);
  response.headers.set("x-user-role", session.role);
  response.headers.set("x-user-nama", encodeURIComponent(session.nama));

  const allowedPrefixes = ROLE_ROUTE_MAP[session.role];
  if (allowedPrefixes) {
    const isAccessingOwnDashboard = allowedPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );
    if (!isAccessingOwnDashboard) {
      const isProtectedRoute = Object.values(ROLE_ROUTE_MAP)
        .flat()
        .some((prefix) => pathname.startsWith(prefix));
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/data|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|sitemap|robots|manifest).*)",
  ],
};