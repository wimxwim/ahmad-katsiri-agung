import { redirect } from "next/navigation";
import { jwtVerify, errors } from "jose";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { hs256Secret } from "@/lib/auth-keys";
import { db } from "@/lib/db";
import { siswaKursus, kursus, inviteTokens } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { AlertTriangle, LogOut } from "lucide-react";
import Link from "next/link";
import { sanitizeText } from "@/lib/sanitize";

interface InvitePayload {
  kursusId: string;
  guruId: string;
  action: string;
  jti?: string;
}

export default async function UndangPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  const kode = typeof params.kode === "string" ? params.kode : undefined;

  if (!token && !kode) {
    redirect("/masuk?portal=siswa&error=invite_missing");
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  // === KODE-BASED INVITE FLOW ===
  if (kode && !token) {
    // Look up kursus by kodeInvite
    const [kursusByKode] = await db
      .select({
        id: kursus.id,
        slug: kursus.slug,
        judul: kursus.judul,
        guruId: kursus.guruId,
        statusPublikasi: kursus.statusPublikasi,
        kodeInvite: kursus.kodeInvite,
        inviteExpiresAt: kursus.inviteExpiresAt,
      })
      .from(kursus)
      .where(eq(kursus.kodeInvite, kode))
      .limit(1);

    if (!kursusByKode) {
      redirect("/masuk?portal=siswa&error=invite_invalid");
    }

    // Check if invite expired
    if (kursusByKode.inviteExpiresAt && new Date(kursusByKode.inviteExpiresAt) < new Date()) {
      redirect("/masuk?portal=siswa&error=invite_expired");
    }

    // Check if kursus is accessible (PUBLIK or PRIVAT)
    if (kursusByKode.statusPublikasi !== "PUBLIK" && kursusByKode.statusPublikasi !== "PRIVAT") {
      redirect(`/masuk?portal=siswa&error=kursus_tidak_tersedia`);
    }

    // Check auth
    if (!sessionCookie?.value) {
      const returnUrl = encodeURIComponent(`/undang?kode=${kode}`);
      redirect(`/masuk?portal=siswa&redirect=${returnUrl}`);
    }

    const sessionResult = await verifySession(sessionCookie.value);
    if (!sessionResult.success) {
      const returnUrl = encodeURIComponent(`/undang?kode=${kode}`);
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
            <p className="text-on-surface-variant mb-2 leading-relaxed">
              Anda diundang ke kursus <strong>{sanitizeText(kursusByKode.judul || 'Kursus')}</strong>.
            </p>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              Link undangan ini hanya bisa digunakan oleh akun <strong>siswa</strong>.
              Anda saat ini login sebagai <strong>{session.role === "guru" ? "guru" : session.role}</strong>.
            </p>
            <div className="space-y-3">
              <a
                href={`/masuk?portal=siswa&redirect=${encodeURIComponent(`/undang?kode=${kode}`)}`}
                className="block w-full py-2.5 px-4 border border-border-precision rounded-xl font-semibold text-sm text-on-surface hover:bg-surface transition-colors"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Ganti Akun
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Enroll student
    const existing = await db
      .select({ id: siswaKursus.id })
      .from(siswaKursus)
      .where(and(eq(siswaKursus.siswaId, session.userId), eq(siswaKursus.kursusId, kursusByKode.id)))
      .limit(1);

    if (existing.length === 0) {
      try {
        await db.insert(siswaKursus).values({
          siswaId: session.userId,
          kursusId: kursusByKode.id,
          status: "AKTIF",
        });
      } catch (e: unknown) {
        const pgErr = e as { code?: string };
        if (pgErr.code === "23505") {
          redirect(`/siswa/materi?kursusId=${kursusByKode.id}&welcome=1`);
        }
        throw e;
      }
    }

    redirect(`/siswa/materi?kursusId=${kursusByKode.id}&welcome=1`);
  }

  // === JWT TOKEN FLOW ===
  if (token) {
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

    if (k.statusPublikasi !== "PUBLIK" && k.statusPublikasi !== "PRIVAT") {
      redirect(`/siswa/beranda?error=kursus_belum_publikasi&judul=${encodeURIComponent(k.slug)}`);
    }

    if (k.guruId !== payload.guruId) {
      redirect("/siswa/beranda?error=invite_kursus_dialihkan");
    }

    const [inviteRow] = await db
      .select({ id: inviteTokens.id })
      .from(inviteTokens)
      .where(eq(inviteTokens.jti, payload.jti!))
      .limit(1);

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
          inviteTokenId: inviteRow?.id ?? null,
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
}