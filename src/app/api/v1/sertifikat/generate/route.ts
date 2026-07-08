import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";
import { sertifikat, kursus, jawabanLog, skill, soal } from "@/lib/db/schema";
import { generateQRHash } from "@/lib/sertifikat/generateQRHash";
import { apiError, apiRateLimit } from "@/lib/api-response";

const GenerateSertifikatSchema = z.object({
  siswaId: z.string().uuid(),
  kursusId: z.string().uuid(),
});

function generateNomorSertifikat(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AKAL-${ts}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return apiError("Silakan login terlebih dahulu", 401);
    }
    const _ar = await verifySession(sessionCookie.value);
    if (!_ar.success || (_ar.data.role !== "guru" && _ar.data.role !== "owner")) {
      return apiError("Hanya guru yang dapat membuat sertifikat", 403);
    }
    const session = _ar.data;

    const rl = await checkRateLimit(`sertifikat-gen:${session.userId}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = GenerateSertifikatSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Data tidak valid", parsed.error.flatten(), 400);
    }

    const { siswaId, kursusId } = parsed.data;

    const [targetKursus] = await db
      .select({ id: kursus.id, guruId: kursus.guruId })
      .from(kursus)
      .where(eq(kursus.id, kursusId));

    if (!targetKursus) {
      return apiError("Kursus tidak ditemukan", 404);
    }

    const isOwner = session.role === "owner";
    if (!isOwner && targetKursus.guruId !== session.userId) {
      return apiError("Kursus ini bukan milik Anda", 403);
    }

    const kursusSkills = await db
      .select({ id: skill.id })
      .from(skill)
      .where(eq(skill.kursusId, kursusId));

    if (!kursusSkills.length) {
      return apiError("Kursus ini belum memiliki soal", 400);
    }

    const skillIds = kursusSkills.map((s) => s.id);

    const kursusSoal = await db
      .select({ id: soal.id })
      .from(soal)
      .where(inArray(soal.skillId, skillIds));

    if (!kursusSoal.length) {
      return apiError("Kursus ini belum memiliki soal", 400);
    }

    const soalIds = kursusSoal.map((s) => s.id);

    const siswaJawaban = await db
      .select({ id: jawabanLog.id })
      .from(jawabanLog)
      .where(
        and(
          eq(jawabanLog.siswaId, siswaId),
          inArray(jawabanLog.soalId, soalIds)
        )
      );

    if (!siswaJawaban.length) {
      return apiError("Siswa belum menyelesaikan kuis", 400);
    }

    const [existing] = await db
      .select({ id: sertifikat.id })
      .from(sertifikat)
      .where(
        and(
          eq(sertifikat.siswaId, siswaId),
          eq(sertifikat.kursusId, kursusId)
        )
      );

    if (existing) {
      const nomorSertifikat = generateNomorSertifikat();
      const qrSecretHash = generateQRHash(nomorSertifikat, siswaId);

      const [updated] = await db
        .update(sertifikat)
        .set({ nomorSertifikat, qrSecretHash, issuedAt: new Date() })
        .where(eq(sertifikat.id, existing.id))
        .returning();

      return NextResponse.json({
        data: { nomorSertifikat: updated.nomorSertifikat, qrSecretHash: updated.qrSecretHash },
        message: "sertifikat_pdf_not_ready",
      });
    }

    const nomorSertifikat = generateNomorSertifikat();
    const qrSecretHash = generateQRHash(nomorSertifikat, siswaId);

    const [newSertifikat] = await db
      .insert(sertifikat)
      .values({ siswaId, kursusId, nomorSertifikat, qrSecretHash })
      .returning();

    return NextResponse.json({
      data: { nomorSertifikat: newSertifikat.nomorSertifikat, qrSecretHash: newSertifikat.qrSecretHash },
      message: "sertifikat_pdf_not_ready",
    }, { status: 201 });
  } catch (e) {
    console.error("Sertifikat generate error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
