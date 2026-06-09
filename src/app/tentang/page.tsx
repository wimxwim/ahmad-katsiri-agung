"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { BookHeart, ArrowRight } from "lucide-react";

export default function TentangPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-40 pb-32">
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-20">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <BookHeart className="w-10 h-10 text-primary" aria-hidden="true" />
          </div>

          <h1 className="font-heading text-5xl md:text-7xl tracking-tighter text-on-surface leading-none mb-6">
            Tentang Aggung Learning
          </h1>

          <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl mx-auto">
            Platform pembelajaran PAI modern yang lahir dari keprihatinan terhadap
            metode pengajaran agama yang monoton.
          </p>
        </div>

        <div className="grid gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
            className="p-8 md:p-10 rounded-[32px] bg-glass backdrop-blur-2xl border border-glass-stroke shadow-glass"
          >
            <h2 className="font-heading text-2xl md:text-3xl text-on-surface mb-4">
              Filosofi Kami
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              Aggung Learning percaya bahwa pendidikan agama Islam harus relevan
              dengan kehidupan digital siswa. Kami menggabungkan konten kurikulum
              yang autentik dengan pengalaman belajar modern — visual yang
              sinematik, navigasi yang intuitif, dan pendekatan yang hangat.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="p-8 md:p-10 rounded-[32px] bg-glass backdrop-blur-2xl border border-glass-stroke shadow-glass"
          >
            <h2 className="font-heading text-2xl md:text-3xl text-on-surface mb-4">
              Tentang Pendiri
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              <strong>Ahmad Katsiri Aggung, S.Pd.</strong> adalah pendidik PAI
              yang berdedikasi untuk menghadirkan pengalaman belajar agama yang
              bermakna bagi generasi muda Indonesia.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="p-8 md:p-10 rounded-[32px] bg-glass backdrop-blur-2xl border border-glass-stroke shadow-glass"
          >
            <h2 className="font-heading text-2xl md:text-3xl text-on-surface mb-4">
              Visi & Misi
            </h2>
            <p className="text-on-surface-variant leading-relaxed">
              Menjadi platform pembelajaran PAI nomor satu di Indonesia yang
              membuat setiap siswa jatuh cinta pada pelajaran agama Islam.
            </p>
          </motion.div>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/materi"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            Mulai Belajar
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
