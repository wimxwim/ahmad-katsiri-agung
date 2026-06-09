"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

const ALL_MATERI = [
  { slug: "beriman-kepada-malaikat", title: "Beriman kepada Malaikat", kelas: 7, bab: 1, ringkasan: "Mengenal malaikat Allah dan tugas-tugasnya sebagai rukun iman.", subTopik: 6, icon: "🪽" },
  { slug: "membiasakan-tabayyun-menjauhi-ghibah", title: "Membiasakan Tabayyun, Menjauhi Ghibah", kelas: 7, bab: 2, ringkasan: "Belajar memverifikasi informasi dan menjaga lisan dari ghibah di era digital.", subTopik: 5, icon: "🔍" },
  { slug: "salat-mencegah-perbuatan-keji-dan-mungkar", title: "Salat Mencegah Perbuatan Keji", kelas: 7, bab: 3, ringkasan: "Memahami hikmah salat sebagai benteng dari perbuatan keji dan mungkar.", subTopik: 7, icon: "🕌" },
  { slug: "amanah-dan-jujur", title: "Amanah dan Jujur", kelas: 8, bab: 1, ringkasan: "Meneladani sifat amanah dan jujur dalam kehidupan sehari-hari.", subTopik: 8, icon: "🤝" },
  { slug: "beriman-kepada-kitab-allah", title: "Beriman kepada Kitab Allah", kelas: 8, bab: 2, ringkasan: "Meyakini kitab-kitab Allah sebagai pedoman hidup umat manusia.", subTopik: 6, icon: "📖" },
  { slug: "beriman-kepada-nabi-dan-rasul", title: "Beriman kepada Nabi dan Rasul", kelas: 8, bab: 3, ringkasan: "Meneladani kisah para nabi dan rasul dalam menyampaikan risalah.", subTopik: 12, icon: "🌟" },
  { slug: "adab-dalam-islam", title: "Adab dalam Islam", kelas: 9, bab: 1, ringkasan: "Menerapkan adab-adab mulia dalam pergaulan sehari-hari sesuai tuntunan Islam.", subTopik: 10, icon: "🌿" },
  { slug: "beriman-kepada-hari-akhir", title: "Beriman kepada Hari Akhir", kelas: 9, bab: 2, ringkasan: "Memahami tanda-tanda dan peristiwa hari akhir sebagai penguat iman.", subTopik: 7, icon: "☀️" },
  { slug: "beriman-kepada-qada-dan-qadar", title: "Beriman kepada Qada dan Qadar", kelas: 9, bab: 3, ringkasan: "Meyakini takdir Allah sebagai motivasi untuk terus berusaha dan berdoa.", subTopik: 5, icon: "✨" },
];

const KELAS = [7, 8, 9] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function MateriPage() {
  const [filterKelas, setFilterKelas] = useState<number | null>(null);

  const filtered = filterKelas
    ? ALL_MATERI.filter((m) => m.kelas === filterKelas)
    : ALL_MATERI;

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-16 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Kurikulum Merdeka
        </div>

        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-tighter text-on-surface mb-4">
          Eksplorasi{" "}
          <span className="text-primary italic font-semibold">Materi Akidah Akhlak</span>
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
          Pelajari Akidah Akhlak dengan pendekatan Deep Learning untuk SMP/MTs
          Kelas 7, 8, dan 9.
        </p>
      </motion.div>

      <div className="flex justify-center mb-16">
        <div className="inline-flex items-center p-1.5 rounded-full bg-glass backdrop-blur-md border border-border-precision shadow-glass">
          <button
            onClick={() => setFilterKelas(null)}
            className={`px-6 md:px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
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
              className={`px-6 md:px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {filtered.map((materi) => (
          <motion.div
            key={materi.slug}
            variants={cardVariants}
          >
            <Link
              href={`/materi/${materi.slug}`}
              className="group block h-full bg-glass backdrop-blur-2xl border border-border-precision rounded-[32px] p-8 shadow-glass hover:shadow-2xl hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 via-surface to-primary/5 border border-white/40 mb-6 flex items-center justify-center overflow-hidden">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-700">
                  {materi.icon}
                </span>
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-4">
                KELAS {materi.kelas} — BAB {materi.bab}
              </div>

              <h3 className="font-heading text-xl md:text-2xl text-text-primary mb-3 leading-tight">
                {materi.title}
              </h3>

              <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-6">
                {materi.ringkasan}
              </p>

              <div className="flex items-center justify-between pt-5 border-t border-primary/5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary/60" aria-hidden="true" />
                  <span className="text-xs text-on-surface-variant">
                    {materi.subTopik} Sub-topik
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Pelajari
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-on-surface-variant">Belum ada materi untuk kelas ini.</p>
        </div>
      )}
    </div>
  );
}
