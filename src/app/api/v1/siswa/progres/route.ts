import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { quizAttempt, quizPublished, siswaKursus, kursus } from "@/lib/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success) return apiError("Sesi tidak valid", 401);
    const session = _ar.data;
    if (session.role !== "murid" && session.role !== "orang_tua") {
      return apiError("Hanya siswa yang dapat melihat progres", 403);
    }

    const rl = await checkRateLimit(`siswa-progres:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

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
      .limit(50);

    const quizIds = [...new Set(attempts.map((a) => a.quizPublishedId))];
    const quizList = quizIds.length
      ? await db
          .select()
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

    const totalRata = attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + (a.nilai ?? 0), 0) / attempts.length,
        )
      : 0;
    const totalSelesai = attempts.filter((a) => a.status === "SELESAI").length;

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
    });
  } catch (e) {
    console.error("Siswa progres error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
