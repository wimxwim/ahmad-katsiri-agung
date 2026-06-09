"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { BookOpen, Gamepad2, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative max-w-[1280px] mx-auto px-4 md:px-8 mt-24 md:mt-40">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
    >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Deep Learning PAI Platform
          </div>

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tighter leading-none text-on-surface mb-6">
            Menjadi Pribadi Berintegritas dengan Sifat{" "}
            <span className="shimmer-text">Amanah</span> dan{" "}
            <span className="shimmer-text">Jujur</span>
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-xl mb-10">
            Menanamkan nilai-nilai luhur Islam melalui pengalaman belajar digital
            yang interaktif, menyenangkan, dan bermakna untuk generasi masa depan.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/materi"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-2xl font-semibold shadow-2xl shadow-primary/20 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Mulai Belajar
            </Link>
            <Link
              href="/materi"
              className="inline-flex items-center gap-2 bg-glass backdrop-blur-md border border-glass-stroke text-primary px-8 py-4 rounded-2xl font-semibold hover:bg-white/60 active:scale-[0.98] transition-all duration-300"
            >
              Jelajahi Materi
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              href="/game"
              className="inline-flex items-center gap-2 bg-tertiary-container text-on-tertiary px-8 py-4 rounded-2xl font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
            >
              <Gamepad2 className="w-5 h-5" aria-hidden="true" />
              Mainkan Game
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
          className="relative"
        >
          <div className="absolute -inset-10 bg-primary/5 blur-[120px] rounded-full" />

          <div className="relative bg-glass backdrop-blur-2xl border border-border-precision p-4 rounded-[48px] shadow-glass-lg">
            <div className="aspect-[4/3] rounded-[40px] bg-gradient-to-br from-primary/10 via-surface to-primary/5 flex items-center justify-center overflow-hidden">
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-primary" aria-hidden="true" />
                </div>
                <p className="font-heading text-lg text-on-surface-variant">
                  Ilustrasi Pembelajaran
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 left-6 right-6 bg-glass backdrop-blur-2xl border border-border-precision px-6 py-5 rounded-2xl shadow-glass">
            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">
              Materi Terpopuler
            </p>
            <div className="flex items-center justify-between">
              <p className="font-heading font-semibold text-sm text-on-surface">
                Kejujuran dalam Digital
              </p>
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-primary" aria-hidden="true" />
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
