"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-3 bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-[140px] sm:text-[180px] font-heading font-bold leading-none text-primary/10 select-none"
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-heading text-3xl font-bold text-on-surface mt-2"
        >
          Halaman tidak ditemukan
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-on-surface-variant mt-3 leading-relaxed"
        >
          Sepertinya Anda tersesat. Halaman yang Anda cari mungkin sudah dipindahkan,
          dihapus, atau tidak pernah ada.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-on-primary font-semibold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/kursus"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border-precision bg-glass text-primary font-semibold text-sm transition-colors hover:bg-primary/5"
          >
            <BookOpen className="w-4 h-4" />
            Katalog Kursus
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xs text-on-surface-variant/60 mt-6"
        >
          Butuh bantuan?{" "}
          <Link href="/tentang" className="text-primary hover:underline">
            Hubungi kami
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}