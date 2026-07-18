import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { materiPublished, materiSharing, users, kursus } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 50);
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10) || 0;

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`katalog:${ip}`, 60, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    let rows;
    try {
      rows = await db
        .select({
          id: materiPublished.id,
          judul: materiPublished.judul,
          ringkasan: materiPublished.ringkasan,
          publishedAt: materiPublished.publishedAt,
          guruNama: users.nama,
          guruId: users.id,
          kursusJudul: kursus.judul,
          visibility: materiSharing.visibility,
          approvalStatus: materiSharing.approvalStatus,
        })
        .from(materiPublished)
        .innerJoin(materiSharing, eq(materiPublished.id, materiSharing.materiPublishedId))
        .innerJoin(users, eq(materiPublished.guruId, users.id))
        .innerJoin(kursus, eq(materiPublished.kursusId, kursus.id))
        .where(
          and(
            eq(materiSharing.visibility, "PUBLIK"),
            eq(materiSharing.approvalStatus, "APPROVED"),
          ),
        )
        .orderBy(desc(materiPublished.publishedAt))
        .limit(limit)
        .offset(offset);
    } catch (dbError) {
      console.error("[katalog] Database query failed:", dbError);
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ data: rows, limit, offset }, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } });
  } catch (e) {
    console.error("Katalog error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}