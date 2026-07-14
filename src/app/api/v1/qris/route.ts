import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

const QRIS_PATH = join(process.cwd(), "public", "images", "qris-gopay.webp");

export async function GET() {
  try {
    const buffer = await readFile(QRIS_PATH);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("QRIS image not found", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }
}