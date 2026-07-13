import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, errors } from "jose";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { siswaKursus, kursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { hs256Secret } from "@/lib/auth-keys";

interface InvitePayload {
  kursusId: string;
  guruId: string;
  action: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSiswa(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`invite-verify:${ip}`, 5, 30_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json().catch(() => ({}));
    const token = body.token as string;
    if (!token) return apiError("Token undangan tidak ditemukan", 400);

    let payload: InvitePayload;
    try {
      const verified = await jwtVerify<InvitePayload>(token, hs256Secret(), { algorithms: ["HS256"] });
      payload = verified.payload;
    } catch (err) {
      if (err instanceof errors.JWTExpired) return apiError("Link undangan sudah kadaluarsa", 400);
      return apiError("Link undangan tidak valid", 400);
    }

    if (payload.action !== "enroll") return apiError("Link undangan tidak valid", 400);

    const [k] = await db
      .select({ id: kursus.id, judul: kursus.judul, slug: kursus.slug, guruId: kursus.guruId, statusPublikasi: kursus.statusPublikasi })
      .from(kursus)
      .where(eq(kursus.id, payload.kursusId))
      .limit(1);
    if (!k) return apiError("Kursus tidak ditemukan", 404);
    if (k.statusPublikasi !== "PUBLIK") return apiError("Kursus belum dipublikasikan oleh guru", 400);
    if (k.guruId !== payload.guruId) return apiError("Link undangan sudah tidak berlaku (kursus telah dialihkan)", 400);

    const existing = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId!), eq(siswaKursus.kursusId, k.id)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        redirectTo: `/siswa/materi?kursusId=${k.id}`,
        kursusJudul: k.judul,
      });
    }

    try {
      await db.insert(siswaKursus).values({
        siswaId: session.userId!,
        kursusId: k.id,
        status: "AKTIF",
      });
    } catch (e: unknown) {
      const pgErr = e as { code?: string };
      if (pgErr.code === "23505") {
        return NextResponse.json({
          success: true,
          alreadyEnrolled: true,
          redirectTo: `/siswa/materi?kursusId=${k.id}`,
          kursusJudul: k.judul,
        });
      }
      throw e;
    }

    return NextResponse.json({
      success: true,
      enrolled: true,
      redirectTo: `/siswa/materi?kursusId=${k.id}`,
      kursusJudul: k.judul,
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Invite verify error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}