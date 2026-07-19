import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { quizAttempt, quizPublished, siswaKursus, kursus } from "@/lib/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const rl = await checkRateLimit(`siswa-progres:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "20", 10), 100);
    const offset = Math.max(parseInt(request.nextUrl.searchParams.get("offset") || "0", 10), 0);

    const attempts = await db
      .select({
        id: quizAttempt.id,
        quizPublishedId: quizAttempt.quizPublishedId,
        nilai: quizAttempt.nilai,
        jumlahBenar: quizAttempt.jumlahBenar,
        jumlahSalah: quizAttempt.jumlahSalah,
        durasiDetik: quizAttempt.durasiDetik,
        waktuMulai: quizAttempt.waktuMulai,
        waktuSelesai: quizAttempt.waktuSelesai,
        status: quizAttempt.status,
      })
      .from(quizAttempt)
      .where(eq(quizAttempt.siswaId, session.userId!))
      .orderBy(desc(quizAttempt.waktuMulai))
      .limit(limit)
      .offset(offset);

    const quizIds = [...new Set(attempts.map((a) => a.quizPublishedId))];
    const quizList = quizIds.length
      ? await db
          .select({
            id: quizPublished.id,
            kursusId: quizPublished.kursusId,
            judul: quizPublished.judul,
            modeEvaluasi: quizPublished.modeEvaluasi,
          })
          .from(quizPublished)
          .where(inArray(quizPublished.id, quizIds))
      : [];

    const kursusIds = [...new Set(quizList.map((q) => q.kursusId))];
    const kursusList = kursusIds.length
      ? await db
          .select({ id: kursus.id, judul: kursus.judul })
          .from(kursus)
          .where(inArray(kursus.id, kursusIds))
      : [];
    const kursusMap = new Map(kursusList.map((k) => [k.id, k.judul]));

    const enrollments = await db
      .select({ kursusId: siswaKursus.kursusId })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.status, "AKTIF")));

    const completedAttempts = attempts.filter((a) => a.status === "SELESAI" || a.status === "BELAJAR");
    const totalRata = completedAttempts.length > 0
      ? Math.round(
          completedAttempts.reduce((sum, a) => sum + (a.nilai ?? 0), 0) / completedAttempts.length,
        )
      : 0;
    const totalSelesai = attempts.filter((a) => a.status === "SELESAI" || a.status === "BELAJAR").length;

    return NextResponse.json({
      data: {
        attempts: attempts.map((a) => {
          const quiz = quizList.find((q) => q.id === a.quizPublishedId);
          const tampilkanNilai = quiz?.modeEvaluasi !== "CBT";
          return {
            ...a,
            nilai: tampilkanNilai ? a.nilai : null,
            jumlahBenar: tampilkanNilai ? a.jumlahBenar : null,
            jumlahSalah: tampilkanNilai ? a.jumlahSalah : null,
            tampilkanNilai,
            modeEvaluasi: quiz?.modeEvaluasi || "BELAJAR",
            quizJudul: quiz?.judul || "Kuis",
            kursusId: quiz?.kursusId ?? null,
            kursusJudul: quiz?.kursusId ? (kursusMap.get(quiz.kursusId) ?? null) : null,
          };
        }),
        totalKursus: enrollments.length,
        totalAttempt: attempts.length,
        totalSelesai,
        rataNilai: totalRata,
      },
      limit,
      offset,
    }, { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Siswa progres error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
