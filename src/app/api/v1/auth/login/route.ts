import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth-password";
import { signSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS, type SesiRole } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function roleToSessionRole(role: string): SesiRole {
  if (role === "GURU") return "guru";
  if (role === "OWNER") return "owner";
  if (role === "ADMIN_SEKOLAH") return "admin_sekolah";
  return "murid";
}

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = checkRateLimit(`login:${ip}`, 5, 15000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan. Coba lagi dalam ${rl.retryAfter} detik.` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email atau kata sandi tidak valid" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Email atau kata sandi salah" },
        { status: 401 },
      );
    }

    const user = rows[0];
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Akun ini menggunakan metode login lain" },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Email atau kata sandi salah" },
        { status: 401 },
      );
    }

    const token = await signSession({
      userId: user.id,
      role: roleToSessionRole(user.role),
      nama: user.nama,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, nama: user.nama, role: user.role, email: user.email },
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
    return response;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
