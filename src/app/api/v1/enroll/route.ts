import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { db } from "@/lib/db";
import { siswaKursus, kursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";

const EnrollSchema = z.object({
  kursusId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireSiswa(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`enroll:${ip}`, 5, 30000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = EnrollSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400);
    }

    const [course] = await db
      .select({ id: kursus.id, isPublic: kursus.isPublic, statusPublikasi: kursus.statusPublikasi })
      .from(kursus)
      .where(and(eq(kursus.id, parsed.data.kursusId), eq(kursus.isPublic, true), eq(kursus.statusPublikasi, "PUBLIK")))
      .limit(1);

    if (!course) {
      return apiError("Kursus tidak ditemukan atau belum tersedia untuk umum", 404);
    }

    const existing = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.kursusId, parsed.data.kursusId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ success: true, enrolled: true, alreadyEnrolled: true });
    }

    try {
      const [enrollment] = await db
        .insert(siswaKursus)
        .values({ siswaId: session.userId!, kursusId: parsed.data.kursusId, status: "AKTIF" })
        .returning();
      return NextResponse.json({ success: true, enrolled: true, data: enrollment });
    } catch (e: unknown) {
      const pgErr = e as { code?: string };
      if (pgErr.code === "23505") {
        return NextResponse.json({ success: true, enrolled: true, alreadyEnrolled: true });
      }
      throw e;
    }
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Enroll error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
