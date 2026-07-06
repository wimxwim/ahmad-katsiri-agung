import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth-password";
import { signSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS, type SesiRole } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const RegisterSchema = z.object({
  nama: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  role: z.enum(["SISWA", "GURU"] as const),
});

function roleToSessionRole(role: string): SesiRole {
  if (role === "GURU") return "guru";
  return "murid";
}

export async function POST(request: NextRequest) {
  try {
    const ip = ipFromRequest(request);
    const rl = checkRateLimit(`register:${ip}`, 3, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan. Coba lagi dalam ${rl.retryAfter} detik.` },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data tidak valid" },
        { status: 400 },
      );
    }

    const { nama, email, password, role } = parsed.data;

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({ nama, email, passwordHash, role })
      .returning({ id: users.id, nama: users.nama, role: users.role, email: users.email });

    const token = await signSession({
      userId: user.id,
      role: roleToSessionRole(user.role),
      nama: user.nama,
      email: user.email,
    });

    const response = NextResponse.json({ success: true, user });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
    return response;
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
