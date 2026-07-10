import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/dal";
import { checkRateLimitSync, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { pengumuman } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiRateLimit, apiUnauthorized } from "@/lib/api-response";

const UpdateSchema = z.object({
  judul: z.string().min(1).max(255).optional(),
  konten: z.string().min(1).optional(),
  target: z.enum(["SEMUA", "GURU", "SISWA"]).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isPinned: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [row] = await db.select().from(pengumuman).where(eq(pengumuman.id, id)).limit(1);
  if (!row) return apiError("Pengumuman tidak ditemukan", 404);
  return NextResponse.json(row);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return apiUnauthorized();

  if (session.role !== "guru" && session.role !== "owner" && session.role !== "admin_sekolah") {
    return apiError("Tidak diizinkan", 403);
  }

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
  const [updated] = await db
    .update(pengumuman)
    .set({
      judul,
      konten,
      target,
      isPinned,
      ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
    })
    .where(eq(pengumuman.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return apiUnauthorized();

  if (session.role !== "guru" && session.role !== "owner" && session.role !== "admin_sekolah") {
    return apiError("Tidak diizinkan", 403);
  }

  const { id } = await params;
  const [existing] = await db.select().from(pengumuman).where(eq(pengumuman.id, id)).limit(1);
  if (!existing) return apiError("Pengumuman tidak ditemukan", 404);
  if (existing.guruId !== session.userId && session.role !== "owner") {
    return apiError("Hanya pembuat yang bisa menghapus", 403);
  }

  await db.delete(pengumuman).where(eq(pengumuman.id, id));
  return NextResponse.json({ success: true });
}
