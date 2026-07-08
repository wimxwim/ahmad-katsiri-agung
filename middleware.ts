import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, importSPKI } from "jose";
import type { SesiRole } from "@/lib/session";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
const CSRF_COOKIE = "__Host-psrf";
const CSRF_HEADER = "x-csrf-token";

const SESSION_COOKIE = "akal_sesi";

const SKIP_CSRF_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/google",
  "/api/v1/auth/callback/google",
  "/api/health",
  "/api/readyz",
  "/api/csp-report",
  "/api/keystatic",
  "/api/siswa/cek",
];

const ROLE_HOME: Record<SesiRole, string> = {
  owner: "/owner",
  admin_sekolah: "/admin-sekolah",
  guru: "/guru",
  murid: "/siswa",
  orang_tua: "/orang-tua",
};

const GURU_ROLES: SesiRole[] = ["guru", "owner", "admin_sekolah"];

const ROLE_PROTECTED_PREFIXES: { prefix: string; allowed: SesiRole[] }[] = [
  { prefix: "/owner", allowed: ["owner"] },
  { prefix: "/admin-sekolah", allowed: ["owner", "admin_sekolah"] },
  { prefix: "/guru", allowed: GURU_ROLES },
  { prefix: "/orang-tua", allowed: ["orang_tua"] },
  { prefix: "/siswa", allowed: ["murid", "orang_tua"] },
];

const LEGACY_DASHBOARD_TO_HOME: { prefix: string; target: SesiRole[] }[] = [
  { prefix: "/dashboard-guru", target: GURU_ROLES },
  { prefix: "/dashboard-siswa", target: ["murid", "orang_tua"] },
];

const LEGACY_PUBLIC_TO_HOME: { prefix: string; target: string }[] = [
  { prefix: "/pendidik", target: "/guru" },
  { prefix: "/peserta-didik", target: "/siswa" },
];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET tidak dikonfigurasi");
  return new TextEncoder().encode(secret);
}

let cachedPublicKey: CryptoKey | null = null;

function hasES256Keys(): boolean {
  return !!process.env.JWT_PUBLIC_KEY;
}

async function getES256PublicKey(): Promise<CryptoKey> {
  if (!cachedPublicKey) {
    cachedPublicKey = await importSPKI(process.env.JWT_PUBLIC_KEY!, "ES256");
  }
  return cachedPublicKey;
}

async function getRoleFromSession(
  request: NextRequest,
  headers: Headers,
): Promise<string | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const secret = getJwtSecret();
  if (hasES256Keys()) {
    try {
      const key = await getES256PublicKey();
      const { payload } = await jwtVerify(token, key);
      const p = payload as Record<string, unknown>;
      headers.set("x-user-id", p.userId as string);
      headers.set("x-user-role", p.role as string);
      headers.set("x-user-nama", (p.nama as string) || "");
      headers.set("x-user-email", (p.email as string) || "");
      return p.role as string | null;
    } catch {
      // fall through to HS256 fallback
    }
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    const p = payload as Record<string, unknown>;
    headers.set("x-user-id", p.userId as string);
    headers.set("x-user-role", p.role as string);
    headers.set("x-user-nama", (p.nama as string) || "");
    headers.set("x-user-email", (p.email as string) || "");
    return p.role as string | null;
  } catch {
    return null;
  }
}

function shouldSkipCsrf(pathname: string): boolean {
  return SKIP_CSRF_PATHS.some((p) => pathname.startsWith(p));
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://cdn.equran.id`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "media-src 'self' https://cdn.equran.id https://*.youtube.com https://*.googlevideo.com",
    "connect-src 'self' https://equran.id https://*.vercel.app https://*.vercel-insights.com https://*.googleapis.com https://*.google-analytics.com https://*.youtube.com https://*.googlevideo.com https://api.github.com https://*.githubusercontent.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = generateToken();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  if (pathname === "/") {
    return response;
  }

  if (pathname === "/login" || pathname === "/masuk-guru" || pathname === "/register" || pathname === "/register-guru") {
    const qp = new URLSearchParams();
    for (const [k, v] of request.nextUrl.searchParams.entries()) qp.set(k, v);
    const target = pathname === "/login" || pathname === "/masuk-guru" ? "/masuk" : "/daftar";
    if (pathname === "/masuk-guru" || pathname === "/register-guru") qp.set("portal", "guru");
    const qs = qp.toString();
    const url = qs ? `${target}?${qs}` : target;
    return NextResponse.redirect(new URL(url, request.url), 307);
  }

  for (const { prefix, target } of LEGACY_DASHBOARD_TO_HOME) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const role = (await getRoleFromSession(request, requestHeaders)) as SesiRole | null;
      if (role && target.includes(role)) {
        const rest = pathname.slice(prefix.length) || "";
        const targetPath = ROLE_HOME[role] + (rest || "");
        const qs = request.nextUrl.search;
        return NextResponse.redirect(new URL(targetPath + qs, request.url), 308);
      }
      return NextResponse.redirect(new URL("/masuk", request.url), 307);
    }
  }

  for (const { prefix, target } of LEGACY_PUBLIC_TO_HOME) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length) || "";
      const qs = request.nextUrl.search;
      return NextResponse.redirect(new URL(target + rest + qs, request.url), 308);
    }
  }

  for (const { prefix, allowed } of ROLE_PROTECTED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const role = (await getRoleFromSession(request, requestHeaders)) as SesiRole | null;
      if (!role) {
        const loginUrl = new URL("/masuk", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl, 307);
      }
      if (!allowed.includes(role)) {
        const home = ROLE_HOME[role] || "/";
        return NextResponse.redirect(new URL(home, request.url), 307);
      }
      break;
    }
  }

  if (SAFE_METHODS.includes(request.method)) {
    const existing = request.cookies.get(CSRF_COOKIE)?.value;
    if (!existing) {
      const token = generateToken();
      response.cookies.set(CSRF_COOKIE, token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 86400,
      });
    }
    return response;
  }

  if (shouldSkipCsrf(pathname)) return response;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && !origin.endsWith(host)) {
    return new NextResponse(null, { status: 403 });
  }

  if (pathname.startsWith("/api/")) {
    const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
    const headerToken = request.headers.get(CSRF_HEADER);
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return NextResponse.json({ error: "Token CSRF tidak valid" }, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/:path((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};
