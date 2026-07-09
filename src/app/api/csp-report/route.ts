import { NextRequest } from "next/server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { apiError, apiRateLimit, apiSuccess } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const ip = ipFromRequest(req);
    const limit = await checkRateLimit(`csp-report:${ip}`, 20, 60_000);
    if (!limit.allowed) return apiRateLimit(limit.retryAfter);

    const text = await req.text();
    if (text.length > 100_000) {
      return apiError("Payload terlalu besar", 413);
    }
    const report = JSON.parse(text);
    console.error("CSP Violation:", JSON.stringify(report));
  } catch (e) {
    console.error("CSP report error:", e);
  }
  return apiSuccess();
}
