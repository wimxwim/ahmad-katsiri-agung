import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const PUBLIC_PREFIXES = [
  "/masuk",
  "/daftar",
  "/api/v1/auth",
  "/api/health",
  "/api/readyz",
  "/api/csp-report",
  "/api/v1/payment/webhook",
  "/images",
];

const PUBLIC_PATHS = new Set([
  "/",
  "/fitur",
  "/harga",
  "/tentang",
  "/kursus",
  "/quran",
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
  "/sw.js",
  "/manifest.json",
  "/offline",
  "/robots.txt",
  "/apple-icon.png",
  "/qris-gopay.png",
  "/logo.webp",
]);

const ROLE_ROUTE_MAP: Record<string, string[]> = {
  guru: ["/guru", "/pendidik"],
  murid: ["/siswa"],
  owner: ["/owner"],
  admin_sekolah: ["/admin-sekolah"],
  orang_tua: ["/orang-tua"],
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const existingCsrf = request.cookies.get("__Host-psrf")?.value;
  const csrfToken = existingCsrf || crypto.randomUUID();
  response.cookies.set("__Host-psrf", csrfToken, {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 86400,
  });

  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
  const CSRF_EXEMPT = ["/api/v1/auth", "/api/v1/payment/webhook", "/api/health", "/api/readyz", "/api/csp-report"];
  if (!SAFE_METHODS.has(request.method) && !CSRF_EXEMPT.some((p) => pathname.startsWith(p))) {
    const csrfCookie = request.cookies.get("__Host-psrf")?.value;
    const csrfHeader = request.headers.get("x-csrf-token");
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return NextResponse.json({ error: "CSRF token tidak valid" }, { status: 403 });
    }
  }

  const isStaticAsset = /\.(png|webp|jpg|jpeg|gif|svg|ico|css|js|woff2?|ttf|pdf|json|xml|txt)$/i.test(pathname);
  const isPublic =
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.startsWith("/kursus/") ||
    pathname.startsWith("/verify/") ||
    pathname.startsWith("/undang/") ||
    isStaticAsset;
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