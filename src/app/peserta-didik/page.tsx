"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function PesertaDidikPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 md:pt-40 pb-16 md:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden mx-auto mb-8 bg-primary/5">
          <img
            src="/images/peserta-didik/portal-coming-soon.png"
            alt="Portal Peserta Didik"
            className="w-full h-full object-cover"
          />
        </div>

        <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold tracking-wider mb-6">
          SEGERA HADIR
        </span>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Portal Peserta Didik
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-on-surface-variant leading-relaxed mb-10">
          Fitur personal untuk siswa sedang dalam pengembangan. Nantikan dashboard
          belajar pribadi, pelacakan progress, badge pencapaian, dan forum diskusi
          yang seru!
        </p>

        <Link
          href="/materi"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
        >
          Mulai Belajar dari Materi
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  );
}
