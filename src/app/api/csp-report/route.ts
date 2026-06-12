import { NextResponse } from "next/server";

export async function POST() {
  // CSP violation report — log only, no response needed
  // Production deployments should log these to an external service
  return NextResponse.json({ ok: true });
}
