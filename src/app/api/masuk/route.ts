import { NextRequest, NextResponse } from "next/server";
import { LoginMuridSchema, LoginGuruSchema } from "@/lib/validation";
import { signSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const mode = formData.get("_mode") as string;

    if (mode === "murid") {
      const raw = Object.fromEntries(formData);
      const parsed = LoginMuridSchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Data tidak valid" },
          { status: 400 }
        );
      }

      const { nama, kelas, noAbsen, nis, sekolah } = parsed.data;
      const redirectTo = formData.get("redirect") as string || "/";

      const token = await signSession({
        role: "murid",
        nama,
        kelas,
        noAbsen,
        nis: nis || undefined,
        sekolah: sekolah || undefined,
      });

      const response = NextResponse.json({ success: true, redirect: redirectTo });
      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION_SECONDS,
      });
      return response;
    }

    if (mode === "guru") {
      const raw = Object.fromEntries(formData);
      const parsed = LoginGuruSchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Data tidak valid" },
          { status: 400 }
        );
      }

      const { nama, password } = parsed.data;
      const guruPassword = process.env.GURU_PASSWORD;
      const redirectTo = formData.get("redirect") as string || "/";

      if (!guruPassword) {
        return NextResponse.json(
          { error: "Login guru belum dikonfigurasi" },
          { status: 500 }
        );
      }

      if (password.length !== guruPassword.length || password !== guruPassword) {
        return NextResponse.json(
          { error: "Kata sandi salah" },
          { status: 401 }
        );
      }

      const token = await signSession({
        role: "guru",
        nama,
      });

      const response = NextResponse.json({ success: true, redirect: redirectTo });
      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION_SECONDS,
      });
      return response;
    }

    // Logout
  if (mode === "logout") {
    const response = NextResponse.json({ success: true, redirect: "/masuk" });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({ error: "Mode tidak valid" }, { status: 400 });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
