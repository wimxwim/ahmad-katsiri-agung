import { apiError } from "@/lib/api-response";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { requireSession, GuardError } from "@/lib/route-guard-v2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession(request);

    const { id } = await params;
    const [row] = await db
      .select()
      .from(aiGeneration)
      .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId)))
      .limit(1);

    if (!row) return apiError("Draft tidak ditemukan", 404);
    return NextResponse.json({ data: row });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Draft detail error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
