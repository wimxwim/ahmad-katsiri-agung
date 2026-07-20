import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { soalPublished, siswaKursus, aiGeneration } from "@/lib/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { validateCsrf } from "@/lib/csrf-server";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ aiGenId: string }> },
) {
  try {
    const session = await requireSiswa(request);
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const { aiGenId } = await params;
    const rl = await checkRateLimit(`siswa-soal-submit:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [ag] = await db
      .select({ id: aiGeneration.id, kursusId: aiGeneration.kursusId })
      .from(aiGeneration)
      .where(eq(aiGeneration.id, aiGenId))
      .limit(1);
    if (!ag) return apiError("Batch soal tidak ditemukan", 404);

    const [enrolled] = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(
        and(
          eq(siswaKursus.siswaId, session.userId!),
          eq(siswaKursus.kursusId, ag.kursusId!),
          eq(siswaKursus.status, "AKTIF"),
        ),
      )
      .limit(1);
    if (!enrolled) return apiError("Anda belum terdaftar di kursus ini", 403);

    const body = await request.json().catch(() => ({}));
    const jawaban: Record<string, string> = body.jawaban || {};

    const soals = await db
      .select({ id: soalPublished.id, kunci: soalPublished.kunci })
      .from(soalPublished)
      .where(
        and(
          eq(soalPublished.aiGenerationId, aiGenId),
          isNull(soalPublished.quizPublishedId),
        ),
      )
      .orderBy(asc(soalPublished.urutan));

    let benar = 0;
    let salah = 0;
    const detail = soals.map((s) => {
      const jwb = jawaban[s.id] || "";
      const correct = jwb === s.kunci;
      if (correct) benar++;
      else salah++;
      return { soalId: s.id, jawaban: jwb, kunci: s.kunci, benar: correct };
    });

    const nilai = soals.length > 0 ? Math.round((benar / soals.length) * 100) : 0;

    return NextResponse.json({
      data: { nilai, jumlahBenar: benar, jumlahSalah: salah, totalSoal: soals.length, detail },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Soal submit error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}