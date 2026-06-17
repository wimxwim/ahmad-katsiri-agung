import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const report = await req.json();
    console.error("CSP Violation:", JSON.stringify(report));
  } catch {
    console.error("CSP report gagal diparse");
  }
  return NextResponse.json({ ok: true });
}
