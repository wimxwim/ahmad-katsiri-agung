import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { apiError, apiRateLimit } from "@/lib/api-response";

const UpdateKelasSchema = z.object({
  nama: z.string().min(1).max(50).optional(),
  tingkat: z.number().int().min(1).max(20).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success) return apiError("Sesi tidak valid", 401);
    const session = _ar.data;

    const { id } = await params;
    const existing = await db
      .select()
      .from(kelas)
      .where(and(eq(kelas.id, id), isNull(kelas.deletedAt)))
      .limit(1);
    if (!existing.length) return apiError("Kelas tidak ditemukan", 404);
    if (existing[0].guruId !== session.userId && session.role !== "owner") {
      return apiError("Anda tidak punya akses ke kelas ini", 403);
    }

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`kelas-update:${ip}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = UpdateKelasSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Data tidak valid", 400);

    const updates: { nama?: string; tingkat?: number; updatedAt: Date } = { updatedAt: new Date() };
    if (parsed.data.nama !== undefined) updates.nama = sanitizeText(parsed.data.nama, 50);
    if (parsed.data.tingkat !== undefined) updates.tingkat = parsed.data.tingkat;

    const [updated] = await db
      .update(kelas)
      .set(updates)
      .where(eq(kelas.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (e) {
    console.error("Kelas update error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success) return apiError("Sesi tidak valid", 401);
    const session = _ar.data;

    const { id } = await params;
    const existing = await db
      .select()
      .from(kelas)
      .where(and(eq(kelas.id, id), isNull(kelas.deletedAt)))
      .limit(1);
    if (!existing.length) return apiError("Kelas tidak ditemukan", 404);
    if (existing[0].guruId !== session.userId && session.role !== "owner") {
      return apiError("Anda tidak punya akses ke kelas ini", 403);
    }

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`kelas-delete:${ip}`, 5, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    await db
      .update(kelas)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(kelas.id, id));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Kelas delete error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
