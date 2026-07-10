import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireGuru(_req);

    const rl = await checkRateLimit(`kursus-detail:${session.userId}`, 30, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;
    const result = await db.select().from(kursus).where(eq(kursus.id, id)).limit(1);
    if (!result.length) {
      return apiError("Kursus tidak ditemukan", 404);
    }
    const k = result[0];

    const isOwner = session.role === "owner";
    const isGuruPemilik = session.role === "guru" && k.guruId === session.userId;
    const isSiswaPublic = session.role === "murid" && k.isPublic;

    if (!isOwner && !isGuruPemilik && !isSiswaPublic) {
      return apiError("Anda tidak punya akses ke kursus ini", 403);
    }

    return NextResponse.json({ data: k });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kursus detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
