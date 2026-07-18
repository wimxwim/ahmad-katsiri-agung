import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSiswa, GuardError } from "@/lib/route-guard-v2";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { checkRateLimit, checkRateLimitPerUser, ipFromRequest } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { kelas, siswaKelas } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { validateCsrf } from "@/lib/csrf-server";

const ConsumeSchema = z.object({
  kode: z.string().min(1).max(8),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    const session = await requireSiswa(request);

    const ip = ipFromRequest(request);
    const ipRl = await checkRateLimit(`invite-consume-ip:${ip}`, 10, 60_000);
    if (!ipRl.allowed) return apiRateLimit(ipRl.retryAfter);

    const userRl = await checkRateLimitPerUser(`invite-consume:${session.userId}`, 5, 60_000);
    if (!userRl.allowed) return apiRateLimit(userRl.retryAfter);

    const { kode } = ConsumeSchema.parse(await request.json());

    const found = await db
      .select({ id: kelas.id, nama: kelas.nama, tingkat: kelas.tingkat, inviteExpiresAt: kelas.inviteExpiresAt })
      .from(kelas)
      .where(eq(kelas.kodeInvite, kode))
      .limit(1);

    if (found.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Kode undangan tidak ditemukan atau sudah tidak berlaku.",
        errorCode: "INVALID_CODE",
      }, { status: 404 });
    }

    if (found[0].inviteExpiresAt !== null && new Date(found[0].inviteExpiresAt) < new Date()) {
      return NextResponse.json({
        success: false,
        error: "Kode undangan sudah kadaluarsa.",
        errorCode: "INVALID_CODE",
      }, { status: 404 });
    }

    const k = found[0];

    const [existing] = await db
      .select({ id: siswaKelas.id })
      .from(siswaKelas)
      .where(and(eq(siswaKelas.siswaId, session.userId), eq(siswaKelas.kelasId, k.id)))
      .limit(1);

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        data: { kelasId: k.id, nama: k.nama, tingkat: k.tingkat },
      });
    }

    await db.insert(siswaKelas).values({
      siswaId: session.userId,
      kelasId: k.id,
    });

    return NextResponse.json({
      success: true,
      data: { kelasId: k.id, nama: k.nama, tingkat: k.tingkat },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Invite consume error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}