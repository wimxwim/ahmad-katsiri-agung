import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { randomUUID } from "crypto";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { hs256Secret } from "@/lib/auth-keys";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireGuru(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`kursus-invite:${ip}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const { id } = await params;

    const [k] = await db
      .select({ id: kursus.id, judul: kursus.judul, guruId: kursus.guruId })
      .from(kursus)
      .where(and(eq(kursus.id, id), eq(kursus.guruId, session.userId)))
      .limit(1);
    if (!k) return apiError("Kursus tidak ditemukan", 404);

    const token = await new SignJWT({
      kursusId: k.id,
      guruId: k.guruId,
      action: "enroll",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .setJti(randomUUID())
      .sign(hs256Secret());

    const inviteLink = `${request.nextUrl.origin}/undang?token=${token}`;

    return NextResponse.json({ data: { token, inviteLink, kursusJudul: k.judul } });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Kursus invite error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}