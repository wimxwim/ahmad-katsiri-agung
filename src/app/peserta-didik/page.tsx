"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  Gamepad2,
  Play,
  BookMarked,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { EASE_CURVE } from "@/lib/constants";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } },
};

const menuItems = [
  {
    icon: BookOpen,
    title: "Materi PAI",
    desc: "Pelajari 14 bab Akidah Akhlak Kurikulum Merdeka dengan konten mendalam.",
    href: "/materi",
    colSpan: "md:col-span-7",
  },
  {
    icon: ClipboardList,
    title: "Kuis & Evaluasi",
    desc: "Uji pemahamanmu lewat bank soal adaptif dan lihat hasil langsung.",
    href: "/evaluasi",
    colSpan: "md:col-span-5",
  },
  {
    icon: Play,
    title: "Video Pembelajaran",
    desc: "Tonton penjelasan visual yang membuat konsep PAI jadi hidup.",
    href: "/video",
    colSpan: "md:col-span-5",
  },
  {
    icon: Gamepad2,
    title: "Game Edukasi",
    desc: "Belajar sambil bermain dengan game interaktif lintas bab.",
    href: "/game",
    colSpan: "md:col-span-4",
  },
  {
    icon: BookMarked,
    title: "Hafalan Dalil",
    desc: "Latih hafalan dalil dan hadits dengan flashcard interaktif.",
    href: "/hafalan",
    colSpan: "md:col-span-3",
  },
];

const comingSoonItems = [
  { title: "Dashboard Progress", desc: "Pantau perkembangan belajar per bab." },
  { title: "Badge & Pencapaian", desc: "Kumpulkan lencana dari setiap tantangan." },
  { title: "Forum Diskusi", desc: "Bertanya dan berdiskusi dengan teman." },
];

export default function PesertaDidikPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 md:pt-40 pb-16 md:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="text-center max-w-3xl mx-auto mb-12 sm:mb-20"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Sparkles className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Portal Peserta Didik
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-on-surface-variant leading-relaxed max-w-xl mx-auto">
          Mulai petualangan belajar Akidah Akhlak. Akses materi, kuis, video,
          dan game dalam satu tempat yang terstruktur.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 mb-12 sm:mb-20"
      >
        {menuItems.map((item) => (
          <motion.div key={item.title} variants={itemVariants} className={item.colSpan}>
            <Link
              href={item.href}
              className="group block h-full bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-glass hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>

              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-on-surface mb-3">
                {item.title}
              </h2>

              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
                {item.desc}
              </p>

              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group/link">
                Buka
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE_CURVE }}
        className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-6 sm:p-10 shadow-glass"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl text-on-surface mb-2">
              Fitur Lainnya
            </h2>
            <p className="text-sm text-on-surface-variant">
              Pengalaman belajar akan terus bertambah seru.
            </p>
          </div>
          <span className="inline-flex items-center self-start px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold tracking-wider">
            SEGERA HADIR
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {comingSoonItems.map((item) => (
            <div
              key={item.title}
              className="border border-dashed border-border-precision rounded-2xl p-5 sm:p-6 bg-white/30"
            >
              <h3 className="font-heading text-base sm:text-lg text-on-surface mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
