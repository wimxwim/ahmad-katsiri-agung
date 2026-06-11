"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { BookOpen, Gamepad2, GraduationCap, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 mt-20 sm:mt-24 md:mt-40">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
    >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            AKAL Center — Deep Learning Akidah Akhlak
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-6xl xl:text-7xl tracking-tighter leading-none text-on-surface mb-6">
            <span className="shimmer-text">Model Pembelajaran</span>{" "}
            Aqidah Akhlaq berbasis{" "}
            <span className="shimmer-text">Deep Learning</span>
          </h1>

          <p className="text-sm sm:text-base md:text-xl text-on-surface-variant leading-relaxed max-w-xl mb-8 sm:mb-10">
            Pembelajaran yang sadar (mindful), bermakna (meaningful), dan
            menyenangkan (joyful) untuk mendalami nilai-nilai Aqidah Akhlaq
            tingkat SMP/MTs.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/materi"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-2xl shadow-primary/20 hover:-translate-y-1 active:scale-[0.98] transition-transform duration-300"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Mulai Belajar
            </Link>
            <Link
              href="/materi"
              className="inline-flex items-center gap-2 bg-glass backdrop-blur-md border border-glass-stroke text-primary px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:bg-white/60 active:scale-[0.98] transition-transform duration-300"
            >
              Jelajahi Materi
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              href="/game"
              className="inline-flex items-center gap-2 bg-tertiary-container text-on-tertiary px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:brightness-110 active:scale-[0.98] transition-transform duration-300"
            >
              <Gamepad2 className="w-5 h-5" aria-hidden="true" />
              Mainkan Game
            </Link>
            <Link
              href="/evaluasi"
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:bg-primary/20 active:scale-[0.98] transition-transform duration-300"
            >
              <GraduationCap className="w-5 h-5" aria-hidden="true" />
              Masuk Kuis Siswa
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative"
        >
          <div className="absolute -inset-10 bg-primary/5 blur-[60px] rounded-full" />

          <div className="relative bg-glass backdrop-blur-2xl border border-border-precision p-3 sm:p-4 rounded-[32px] sm:rounded-[48px] shadow-glass-lg">
            <div className="min-h-[280px] sm:min-h-[340px] rounded-[40px] overflow-hidden">
              <img
                src="/images/beranda/hero-illustration.png"
                alt="AKAL Center — Deep Learning Akidah Akhlak"
                width={800}
                height={533}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <Link
            href="/materi/amanah-dan-jujur"
            className="mt-4 bg-glass backdrop-blur-2xl border border-border-precision px-6 py-5 rounded-2xl shadow-glass hover:shadow-lg transition-all duration-300 group/card block"
          >
            <p className="text-xs text-primary/60 font-bold uppercase tracking-widest mb-1">
              Materi Terpopuler
            </p>
            <div className="flex items-center justify-between">
              <p className="font-heading font-semibold text-base text-on-surface">
                Kejujuran dalam Digital
              </p>
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/card:bg-primary/20 transition-colors">
                <ArrowRight className="w-4 h-4 text-primary" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
