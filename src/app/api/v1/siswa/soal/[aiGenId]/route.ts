import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { soalPublished, siswaKursus, aiGeneration, kursus } from "@/lib/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ aiGenId: string }> },
) {
  try {
    const session = await requireSiswa(request);
    const { aiGenId } = await params;
    const rl = await checkRateLimit(`siswa-soal-detail:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const [ag] = await db
      .select({ id: aiGeneration.id, kursusId: aiGeneration.kursusId, materiJudul: aiGeneration.materiJudul })
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

    const [kursusRow] = await db
      .select({ judul: kursus.judul })
      .from(kursus)
      .where(eq(kursus.id, ag.kursusId!))
      .limit(1);

    const soals = await db
      .select({
        id: soalPublished.id,
        pertanyaan: soalPublished.pertanyaan,
        tipe: soalPublished.tipe,
        pilihanGanda: soalPublished.pilihanGanda,
        poin: soalPublished.poin,
        urutan: soalPublished.urutan,
        kunci: soalPublished.kunci,
      })
      .from(soalPublished)
      .where(
        and(
          eq(soalPublished.aiGenerationId, aiGenId),
          isNull(soalPublished.quizPublishedId),
        ),
      )
      .orderBy(asc(soalPublished.urutan));

    const mode = request.nextUrl.searchParams.get("mode") || "belajar";

    return NextResponse.json({
      data: {
        aiGenerationId: aiGenId,
        judul: ag.materiJudul ? `Soal: ${ag.materiJudul}` : "Soal Latihan",
        kursusJudul: kursusRow?.judul ?? "Kursus",
        soal: soals.map((s) => ({
          id: s.id,
          pertanyaan: s.pertanyaan,
          tipe: s.tipe,
          pilihanGanda: s.pilihanGanda,
          poin: s.poin,
          ...(mode === "belajar" ? { kunci: s.kunci } : {}),
        })),
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Soal detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}