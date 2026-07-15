import { NextResponse, type NextRequest } from "next/server";

const CSRF_COOKIE = "__Host-psrf";
const CSRF_HEADER = "x-csrf-token";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const EXEMPT_PREFIXES = [
  "/api/v1/auth",
  "/api/v1/payment/webhook",
  "/api/health",
  "/api/readyz",
  "/api/csp-report",
];

export function validateCsrf(request: NextRequest): NextResponse | null {
  if (SAFE_METHODS.has(request.method)) return null;

  const pathname = request.nextUrl.pathname;
  if (EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json({ error: "CSRF token tidak valid" }, { status: 403 });
  }

  return null;
}