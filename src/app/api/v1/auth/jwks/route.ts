import { NextResponse } from "next/server";

export async function GET() {
  if (!process.env.JWT_PUBLIC_KEY) {
    return NextResponse.json({ keys: [] });
  }

  try {
    const { getPublicJWK } = await import("@/lib/auth-keys");
    const jwk = await getPublicJWK();
    return NextResponse.json({ keys: [jwk] }, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Content-Type": "application/jwk-set+json",
      },
    });
  } catch {
    return NextResponse.json({ keys: [] });
  }
}
