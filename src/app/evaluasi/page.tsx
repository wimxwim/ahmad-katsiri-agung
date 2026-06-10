"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ClipboardList, GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import { SOAL_META, ALL_SOAL } from "@/data/soal";
import { QuizEngine } from "@/components/evaluasi/QuizEngine";
import Link from "next/link";

const KELAS = [7, 8, 9] as const;

export default function EvaluasiPage() {
  const [filterKelas, setFilterKelas] = useState<number | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  if (selectedSlug) {
    const bab = ALL_SOAL[selectedSlug];
    if (!bab) {
      return (
        <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 pb-24 sm:pb-32 text-center">
          <p className="text-on-surface-variant">Bab tidak ditemukan.</p>
          <button
            onClick={() => setSelectedSlug(null)}
            className="mt-4 text-primary font-semibold hover:underline"
          >
            Kembali
          </button>
        </div>
      );
    }
    return (
      <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 pb-24 sm:pb-32">
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/evaluasi"
              onClick={(e) => {
                e.preventDefault();
                setSelectedSlug(null);
              }}
              className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" aria-hidden="true" />
              Kembali
            </Link>
          </div>
        </div>
        <QuizEngine bab={bab} />
      </div>
    );
  }

  const filtered = filterKelas
    ? SOAL_META.filter((m) => m.kelas === filterKelas)
    : SOAL_META;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 pb-24 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-center mb-12 sm:mb-16"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <ClipboardList className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Kuis &{" "}
          <span className="text-primary italic font-semibold">Evaluasi</span>
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-xl mx-auto">
          Portal kuis untuk siswa Pak Aggung dan umum. Kerjakan soal pilihan
          ganda, catat nilai, dan pantau progres belajar.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 }}
        className="mb-12 sm:mb-16 max-w-2xl mx-auto bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-6 sm:p-8 shadow-glass"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-heading text-lg sm:text-xl text-on-surface font-semibold mb-2">
              Halo! Kerjakan kuis sesuai materimu
            </h2>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">1.</span>
                <span><strong className="text-on-surface">Pilih bab</strong> yang sudah dipelajari di kelas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">2.</span>
                <span>
                  <strong className="text-on-surface">Masuk sebagai siswa Pak Aggung</strong> pakai Nama + Tanggal Lahir
                  (nilai otomatis tercatat) atau <strong className="text-on-surface">Coba Latihan</strong> tanpa data diri
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">3.</span>
                <span><strong className="text-on-surface">Jawab 10 soal</strong> dan lihat skor + pembahasan</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-center mb-16 overflow-x-auto px-4 -mx-4">
        <div className="inline-flex items-center p-1.5 rounded-full bg-glass backdrop-blur-md border border-border-precision shadow-glass shrink-0">
          <button
            onClick={() => setFilterKelas(null)}
            className={`px-6 md:px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              filterKelas === null
                ? "bg-primary text-on-primary shadow-xl shadow-primary/20"
                : "text-on-surface-variant hover:bg-primary/5"
            }`}
          >
            Semua Kelas
          </button>
          {KELAS.map((k) => (
            <button
              key={k}
              onClick={() => setFilterKelas(k)}
              className={`px-6 md:px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                filterKelas === k
                  ? "bg-primary text-on-primary shadow-xl shadow-primary/20"
                  : "text-on-surface-variant hover:bg-primary/5"
              }`}
            >
              Kelas {k}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={filterKelas}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
      >
        {filtered.map((meta) => (
          <motion.div key={meta.slug} variants={cardVariants}>
            <button
              onClick={() => setSelectedSlug(meta.slug)}
              className="group block w-full text-left bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-6 lg:p-8 shadow-glass hover:shadow-2xl hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 via-surface to-primary/5 border border-white/40 mb-6 flex items-center justify-center overflow-hidden">
                <GraduationCap className="w-14 h-14 text-primary/60 group-hover:scale-110 transition-transform duration-700" aria-hidden="true" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-4">
                KELAS {meta.kelas} — {meta.jumlahSoal} SOAL
              </div>

              <h3 className="font-heading text-lg sm:text-xl lg:text-2xl text-on-surface mb-3 leading-tight">
                {meta.title}
              </h3>

              <div className="flex items-center justify-between pt-5 border-t border-primary/5 mt-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary/60" aria-hidden="true" />
                  <span className="text-xs text-on-surface-variant">
                    {meta.jumlahSoal} Soal PG
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Mulai Kuis
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-on-surface-variant">
            Belum ada soal untuk kelas ini.
          </p>
        </div>
      )}
    </div>
  );
}
