"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { csrfHeaders } from "@/lib/csrf";
import { useToast } from "@/components/ui/Toast";

interface Soal {
  id: string;
  pertanyaan: string;
  tipe: "PG" | "ISIAN" | "ESSAY";
  pilihanGanda: Record<string, string> | null;
  poin: number;
}

interface QuizDetail {
  id: string;
  judul: string;
  modeEvaluasi: "BELAJAR" | "ULANGAN" | "CBT";
  durasiMenit: number;
  soal: Soal[];
}

interface SubmitResult {
  attemptId: string;
  nilai: number;
  jumlahBenar: number;
  jumlahSalah: number;
  totalSoal: number;
  mode: string;
  tampilkanNilai: boolean;
  ringkasan: string;
}

export default function SiswaCBTPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [startedAt, setStartedAt] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/siswa/quiz/${id}`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setQuiz(j.data);
        setStartedAt(Date.now());
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, [id]);

  function setAnswer(soalId: string, value: string) {
    setJawaban((prev) => ({ ...prev, [soalId]: value }));
  }

  async function submit() {
    if (!quiz) return;
    setSubmitting(true);
    setError("");
    const durasiDetik = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    try {
      const res = await fetch(`/api/v1/siswa/quiz/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify({ durasiDetik, jawaban }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Gagal submit");
      setResult(j.data);
      toast("success", "Jawaban berhasil dikirim!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal submit");
      toast("error", e instanceof Error ? e.message : "Gagal mengirim jawaban");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="bg-glass rounded-2xl p-8 h-64 animate-pulse" />;
  }

  if (error || !quiz) {
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-8 shadow-glass text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-sm text-red-700 mb-4">{error || "Kuis tidak ditemukan"}</p>
        <Link
          href="/siswa/quiz"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold"
        >
          Kembali ke Daftar Kuis
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div>
        <Link
          href="/siswa/quiz"
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar kuis
        </Link>
        <div className="bg-glass border-2 border-emerald-300 rounded-[32px] p-8 sm:p-10 shadow-glass-lg text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center mx-auto mb-4">
            {result.tampilkanNilai ? (
              <CheckCircle2 className="w-9 h-9" />
            ) : (
              <Clock className="w-9 h-9" />
            )}
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">
            {result.tampilkanNilai ? "✅ Kuis Selesai" : "✅ Jawaban sudah terkirim"}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
            {result.ringkasan}
          </p>

          {result.tampilkanNilai && (
            <div className="mt-6 grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="p-4 rounded-2xl bg-white border border-border-precision">
                <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">NILAI</p>
                <p className="font-heading text-3xl font-bold text-primary mt-1">{result.nilai}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-border-precision">
                <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">BENAR</p>
                <p className="font-heading text-3xl font-bold text-emerald-700 mt-1">
                  {result.jumlahBenar}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-border-precision">
                <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">SALAH</p>
                <p className="font-heading text-3xl font-bold text-red-600 mt-1">
                  {result.jumlahSalah}
                </p>
              </div>
            </div>
          )}

          {!result.tampilkanNilai && (
            <p className="mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
              ⏳ Nilai diumumkan oleh guru. Cek lagi nanti atau hubungi guru.
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/siswa/quiz"
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110"
            >
              Kembali ke Daftar Kuis
            </Link>
            <Link
              href="/siswa/progres"
              className="inline-flex items-center gap-2 bg-white text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/5"
            >
              Lihat Progres
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const answered = Object.keys(jawaban).filter((k) => jawaban[k]?.trim()).length;
  const total = quiz.soal.length;
  const durasiDetik = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const menit = Math.floor(durasiDetik / 60);
  const detik = durasiDetik % 60;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <Link
            href="/siswa/quiz"
            className="inline-flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Kembali
          </Link>
          <h1 className="font-heading font-bold text-xl text-on-surface">{quiz.judul}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold tracking-wider bg-surface text-on-surface-variant px-2 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {menit}:{detik.toString().padStart(2, "0")} / {quiz.durasiMenit}:00
          </span>
          <span className="text-[10px] font-bold tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full">
            {answered}/{total} terjawab
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {quiz.soal.map((s, i) => (
          <div
            key={s.id}
            className="bg-glass border border-border-precision rounded-2xl p-5 shadow-glass"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold grid place-items-center shrink-0">
                {i + 1}
              </span>
              <p className="text-sm font-medium text-on-surface flex-1">{s.pertanyaan}</p>
            </div>
            {s.tipe === "PG" && s.pilihanGanda && (
              <div className="space-y-2 ml-10">
                {Object.entries(s.pilihanGanda).map(([key, val]) => (
                  <label
                    key={key}
                    className="flex items-start gap-2 p-3 rounded-xl border border-border-precision/40 cursor-pointer hover:border-primary/40 hover:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name={s.id}
                      value={key}
                      checked={jawaban[s.id] === key}
                      onChange={() => setAnswer(s.id, key)}
                      className="mt-1"
                    />
                    <span className="text-sm text-on-surface">
                      <b className="mr-1">{key}.</b> {val}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {s.tipe === "ISIAN" && (
              <input
                type="text"
                value={jawaban[s.id] || ""}
                onChange={(e) => setAnswer(s.id, e.target.value)}
                placeholder="Ketik jawaban..."
                className="w-full ml-10 max-w-md px-3 py-2 rounded-lg border border-border-precision text-sm outline-hidden focus:border-primary/40"
              />
            )}
            {s.tipe === "ESSAY" && (
              <textarea
                value={jawaban[s.id] || ""}
                onChange={(e) => setAnswer(s.id, e.target.value)}
                placeholder="Ketik jawaban essay..."
                rows={4}
                className="w-full ml-10 px-3 py-2 rounded-lg border border-border-precision text-sm outline-hidden focus:border-primary/40"
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 p-4 rounded-2xl border border-border-precision bg-white/60 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-on-surface-variant">
          {answered}/{total} soal sudah dijawab
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/siswa/quiz")}
            className="px-4 py-2 rounded-full text-sm font-semibold border border-border-precision text-on-surface-variant hover:bg-surface"
          >
            Batal
          </button>
          <button
            onClick={submit}
            disabled={submitting || answered === 0}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Submit Jawaban
          </button>
        </div>
      </div>
    </div>
  );
}
