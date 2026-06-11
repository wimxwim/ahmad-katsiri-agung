"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function DualCTACards() {
  return (
    <section className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 py-12 sm:py-16 md:py-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8"
      >
        <motion.div
          variants={cardVariants}
          className="group relative bg-[#003820] rounded-[32px] sm:rounded-[56px] p-6 sm:p-10 md:p-14 overflow-hidden hover:scale-[1.01] transition-transform duration-500"
        >
          <div className="absolute -right-32 -top-32 w-80 h-80 bg-primary-fixed/10 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-xs font-semibold tracking-wide mb-8">
              DASHBOARD PENGAJAR
            </span>

            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl tracking-tighter text-white leading-none mb-8">
              Berdayakan Pengajaran Anda
            </h2>

            <ul className="space-y-4 mb-10">
              {[
                { title: "Manajemen Kurikulum", desc: "Sesuaikan materi dengan kebutuhan kelas Anda." },
                { title: "Analitik Siswa", desc: "Lihat statistik perkembangan belajar secara real-time." },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-primary-fixed shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-base text-white/70">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/pendidik"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:brightness-95 active:scale-[0.98] transition-transform duration-300"
            >
              MASUK DASHBOARD
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="group relative bg-[#001d35] rounded-[32px] sm:rounded-[56px] p-6 sm:p-10 md:p-14 overflow-hidden hover:scale-[1.01] transition-transform duration-500"
        >
          <div className="absolute -right-32 -bottom-32 w-80 h-80 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-xs font-semibold tracking-wide mb-8">
              HUB SISWA
            </span>

            <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl tracking-tighter text-white leading-none mb-8">
              Petualangan Belajar Menanti
            </h2>

            <ul className="space-y-4 mb-10">
              {[
                { title: "Gamifikasi Progress", desc: "Dapatkan badge dan level saat menyelesaikan materi." },
                { title: "Forum Komunitas", desc: "Diskusikan materi dengan teman sekelas." },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <Sparkles className="w-6 h-6 text-secondary-fixed shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="text-base text-white/70">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/peserta-didik"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:brightness-110 active:scale-[0.98] transition-transform duration-300"
            >
              GABUNG SEKARANG
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
