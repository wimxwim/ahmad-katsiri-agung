import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { db } from "@/lib/db";
import { aiGeneration, kursus } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, BookOpen, ClipboardList, ListChecks, FileText } from "lucide-react";
import DiskusiGuru from "@/components/guru/DiskusiGuru";

export const metadata = {
  title: "Draft siap diterbitkan — AKAL Center",
  robots: { index: false, follow: false },
};

export default async function DraftPublishedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  const session = _ar && _ar.success ? _ar.data : null;
  if (!session || (session.role !== "guru" && session.role !== "owner")) {
    redirect("/masuk?portal=guru");
  }

  const [row] = await db
    .select()
    .from(aiGeneration)
    .where(and(eq(aiGeneration.id, id), eq(aiGeneration.guruId, session.userId!)))
    .limit(1);

  if (!row) {
    redirect("/guru/drafts");
  }
  if (row.status !== "approved" && !row.publishedMateriId) {
    redirect(`/guru/drafts/${id}`);
  }

  const [k] = row.kursusId
    ? await db.select().from(kursus).where(eq(kursus.id, row.kursusId)).limit(1)
    : [];

  const approvedCount = [
    row.materiStatus === "approved",
    row.quizStatus === "approved",
    row.soalStatus === "approved",
  ].filter(Boolean).length;

  return (
    <div>
      <Link
        href="/guru/drafts"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
      >
        ← Kembali ke daftar draft
      </Link>

      <div className="bg-glass border border-emerald-300 rounded-2xl p-8 sm:p-10 shadow-glass-lg text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">
          Draft Siap Dipakai
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-xl mx-auto">
          Anda sudah menutup siklus review untuk draft ini. Materi, kuis, dan/atau soal yang Anda
          setujui siap untuk diterbitkan ke siswa.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-white border border-border-precision">
            <p className="text-xs font-bold tracking-wider text-on-surface-variant">SUMBER</p>
            <p className="font-semibold text-on-surface text-sm mt-1 truncate flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {row.sourceFileName}
            </p>
            {k && (
              <p className="text-xs text-on-surface-variant mt-1">Kursus: {k.judul}</p>
            )}
          </div>
          <div className="p-4 rounded-2xl bg-white border border-border-precision">
            <p className="text-xs font-bold tracking-wider text-on-surface-variant">BAGIAN DISETUJUI</p>
            <p className="font-semibold text-on-surface text-2xl mt-1">
              {approvedCount}/3
            </p>
            <div className="flex gap-2 mt-1 text-xs font-bold tracking-wider">
              <span className={row.materiStatus === "approved" ? "text-emerald-700" : "text-on-surface-variant/40"}>
                MATERI
              </span>
              <span className={row.quizStatus === "approved" ? "text-emerald-700" : "text-on-surface-variant/40"}>
                KUIS
              </span>
              <span className={row.soalStatus === "approved" ? "text-emerald-700" : "text-on-surface-variant/40"}>
                SOAL
              </span>
            </div>
          </div>
        </div>

        {row.publishedAt && (
          <p className="mt-4 text-xs text-on-surface-variant">
            Disetujui pada {new Date(row.publishedAt).toLocaleString("id-ID")}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {row.materiStatus === "approved" && k && (
            <Link
              href={`/guru/kursus/${k.id}`}
              className="inline-flex items-center gap-2 bg-white text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/5"
            >
              <BookOpen className="w-4 h-4" />
              Lihat Materi di Kursus
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
          <Link
            href="/guru/drafts"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110"
          >
            <ListChecks className="w-4 h-4" />
            Kembali ke Daftar Draft
          </Link>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl border border-border-precision bg-white/60 text-sm text-on-surface-variant flex items-start gap-2">
        <ClipboardList className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <span>
          Untuk fase sekarang, hasil AI belum auto-terbit ke siswa. Guru bisa kembali ke{" "}
          <Link href="/guru/kursus" className="text-primary font-semibold hover:underline">
            daftar kursus
          </Link>{" "}
          untuk menerbitkan materi secara manual.
        </span>
      </div>

      {row.publishedMateriId && (
        <DiskusiGuru materiId={row.publishedMateriId} />
      )}
    </div>
  );
}
