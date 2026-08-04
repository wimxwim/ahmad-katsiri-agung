"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Loader2, AlertCircle, ClipboardList, FileText } from "lucide-react";
import { MateriRenderer } from "@/components/siswa/MateriRenderer";
import { csrfHeaders } from "@/lib/csrf";

interface MateriDetail {
  id: string;
  judul: string;
  konten: string;
  ringkasan: string | null;
  publishedAt: string;
  nextId: string | null;
  quizId: string | null;
  quizJudul: string | null;
  soalBatchId: string | null;
  soalBatchTotal: number | null;
}

export default function SiswaMateriPage() {
  const params = useParams();
  const id = params?.id as string;
  const [materi, setMateri] = useState<MateriDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);
  const [done, setDone] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/siswa/materi/${id}`, { credentials: "include" })
      .then(async (r) => {
        const j = await r.json();
        if (r.ok) return j;
        return { error: j };
      })
      .then((j) => {
        if (j.error) {
          setError(j.error?.error || j.error?.message || "Gagal memuat");
        } else {
          setMateri(j.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat");
        setLoading(false);
      });
  }, [id]);

  async function markSelesai() {
    if (!id) return;
    setMarking(true);
    try {
      const res = await fetch(`/api/v1/siswa/materi/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify({ progress: 100, selesai: true }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Gagal menandai selesai");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menandai selesai");
      setShowConfirm(false);
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return <div className="bg-glass rounded-2xl p-8 h-64 animate-pulse" />;
  }

  if (error || !materi) {
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-8 shadow-glass text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-heading font-semibold text-on-surface mb-2">Tidak dapat membuka materi</h3>
        <p className="text-sm text-on-surface-variant mb-4">{error || "Materi tidak ditemukan"}</p>
        <Link
          href="/siswa/materi"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold"
        >
          Kembali ke Materi
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/siswa/materi"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Materi
      </Link>

      <article className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-8 shadow-glass-lg">
        <div className="flex items-start gap-3 mb-4">
          <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-2xl text-on-surface">
              {materi.judul}
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Diterbitkan {new Date(materi.publishedAt).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        <MateriRenderer konten={materi.konten} />

        {/* Quiz & Soal Links — always visible */}
        {(materi.quizId || materi.soalBatchId) && (
          <div className="mt-8 pt-6 border-t border-border-precision/40">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              Lanjutkan Belajar
            </p>
            <div className="flex flex-wrap gap-3">
              {materi.quizId && (
                <Link
                  href={`/siswa/cbt/${materi.quizId}?dariMateri=${materi.id}${materi.nextId ? `&nextMateri=${materi.nextId}` : ''}`}
                  className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <ClipboardList className="w-4 h-4" />
                  Kerjakan Quiz
                </Link>
              )}
              {materi.soalBatchId && (
                <Link
                  href={`/siswa/soal/${materi.soalBatchId}`}
                  className="inline-flex items-center gap-2 bg-tertiary text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Soal Latihan{materi.soalBatchTotal ? ` (${materi.soalBatchTotal})` : ""}
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border-precision/40">
          {done ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-300 bg-emerald-50/40 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Materi ditandai selesai</p>
                  <p className="text-sm">Progresmu sudah tersimpan. Lanjutkan ke materi berikutnya atau kerjakan quiz di atas.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {materi.nextId ? (
                  <Link
                    href={`/siswa/materi/${materi.nextId}`}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    Materi Selanjutnya
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/siswa/materi"
                    className="inline-flex items-center gap-2 border border-border-precision text-on-surface-variant px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-surface active:scale-[0.98] transition-all"
                  >
                    Lihat semua materi
                  </Link>
                )}
              </div>
            </div>
          ) : showConfirm ? (
            <div className="flex items-center gap-3">
              <button
                onClick={markSelesai}
                disabled={marking}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Ya, Tandai Selesai
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="inline-flex items-center gap-2 bg-white text-on-surface-variant border border-border-precision px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-surface active:scale-[0.98] transition-all"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tandai Selesai
            </button>
          )}
        </div>
      </article>

    </div>
  );
}
