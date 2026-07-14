"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { ClipboardList, Clock, AlertCircle, RefreshCw, ArrowRight, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

interface QuizItem {
  id: string;
  judul: string;
  modeEvaluasi: string;
  durasiMenit: number;
  totalSoal: number;
  sudahDikerjakan: boolean;
  nilaiTerbaik: number | null;
  publishedAt: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_CURVE },
  },
};

function modeBadge(mode: string, sudah: boolean) {
  if (sudah) {
    return (
      <span className="text-xs font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
        SELESAI
      </span>
    );
  }

  switch (mode) {
    case "CBT":
      return (
        <span className="text-xs font-bold tracking-wider text-tertiary bg-tertiary/10 px-2.5 py-1 rounded-full">
          CBT
        </span>
      );
    case "ULANGAN":
      return (
        <span className="text-xs font-bold tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
          ULANGAN
        </span>
      );
    case "BELAJAR":
      return (
        <span className="text-xs font-bold tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
          BELAJAR
        </span>
      );
    default:
      return null;
  }
}

export default function SiswaQuizListPage() {
  const [data, setData] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/v1/siswa/quiz", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setData(j.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <SkeletonList />;
  }

  if (error) {
    return (
      <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-6 sm:p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {loading ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Memuat...</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> Coba Lagi</>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface">
              Kuis & Evaluasi
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Uji pemahamanmu dari materi yang sudah dipelajari
            </p>
          </div>
        </div>
      </motion.div>

      {/* Guide Box */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE, delay: 0.1 }}
        className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-glass mb-6 sm:mb-8"
      >
        <p className="font-heading font-semibold text-sm text-on-surface mb-3">
          Cara mengerjakan kuis
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">Pilih kuis</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Pilih kuis yang ingin kamu kerjakan dari daftar di bawah
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">Kerjakan soal</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Jawab semua soal sesuai waktu yang tersedia
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">Lihat skor</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Nilai akan tampil setelah selesai mengerjakan
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada quiz"
          description="Gurumu belum menerbitkan quiz. Kerjakan materi terlebih dahulu ya."
          action={{ label: "Lihat Materi", href: "/siswa/materi" }}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {data.map((q) => (
            <motion.div key={q.id} variants={item}>
              <Link
                href={`/siswa/cbt/${q.id}`}
                className="group block bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-glass hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 h-full"
              >
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center p-6 mb-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                  <p className="font-heading text-lg sm:text-xl text-white text-center leading-snug relative">
                    {q.judul}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {modeBadge(q.modeEvaluasi, q.sudahDikerjakan)}
                  {q.sudahDikerjakan && q.nilaiTerbaik != null && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Nilai {q.nilaiTerbaik}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {q.durasiMenit} menit
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {q.totalSoal} soal
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-precision">
                  <span className="text-xs font-semibold text-on-surface-variant">
                    {q.sudahDikerjakan ? "Sudah dikerjakan" : "Belum dikerjakan"}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all">
                    {q.sudahDikerjakan ? "Lihat" : "Mulai"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}