import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const secret = process.env.JWT_SECRET;
const getSecret = () => new TextEncoder().encode(secret || "");

const publicPaths = [
  "/login",
  "/masuk",
  "/masuk-guru",
  "/api/",
  "/_next/",
  "/images/",
  "/pdf/",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p) || pathname === p)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (cookie?.value && secret) {
    try {
      await jwtVerify(cookie.value, getSecret());
      return NextResponse.next();
    } catch {
      // invalid or expired
    }
  }

  const url = new URL("/login", request.url);
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|icon\\.png|apple-icon\\.png|opengraph-image\\.png|sitemap\\.xml|robots\\.txt|logo\\.webp).*)",
  ],
};
