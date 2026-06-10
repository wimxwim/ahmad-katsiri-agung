"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Share2, Play, Pause, BookOpen, PenLine, ArrowRight } from "lucide-react";

const WORD_DATA = [
  { arab: "أَوْفُوا۟", latin: "Awfu", arti: "Penuhilah", color: "border-l-tertiary" },
  { arab: "ٱلْعَهْدِ", latin: "Al-Ahd", arti: "Janji", color: "border-l-primary" },
  { arab: "مَسْـُٔولًا", latin: "Mas'ula", arti: "Pertanggungjawaban", color: "border-l-secondary col-span-2" },
];

export default function AnalisisDalilPage() {
  const [playing, setPlaying] = useState(false);
  const [refleksi, setRefleksi] = useState("");

  return (
    <div className="max-w-[480px] mx-auto px-3 sm:px-4 md:px-6 pt-20 pb-24 sm:pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
        className="sticky top-0 z-40 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-4 backdrop-blur-md bg-surface/60 flex items-center justify-between mb-6"
      >
        <Link
          href="/materi/amanah-dan-jujur"
          className="w-10 h-10 rounded-full bg-glass border border-border-precision flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        <h1 className="font-heading text-sm font-bold text-primary">QS. Al-Isra&apos;: 34</h1>
        <button className="w-10 h-10 rounded-full bg-glass border border-border-precision flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
          <Share2 className="w-5 h-5" aria-hidden="true" />
        </button>
      </motion.div>

      <div className="space-y-8">
        {/* Hero Verse Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="bg-glass backdrop-blur-2xl border border-border-precision p-5 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-glass relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      <div className="space-y-6 sm:space-y-8">
              <p className="font-quran text-2xl sm:text-3xl md:text-4xl leading-[2.2] text-primary-container text-right" dir="rtl">
                ...وَأَوْفُوا۟ بِٱلْعَهْدِ ۖ إِنَّ ٱلْعَهْدَ كَانَ مَسْـُٔولًا
              </p>
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-tertiary-fixed-dim/20 text-tertiary text-[10px] font-bold tracking-[0.2em] uppercase">
                  Terjemahan
                </span>
                <p className="text-base text-on-surface-variant italic">
                  &ldquo;...dan penuhilah janji; sesungguhnya janji itu pasti diminta pertanggungjawabannya.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Audio Player */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="bg-glass backdrop-blur-2xl border border-border-precision p-5 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-glass flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setPlaying(!playing)}
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
            >
              {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
                  Murattal Audio
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant">
                  {playing ? "Memutar..." : "0:00 / 0:45"}
                </span>
              </div>
              <div className="flex items-end gap-1 h-8">
                {[12, 20, 32, 24, 16, 28, 20, 12, 24, 16, 28, 8].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full transition-all duration-200"
                    style={{
                      height: `${h}px`,
                      backgroundColor: playing ? "#005231" : "rgba(0, 82, 49, 0.2)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Word-by-Word Analysis */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <h2 className="font-heading text-xl text-on-surface">Makna Kata</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {WORD_DATA.map((w) => (
              <div
                key={w.arab}
                className={`bg-glass backdrop-blur-2xl border border-border-precision p-4 rounded-2xl flex flex-col items-center text-center space-y-2 border-l-4 ${w.color} ${w.arti === "Pertanggungjawaban" ? "col-span-2" : ""}`}
              >
                <span className="font-quran text-xl text-primary">{w.arab}</span>
                <span className="text-[10px] font-bold tracking-wider text-on-surface">{w.latin}</span>
                <span className="text-[10px] text-on-surface-variant">{w.arti}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Tafsir */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="bg-glass backdrop-blur-2xl border border-border-precision p-5 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-glass space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="font-heading text-xl text-on-surface">Tafsir Singkat</h2>
            </div>
            <p className="text-base text-on-surface-variant leading-relaxed">
              Ayat ini menekankan pentingnya <strong className="text-primary">Integritas</strong> dan{" "}
              <strong className="text-primary">Amanah</strong>. Janji bukan sekadar kata-kata, melainkan
              hutang moral yang disaksikan oleh Allah SWT. Menepati janji adalah ciri utama orang beriman
              yang akan membawa ketenangan sosial dan kemuliaan di akhirat.
            </p>
          </div>
        </motion.section>

        {/* Reflection Journal */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="bg-gradient-to-br from-primary to-primary-container p-[1px] rounded-2xl sm:rounded-[24px]">
            <div className="bg-white/90 backdrop-blur-xl p-5 sm:p-6 rounded-2xl sm:rounded-[23px] space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-tertiary-fixed-dim/20 text-tertiary text-[10px] font-bold tracking-[0.2em] uppercase">
                  Refleksi Diri
                </span>
                <h3 className="font-heading text-xl text-on-surface">
                  Bagaimana kamu menjaga janjimu hari ini?
                </h3>
              </div>
              <div className="relative">
                <textarea
                  value={refleksi}
                  onChange={(e) => setRefleksi(e.target.value)}
                  placeholder="Tuliskan komitmen atau refleksi singkatmu..."
                  className="w-full bg-surface/50 border border-border-precision rounded-2xl p-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none min-h-[120px] placeholder:text-on-surface-variant/50"
                />
              </div>
              <button className="w-full py-4 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2">
                <PenLine className="w-4 h-4" aria-hidden="true" />
                Simpan Jurnal Refleksi
              </button>
            </div>
          </div>
        </motion.section>

        {/* Next Step */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="text-center"
        >
          <Link
            href="/materi/amanah-dan-jujur"
            className="inline-flex items-center gap-3 px-8 py-5 bg-white border border-border-precision rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 group"
          >
            <span className="text-sm font-semibold text-primary">Lanjut Belajar Materi Amanah & Jujur</span>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
