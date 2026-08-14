// DEPRECATED: This endpoint uses legacy jawabanLog table.
// Use POST /api/v1/guru/sertifikat/generate instead.
// Scheduled for removal: 2026-08-01
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: { code: "GONE", message: "Endpoint deprecated. Gunakan POST /api/v1/guru/sertifikat/generate." } },
    { status: 410, headers: { Deprecation: "true", Sunset: "Sat, 01 Aug 2026 00:00:00 GMT" } },
  );
}

export async function GET() {
  return NextResponse.json(
    { error: { code: "GONE", message: "Endpoint deprecated. Gunakan POST /api/v1/guru/sertifikat/generate." } },
    { status: 410, headers: { Deprecation: "true", Sunset: "Sat, 01 Aug 2026 00:00:00 GMT" } },
  );
}
