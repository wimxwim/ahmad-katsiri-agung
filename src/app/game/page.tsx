"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Gamepad2, ArrowRight } from "lucide-react";

export default function GamePage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-40 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Gamepad2 className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-6">
          SEGERA HADIR
        </span>

        <h1 className="font-heading text-5xl md:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Game Edukasi Interaktif
        </h1>

        <p className="text-lg text-on-surface-variant leading-relaxed mb-10">
          Kami sedang mengembangkan pengalaman belajar berbasis game yang seru
          dan mendidik. Nantikan petualangan belajar PAI yang penuh tantangan!
        </p>

        <Link
          href="/materi"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
        >
          Jelajahi Materi Dulu
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  );
}
