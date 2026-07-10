import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, ROLE_HOME_PATHS } from "@/lib/session";
import { DaftarPicker } from "./DaftarPicker";

export const metadata: Metadata = {
  title: "Daftar",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://akalcenter.my.id/daftar",
  },
};

export default async function DaftarPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (sessionCookie?.value) {
    const _ar = await verifySession(sessionCookie.value);
    if (_ar.success) {
      const home = ROLE_HOME_PATHS[_ar.data.role] || "/";
      redirect(home);
    }
  }
  return (
    <div className="min-h-screen bg-surface px-3 py-10 sm:px-5 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 rounded-[32px] border border-border-precision bg-white p-6 shadow-glass-lg md:grid-cols-2 md:p-10">
          <div className="md:pr-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-primary">
              AKAL CENTER
            </span>
            <h1 className="mt-6 font-heading text-3xl font-bold leading-tight text-on-surface sm:text-4xl">
              Pilih jalur akun yang sesuai dengan peranmu.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
              Kami pisahkan onboarding guru dan siswa sejak awal supaya dashboard, akses, dan alur
              belajarnya tidak tercampur lagi.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                Guru: dashboard, materi, kuis, siswa, analitik, dan draft AI.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                Siswa: materi, kuis, progres, dan sertifikat.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                Login Google juga tersedia di kedua portal.
              </li>
            </ul>
          </div>

          <Suspense fallback={<div className="p-6 text-on-surface-variant">Memuat...</div>}>
            <DaftarPicker />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
