import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getRouteHandler() {
  const { getShowAdminUI } = await import("../../../../../keystatic.config");
  if (!getShowAdminUI()) return null;

  const { makeRouteHandler } = await import("@keystatic/next/route-handler");
  const keystaticConfig = (await import("../../../../../keystatic.config")).default;

  return makeRouteHandler({ config: keystaticConfig });
}

export async function GET(
  request: NextRequest,
) {
  const handler = await getRouteHandler();
  if (!handler) return new NextResponse(null, { status: 404 });
  return handler.GET(request);
}

export async function POST(
  request: NextRequest,
) {
  const handler = await getRouteHandler();
  if (!handler) return new NextResponse(null, { status: 404 });
  return handler.POST(request);
}
