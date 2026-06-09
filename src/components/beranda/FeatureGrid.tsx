"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  BookOpen,
  Play,
  Gamepad2,
  ClipboardList,
  ArrowRight,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Materi Interaktif",
    desc: "Jelajahi modul pembelajaran mendalam yang dirancang khusus untuk siswa SMP/MTs Kelas 7-9.",
    link: "/materi",
    colSpan: "md:col-span-7",
    gradient: false,
  },
  {
    icon: Play,
    title: "Video Pembelajaran",
    desc: "Visualisasi sinematik materi PAI yang membuat konsep abstrak menjadi mudah dipahami.",
    link: "/video",
    colSpan: "md:col-span-5",
    gradient: true,
    badge: "+500 Siswa Menonton",
  },
  {
    icon: Gamepad2,
    title: "Game Edukasi",
    desc: "Simulasi tantangan kejujuran dalam format RPG yang seru dan mendidik.",
    link: "/game",
    colSpan: "md:col-span-4",
    gradient: false,
  },
  {
    icon: ClipboardList,
    title: "Kuis & Evaluasi",
    desc: "Asesmen berbasis AI yang beradaptasi dengan tingkat pemahaman setiap siswa.",
    link: "/evaluasi",
    colSpan: "md:col-span-8",
    gradient: true,
    stats: [
      { value: "98%", label: "Kepuasan" },
      { value: "12K+", label: "Siswa Aktif" },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function FeatureGrid() {
  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-32">
      <div className="flex items-end justify-between mb-16">
        <div>
          <h2 className="font-heading text-4xl md:text-5xl tracking-tighter text-on-surface">
            Ekosistem Belajar Digital
          </h2>
          <p className="mt-3 text-lg text-on-surface-variant max-w-lg">
            Platform Deep Learning yang dirancang khusus untuk pembelajaran
            Akidah Akhlak tingkat SMP/MTs.
          </p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={itemVariants}
            className={`${f.colSpan} group relative bg-glass backdrop-blur-2xl border border-border-precision p-8 md:p-10 rounded-[40px] shadow-glass hover:-translate-y-2 transition-transform duration-500 ${
              f.gradient ? "bg-gradient-to-b from-white/30 to-primary/5" : ""
            }`}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <f.icon className="w-7 h-7 text-primary" aria-hidden="true" />
              </div>

              <h3 className="font-heading text-2xl md:text-3xl font-semibold text-on-surface mb-3">
                {f.title}
              </h3>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                {f.desc}
              </p>

              {f.stats && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {f.stats.map((s) => (
                    <div
                      key={s.label}
                      className="bg-white/40 rounded-2xl p-4 text-center"
                    >
                      <p className="font-heading text-2xl font-bold text-primary">
                        {s.value}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {f.badge && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-primary">
                    {f.badge}
                  </span>
                </div>
              )}

              <Link
                href={f.link}
                className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:gap-3 transition-all py-3.5 -my-3.5"
              >
                Pelajari Selengkapnya
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
