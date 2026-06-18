import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = checkRateLimit(`csp-report:${ip}`, 20, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const text = await req.text();
    if (text.length > 100_000) {
      return NextResponse.json({ error: "Payload terlalu besar" }, { status: 413 });
    }
    const report = JSON.parse(text);
    console.error("CSP Violation:", JSON.stringify(report));
  } catch {
    // silent — CSP reports are best-effort
  }
  return NextResponse.json({ ok: true });
}
