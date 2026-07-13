import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/route-guard-v2";
import { checkRateLimitSync, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { pengumuman } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";

const UpdateSchema = z.object({
  judul: z.string().min(1).max(255).optional(),
  konten: z.string().min(1).optional(),
  target: z.enum(["SEMUA", "GURU", "SISWA"]).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isPinned: z.boolean().optional(),
});

const GURU_ROLES = new Set(["guru", "owner", "admin_sekolah"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
  const session = await requireSession(request);

  const ip = ipFromRequest(request);
  const rl = checkRateLimitSync(`pengumuman:${ip}`, 30, 60_000);
  if (!rl.allowed) return apiRateLimit(rl.retryAfter);

  const { id } = await params;
  const [row] = await db.select().from(pengumuman).where(eq(pengumuman.id, id)).limit(1);
  if (!row) return apiError("Pengumuman tidak ditemukan", 404);
  if (row.target === "GURU" && !GURU_ROLES.has(session.role)) {
    return apiError("Tidak diizinkan", 403);
  }
  return NextResponse.json(row);
  } catch (e) {
    console.error("Pengumuman GET error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
  const session = await requireSession(request);

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const { id } = await params;
  const [existing] = await db.select().from(pengumuman).where(eq(pengumuman.id, id)).limit(1);
  if (!existing) return apiError("Pengumuman tidak ditemukan", 404);
  if (existing.guruId !== session.userId && session.role !== "owner") {
    return apiError("Hanya pembuat yang bisa mengubah", 403);
  }

  const ip = ipFromRequest(request);
  const rl = checkRateLimitSync(`pengumuman-update:${ip}`, 10, 60000);
  if (!rl.allowed) return apiRateLimit(rl.retryAfter);

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return apiError("Data tidak valid", 400);

  const { judul, konten, target, isPinned, expiresAt } = parsed.data;
  const where = session.role === "owner"
    ? eq(pengumuman.id, id)
    : and(eq(pengumuman.id, id), eq(pengumuman.guruId, session.userId));

  const [updated] = await db
    .update(pengumuman)
    .set({
      judul,
      konten,
      target,
      isPinned,
      ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
    })
    .where(where)
    .returning();

  return NextResponse.json(updated);
  } catch (e) {
    console.error("Pengumuman PUT error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
  const session = await requireSession(request);

  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  const { id } = await params;
  const [existing] = await db.select().from(pengumuman).where(eq(pengumuman.id, id)).limit(1);
  if (!existing) return apiError("Pengumuman tidak ditemukan", 404);
  if (existing.guruId !== session.userId && session.role !== "owner") {
    return apiError("Hanya pembuat yang bisa menghapus", 403);
  }

  const where = session.role === "owner"
    ? eq(pengumuman.id, id)
    : and(eq(pengumuman.id, id), eq(pengumuman.guruId, session.userId));

  await db.delete(pengumuman).where(where);
  return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Pengumuman DELETE error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}