import { NextResponse } from "next/server";
import { getFreeTierSummary } from "@/lib/free-tier";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    free: getFreeTierSummary(),
    pricing: [
      { amount: 50000, bonus: 0, label: "Rp50.000" },
      { amount: 100000, bonus: 10000, label: "Rp100.000 + Bonus 10K" },
      { amount: 200000, bonus: 30000, label: "Rp200.000 + Bonus 30K" },
      { amount: 500000, bonus: 100000, label: "Rp500.000 + Bonus 100K" },
    ],
  });
}