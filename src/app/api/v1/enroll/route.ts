import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";
import { siswaKursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";

const EnrollSchema = z.object({
  kursusId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return apiError("Silakan login terlebih dahulu", 401);
    }
    const session = await verifySession(sessionCookie.value);
    if (!session || session.role !== "murid") {
      return apiError("Hanya siswa yang dapat mendaftar kursus", 403);
    }

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`enroll:${ip}`, 5, 30000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = EnrollSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400);
    }

    const existing = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.kursusId, parsed.data.kursusId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ success: true, enrolled: true, alreadyEnrolled: true });
    }

    const [enrollment] = await db
      .insert(siswaKursus)
      .values({ siswaId: session.userId!, kursusId: parsed.data.kursusId, status: "AKTIF" })
      .returning();

    return NextResponse.json({ success: true, enrolled: true, data: enrollment });
  } catch (e) {
    console.error("Enroll error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
