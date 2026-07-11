import Link from "next/link";
import { WA_NUMBER } from "@/lib/constants";
import { cookies } from "next/headers";
import { ShieldAlert, ArrowRight, LogIn, UserCog } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Akun tidak cocok dengan portal — AKAL Center",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ [k: string]: string | undefined }>;
}

const PORTAL_LABEL = {
  guru: "Portal Guru",
  siswa: "Portal Siswa",
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin_sekolah: "Admin Sekolah",
  guru: "Guru",
  murid: "Siswa",
  orang_tua: "Orang Tua",
};

const ROLE_PORTAL: Record<string, "guru" | "siswa"> = {
  owner: "guru",
  admin_sekolah: "guru",
  guru: "guru",
  murid: "siswa",
  orang_tua: "siswa",
};

export default async function RoleMismatchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const expected = params.expected === "guru" || params.expected === "siswa" ? params.expected : null;
  const actual = params.actual && ROLE_LABEL[params.actual] ? params.actual : null;
  const reason = params.reason || null;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("akal_sesi");
  if (!sessionCookie?.value) {
    redirect("/masuk");
  }

  const expectedLabel = expected ? PORTAL_LABEL[expected] : "Portal yang Anda pilih";
  const actualRole = actual ? ROLE_LABEL[actual] : "peran lain";
  const actualPortal = actual ? ROLE_PORTAL[actual] : null;
  const actualLabel = actualPortal ? PORTAL_LABEL[actualPortal] : "Portal sesuai peran Anda";

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface px-3 py-10 sm:px-5 lg:px-8">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-border-precision shadow-glass-lg p-8 sm:p-10">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 grid place-items-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="font-heading font-bold text-2xl text-on-surface text-center">
          Akun ini terdaftar sebagai {actualRole}
        </h1>
        <p className="text-sm text-on-surface-variant text-center mt-3 max-w-md mx-auto">
          {expected
            ? `Anda mencoba masuk lewat ${expectedLabel}, tapi akun Anda adalah akun ${actualRole}.`
            : `Akun Anda terdaftar sebagai ${actualRole}, bukan peran yang Anda pilih.`}{" "}
          Gunakan {actualLabel} untuk masuk ke ruang yang sesuai, atau ganti akun jika Anda memang
          ingin masuk sebagai peran lain.
        </p>

        {reason === "google_signup_first_time" && (
          <div className="mt-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
            Akun ini baru dibuat lewat Google. Sistem otomatis mendaftarkannya sebagai{" "}
            {actualRole}. Jika Anda ingin role lain, daftar ulang dari portal yang sesuai.
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {actualPortal && (
            <Link
              href={`/masuk?portal=${actualPortal}`}
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Masuk sebagai {actualRole}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <Link
            href="/masuk"
            className="inline-flex items-center justify-center gap-2 bg-white text-on-surface border border-border-precision px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-surface transition-colors"
          >
            <UserCog className="w-4 h-4" />
            Ganti Akun
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-on-surface-variant">
          Butuh bantuan? Hubungi{" "}
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            tim AKAL Center via WhatsApp
          </a>
          .
        </p>
      </div>
    </div>
  );
}
