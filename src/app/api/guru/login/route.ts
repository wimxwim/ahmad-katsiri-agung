import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readRows } from "@/lib/google-sheets";
import { signSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = sanitizeText(body.username ?? "").trim();
    const password = sanitizeText(body.password ?? "").trim();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    let rows: string[][];
    try {
      rows = await readRows("AkunGuru!A:C");
    } catch {
      return NextResponse.json({
        error: "Tab AkunGuru belum ada di Google Sheets. Buat tab baru dengan kolom: Username, Password, Nama",
      }, { status: 500 });
    }

    if (rows.length < 2) {
      return NextResponse.json({ error: "Belum ada akun guru terdaftar" }, { status: 401 });
    }

    const user = rows.slice(1).find(
      (row) => row[0]?.trim().toLowerCase() === username.toLowerCase() && row[1]?.trim() === password
    );

    if (!user) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    const nama = user[2]?.trim() || username;
    const token = await signSession({ role: "guru", nama });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return NextResponse.json({ success: true, nama });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
