"use client";

/* LEGACY — old single-guru PAI beranda component. Not used in new landing page. */

import { motion } from "motion/react";
import Link from "next/link";
import { Brain, BookHeart, Sparkles, ArrowRight } from "lucide-react";
import { EASE_CURVE } from "@/lib/constants";

const pillars = [
  {
    icon: Brain,
    title: "Mindful Learning",
    subtitle: "Pembelajaran Sadar",
    desc: "Siswa diajak sadar penuh saat belajar, memahami tujuan setiap materi, dan merefleksikan pemahaman secara pribadi melalui muhasabah diri. Proses ini membangun kesadaran metakognitif yang mendalam.",
    link: "/refleksi",
    cta: "Refleksi Diri",
    gradient: "from-emerald-900/5 via-emerald-700/10 to-emerald-500/5",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
  {
    icon: BookHeart,
    title: "Meaningful Learning",
    subtitle: "Pembelajaran Bermakna",
    desc: "Materi Akidah Akhlak dikaitkan dengan kehidupan sehari-hari siswa melalui studi kasus, diskusi interaktif, dan contoh nyata dari lingkungan sekitar agar pembelajaran terasa relevan dan aplikatif.",
    link: "/diskusi",
    cta: "Diskusi & Studi Kasus",
    gradient: "from-amber-900/5 via-amber-700/10 to-amber-500/5",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    icon: Sparkles,
    title: "Joyful Learning",
    subtitle: "Pembelajaran Menyenangkan",
    desc: "Belajar menjadi pengalaman yang menyenangkan melalui video pembelajaran interaktif, game edukasi Canva yang seru, dan kuis evaluasi yang menantang. Suasana positif membuat siswa betah belajar.",
    link: "/materi",
    cta: "Mulai Belajar",
    gradient: "from-sky-900/5 via-sky-700/10 to-sky-500/5",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-700",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_CURVE } },
};

export function DeepLearningSection() {
  return (
    <section className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 py-12 sm:py-16 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="text-center mb-12 sm:mb-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          KONSEP PEMBELAJARAN
        </div>
        <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl tracking-tighter text-on-surface leading-tight mb-4">
          Model{" "}
          <span className="text-primary italic font-semibold">Deep Learning</span>
          {" "}Akidah Akhlak
        </h2>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
          Tiga pilar pembelajaran yang saling terintegrasi untuk membentuk
          pemahaman yang utuh, mendalam, dan bermakna bagi siswa.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
      >
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            variants={cardVariants}
            className="group relative bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-glass hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
            />

            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl ${p.iconBg} flex items-center justify-center shrink-0`}
                >
                  <p.icon
                    className={`w-7 h-7 ${p.iconColor}`}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-primary/20">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <h3 className="font-heading text-xl sm:text-2xl font-bold text-on-surface mb-1">
                {p.title}
              </h3>
              <p className="text-sm font-semibold text-primary mb-4">
                {p.subtitle}
              </p>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-8">
                {p.desc}
              </p>

              <Link
                href={p.link}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary group/link"
              >
                {p.cta}
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
