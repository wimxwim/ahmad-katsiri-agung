import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";
import { db } from "@/lib/db";
import { sertifikat, siswaKursus, quizAttempt, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { generateQRHash } from "@/lib/sertifikat/generateQRHash";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireGuru(request);
    const { kursusId } = await request.json();

    if (!kursusId || typeof kursusId !== "string") {
      return apiError("kursusId wajib diisi", 400);
    }

    const eligible = await db
      .select({
        siswaId: siswaKursus.siswaId,
        nama: users.nama,
        quizCount: sql<number>`count(${quizAttempt.id})`.mapWith(Number),
        nilaiRata: sql<number>`round(avg(${quizAttempt.nilai}))`.mapWith(Number),
      })
      .from(siswaKursus)
      .innerJoin(users, eq(users.id, siswaKursus.siswaId))
      .leftJoin(quizAttempt, eq(quizAttempt.siswaId, siswaKursus.siswaId))
      .where(eq(siswaKursus.kursusId, kursusId))
      .groupBy(siswaKursus.siswaId, users.nama)
      .having(sql`count(${quizAttempt.id}) > 0`);

    let generated = 0;

    for (const s of eligible) {
      const existing = await db
        .select({ id: sertifikat.id })
        .from(sertifikat)
        .where(and(eq(sertifikat.siswaId, s.siswaId), eq(sertifikat.kursusId, kursusId)))
        .limit(1);

      if (existing.length > 0) continue;

      const nomor = `AKAL-${kursusId.slice(0, 8)}-${s.siswaId.slice(0, 8)}-${crypto.randomInt(1000, 9999)}`;
      const qrHash = generateQRHash(nomor, s.siswaId);

      await db.insert(sertifikat).values({
        siswaId: s.siswaId,
        kursusId,
        nomorSertifikat: nomor,
        qrSecretHash: qrHash,
      });

      generated++;
    }

    return NextResponse.json({
      success: true,
      data: { generated, totalEligible: eligible.length },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Sertifikat generate error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}