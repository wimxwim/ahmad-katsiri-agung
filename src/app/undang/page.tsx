import { redirect } from "next/navigation";
import { jwtVerify, errors } from "jose";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { hs256Secret } from "@/lib/auth-keys";
import { db } from "@/lib/db";
import { siswaKursus, kursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { AlertTriangle, LogOut } from "lucide-react";
import Link from "next/link";

interface InvitePayload {
  kursusId: string;
  guruId: string;
  action: string;
}

export default async function UndangPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

  if (!token) {
    redirect("/masuk?portal=siswa&error=invite_missing");
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    const returnUrl = encodeURIComponent(`/undang?token=${token}`);
    redirect(`/masuk?portal=siswa&redirect=${returnUrl}`);
  }

  const sessionResult = await verifySession(sessionCookie.value);
  if (!sessionResult.success) {
    const returnUrl = encodeURIComponent(`/undang?token=${token}`);
    redirect(`/masuk?portal=siswa&redirect=${returnUrl}`);
  }

  const session = sessionResult.data;
  if (session.role !== "murid" && session.role !== "orang_tua") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-glass rounded-[32px] border border-border-precision p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="font-heading font-bold text-xl text-on-surface mb-2">Link untuk Akun Siswa</h1>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            Link undangan ini hanya bisa digunakan oleh akun <strong>siswa</strong>.
            Anda saat ini login sebagai <strong>{session.role === "guru" ? "guru" : session.role}</strong>.
          </p>
          <div className="space-y-3">
            <Link
              href="/siswa/beranda"
              className="block w-full py-2.5 px-4 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Masuk sebagai Siswa
            </Link>
            <a
              href={`/masuk?portal=siswa&redirect=${encodeURIComponent(`/undang?token=${token}`)}`}
              className="block w-full py-2.5 px-4 border border-border-precision rounded-xl font-semibold text-sm text-on-surface hover:bg-surface transition-colors"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              Ganti Akun
            </a>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-4">
            Atau bagikan link ini langsung ke siswa Anda.
          </p>
        </div>
      </div>
    );
  }

  let payload: InvitePayload;
  try {
    const verified = await jwtVerify<InvitePayload>(token, hs256Secret(), { algorithms: ["HS256"] });
    payload = verified.payload;
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      redirect("/masuk?portal=siswa&error=invite_expired");
    }
    redirect("/masuk?portal=siswa&error=invite_invalid");
  }

  if (payload.action !== "enroll") {
    redirect("/masuk?portal=siswa&error=invite_invalid");
  }

  const [k] = await db
    .select({ id: kursus.id, slug: kursus.slug, guruId: kursus.guruId, statusPublikasi: kursus.statusPublikasi })
    .from(kursus)
    .where(eq(kursus.id, payload.kursusId))
    .limit(1);

  if (!k) {
    redirect("/siswa/beranda?error=kursus_not_found");
  }

  if (k.statusPublikasi !== "PUBLIK") {
    redirect(`/siswa/beranda?error=kursus_belum_publikasi&judul=${encodeURIComponent(k.slug)}`);
  }

  if (k.guruId !== payload.guruId) {
    redirect("/siswa/beranda?error=invite_kursus_dialihkan");
  }

  const existing = await db
    .select({ id: siswaKursus.id })
    .from(siswaKursus)
    .where(and(eq(siswaKursus.siswaId, session.userId), eq(siswaKursus.kursusId, k.id)))
    .limit(1);

  if (existing.length === 0) {
    try {
      await db.insert(siswaKursus).values({
        siswaId: session.userId,
        kursusId: k.id,
        status: "AKTIF",
      });
    } catch (e: unknown) {
      const pgErr = e as { code?: string };
      if (pgErr.code === "23505") {
        redirect(`/siswa/materi?kursusId=${k.id}&welcome=1`);
      }
      throw e;
    }
  }

  redirect(`/siswa/materi?kursusId=${k.id}&welcome=1`);
}