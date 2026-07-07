import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq, isNull } from "drizzle-orm";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { db } from "@/lib/db";
import { kelas } from "@/lib/db/schema";
import { apiError, apiRateLimit } from "@/lib/api-response";

const CreateKelasSchema = z.object({
  nama: z.string().min(1).max(50),
  tingkat: z.number().int().min(1).max(20),
});

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const session = await verifySession(sessionCookie.value);
    if (!session || (session.role !== "guru" && session.role !== "owner")) {
      return apiError("Hanya guru yang dapat melihat kelas", 403);
    }

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`kelas-list:${ip}`, 30, 15000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const data = await db
      .select()
      .from(kelas)
      .where(and(eq(kelas.guruId, session.userId!), isNull(kelas.deletedAt)))
      .orderBy(desc(kelas.createdAt));

    return NextResponse.json({ data });
  } catch (e) {
    console.error("Kelas list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return apiError("Sesi tidak valid", 401);
    const session = await verifySession(sessionCookie.value);
    if (!session || (session.role !== "guru" && session.role !== "owner")) {
      return apiError("Hanya guru yang dapat membuat kelas", 403);
    }

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`kelas-create:${ip}`, 10, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    const body = await request.json();
    const parsed = CreateKelasSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message || "Data tidak valid", 400);

    const [newKelas] = await db
      .insert(kelas)
      .values({
        nama: sanitizeText(parsed.data.nama, 50),
        tingkat: parsed.data.tingkat,
        guruId: session.userId!,
      })
      .returning();

    return NextResponse.json({ data: newKelas }, { status: 201 });
  } catch (e) {
    console.error("Kelas create error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
