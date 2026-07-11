import { redirect } from "next/navigation";
import { jwtVerify, errors } from "jose";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { hs256Secret } from "@/lib/auth-keys";
import { db } from "@/lib/db";
import { siswaKursus, kursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

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
    redirect("/masuk?portal=siswa&error=role_mismatch");
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
    .select({ id: kursus.id, slug: kursus.slug })
    .from(kursus)
    .where(eq(kursus.id, payload.kursusId))
    .limit(1);

  if (!k) {
    redirect("/siswa/beranda?error=kursus_not_found");
  }

  const existing = await db
    .select({ id: siswaKursus.id })
    .from(siswaKursus)
    .where(and(eq(siswaKursus.siswaId, session.userId), eq(siswaKursus.kursusId, k.id)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(siswaKursus).values({
      siswaId: session.userId,
      kursusId: k.id,
      status: "AKTIF",
    });
  }

  redirect(`/siswa/materi?kursusId=${k.id}&welcome=1`);
}