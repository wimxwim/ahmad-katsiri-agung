import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { users, sekolah } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { requireSession, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);

    const rl = await checkRateLimit(`account-me:${session.userId}`, 10, 60000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const result = await db
      .select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        role: users.role,
        kelas: users.kelas,
        noAbsen: users.noAbsen,
        lastActiveAt: users.lastActiveAt,
        sekolahId: users.sekolahId,
        createdAt: users.createdAt,
        namaSekolah: sekolah.nama,
        googleId: users.googleId,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .leftJoin(sekolah, eq(users.sekolahId, sekolah.id))
      .where(and(eq(users.id, session.userId), isNull(users.deletedAt)))
      .limit(1);

    if (!result.length) {
      return apiError("Pengguna tidak ditemukan", 404);
    }

    const u = result[0];
    return NextResponse.json({
      data: {
        id: u.id,
        nama: u.nama,
        email: u.email,
        role: u.role,
        kelas: u.kelas || undefined,
        noAbsen: u.noAbsen || undefined,
        
        lastActiveAt: u.lastActiveAt ? u.lastActiveAt.toISOString() : undefined,
        sekolahId: u.sekolahId || undefined,
        namaSekolah: u.namaSekolah || undefined,
        createdAt: u.createdAt.toISOString(),
        hasGoogle: !!u.googleId,
        hasPassword: !!u.passwordHash,
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Account me error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession(request);

    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const rl = await checkRateLimit(`account-delete:${session.userId}`, 3, 300000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    await db
      .update(users)
      .set({
        nama: "[Dihapus]",
        email: `deleted-${session.userId}@anon.local`,
        passwordHash: null,
        deletedAt: new Date(),
      })
      .where(eq(users.id, session.userId));

    const response = NextResponse.json({ message: "Akun berhasil dihapus" });
    response.cookies.set(SESSION_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Account delete error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
