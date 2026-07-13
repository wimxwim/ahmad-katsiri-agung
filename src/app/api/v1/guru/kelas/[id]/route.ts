import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { requireSession, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";

const UpdateKelasSchema = z.object({
  nama: z.string().min(1).max(50).optional(),
  tingkat: z.number().int().min(1).max(20).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;
    const session = await requireSession(request);

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

    const where = session.role === "owner"
      ? eq(kelas.id, id)
      : and(eq(kelas.id, id), eq(kelas.guruId, session.userId));

    const [updated] = await db
      .update(kelas)
      .set(updates)
      .where(where)
      .returning();

    return NextResponse.json({ data: updated });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kelas update error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;
    const session = await requireSession(request);

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

    const where = session.role === "owner"
      ? eq(kelas.id, id)
      : and(eq(kelas.id, id), eq(kelas.guruId, session.userId));

    await db
      .update(kelas)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(where);

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kelas delete error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}