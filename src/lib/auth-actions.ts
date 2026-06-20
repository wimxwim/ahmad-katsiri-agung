"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LoginMuridSchema, LoginGuruSchema } from "./validation";
import { signSession } from "./auth";
import { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "./session";

export async function loginMurid(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = LoginMuridSchema.safeParse(raw);
  if (!parsed.success) {
    const error = parsed.error.issues[0]?.message || "Data tidak valid";
    return { error };
  }

  const { nama, kelas, noAbsen, nis, sekolah } = parsed.data;

  const token = await signSession({
    role: "murid",
    nama,
    kelas,
    noAbsen,
    nis: nis || undefined,
    sekolah: sekolah || undefined,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  revalidatePath("/", "layout");
  return { success: true, redirect: "/" };
}

export async function loginGuru(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = LoginGuruSchema.safeParse(raw);
  if (!parsed.success) {
    const error = parsed.error.issues[0]?.message || "Data tidak valid";
    return { error };
  }

  const { nama, password } = parsed.data;
  const guruPassword = process.env.GURU_PASSWORD;

  if (!guruPassword) {
    return { error: "Login guru belum dikonfigurasi" };
  }

  if (password.length !== guruPassword.length || password !== guruPassword) {
    return { error: "Kata sandi salah" };
  }

  const token = await signSession({
    role: "guru",
    nama,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  revalidatePath("/", "layout");
  return { success: true, redirect: "/" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  revalidatePath("/", "layout");
  redirect("/masuk");
}
