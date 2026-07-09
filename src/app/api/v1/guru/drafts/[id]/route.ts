import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { apiError } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  const session = _ar && _ar.success ? _ar.data : null;
  if (!session) return apiError("Sesi tidak valid", 401);

  const { id } = await params;
  const [row] = await db
    .select()
    .from(aiGeneration)
    .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
    .limit(1);

  if (!row) return apiError("Draft tidak ditemukan", 404);
  return NextResponse.json({ data: row });
}
