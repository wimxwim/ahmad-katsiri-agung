import { NextResponse } from "next/server";
import { readRows, overwriteRows } from "@/lib/google-sheets";

const RANGE = "DoaUcapan!A:D";

export async function POST() {
  try {
    const rows = await readRows(RANGE);
    const header = rows[0];
    const testIds = [
      "doa_1781726593880",
      "doa_1781726319370",
      "doa_1781726318606",
      "doa_1781726260101",
      "doa_1781726260037",
    ];

    const cleanRows = [header];
    let removed = 0;
    for (let i = 1; i < rows.length; i++) {
      if (testIds.includes(rows[i][0])) {
        removed++;
      } else {
        cleanRows.push(rows[i]);
      }
    }

    await overwriteRows(RANGE, cleanRows);
    return NextResponse.json({
      success: true,
      totalBefore: rows.length,
      removed,
      remaining: cleanRows.length - 1,
    });
  } catch (e) {
    console.error("Cleanup failed:", e);
    return NextResponse.json({ error: "Gagal bersihin doa" }, { status: 500 });
  }
}
