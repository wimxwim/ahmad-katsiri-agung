import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiGeneration } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rows = await db
      .select()
      .from(aiGeneration)
      .where(eq(aiGeneration.guruId, session.userId))
      .orderBy(desc(aiGeneration.createdAt))
      .limit(50);

    return NextResponse.json({ data: rows });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    console.error("Drafts list error:", e);
    return apiError("Terjadi kesalahan server", 500);
  }
}
