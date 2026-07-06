import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".ppt",
  ".pptx",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
]);

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const COLLECTION_DIRS = ["materi", "soal", "game", "hadits"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
  const { path: pathSegments } = await params;
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const rateCheck = checkRateLimit(`assets:${ip}`, 60, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const [entrySlug, ...filenameParts] = pathSegments;
  if (!entrySlug || filenameParts.length === 0) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // Path traversal protection
  if (entrySlug.includes("..") || entrySlug.includes("/") || entrySlug.includes("\\") ||
      entrySlug.includes("\0")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const filename = filenameParts.join("/");
  if (filename.includes("..") || filename.includes("\0")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Extension whitelist
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 403 });
  }

  const fs = await import("fs");

  // Try each collection directory
  for (const collection of COLLECTION_DIRS) {
    const collectionPath = path.join(
      process.cwd(),
      "content",
      collection,
      entrySlug,
      filename
    );

    try {
      if (fs.existsSync(collectionPath)) {
        const content = fs.readFileSync(collectionPath);
        const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

        return new NextResponse(content, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
    } catch {
      continue;
    }
  }

  // Fallback: try GitHub raw content (for files uploaded via CMS but not yet deployed)
  try {
    const repo = "wimxwim/ahmad-katsiri-agung";

    for (const collection of COLLECTION_DIRS) {
      const githubUrl = `https://raw.githubusercontent.com/${repo}/main/content/${collection}/${entrySlug}/${filename}`;
      const res = await fetch(githubUrl, {
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const blob = await res.blob();
        const contentType =
          CONTENT_TYPES[ext] || res.headers.get("content-type") || "application/octet-stream";

        return new NextResponse(blob, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
    }
  } catch {
    // GitHub unavailable — continue to 404
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
