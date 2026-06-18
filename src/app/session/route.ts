import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams.toString();
  const destination = `/api/keystatic/session${params ? `?${params}` : ""}`;

  return NextResponse.redirect(new URL(destination, url.origin), {
    status: 307,
    headers: request.headers,
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams.toString();
  const destination = `/api/keystatic/session${params ? `?${params}` : ""}`;

  return NextResponse.redirect(new URL(destination, url.origin), {
    status: 307,
    headers: request.headers,
  });
}
