"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  BookOpen,
  Play,
  ClipboardList,
  Terminal,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function PendidikPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-20 md:pt-32 pb-16 md:pb-32">
      <motion.header
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="max-w-4xl mx-auto text-center mb-32"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-8">
          PORTAL PENDIDIK V.2.6
        </div>

        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl tracking-tighter text-on-surface leading-none mb-8">
          Pusat Instrumen Akademik.
        </h1>

        <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Platform futuristik yang dirancang untuk mempermudah manajemen
          pembelajaran. Minimalis, efisien, dan tanpa hambatan visual.
        </p>
      </motion.header>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 md:auto-rows-[280px] mb-32">
        <FeatureCard
          colSpan="md:col-span-8"
          icon={BookOpen}
          badge="TERBARU: KURIKULUM MERDEKA"
          title="Modul Ajar"
          desc="Akses pustaka modul ajar digital yang telah dikurasi untuk standar pendidikan global terkini."
          cta="Eksplorasi Modul"
          delay={0.1}
        />

        <FeatureCard
          colSpan="md:col-span-4"
          icon={Play}
          title="Video"
          desc="Koleksi video pembelajaran Akidah Akhlak yang sinematik dan mudah dipahami."
          badge="120+ Materi Visual"
          delay={0.15}
        />

        <FeatureCard
          colSpan="md:col-span-4"
          icon={ClipboardList}
          title="Soal & Kisi-kisi"
          desc="Bank soal adaptif dengan klasifikasi level kognitif Bloom yang presisi."
          cta={Plus}
          delay={0.2}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
          className="md:col-span-8 group bg-glass backdrop-blur-2xl border border-glass-stroke rounded-[42px_18px_42px_18px] p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 shadow-glass hover:-translate-y-2 transition-transform duration-500"
        >
          <div className="flex-1">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Terminal className="w-7 h-7 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-heading text-3xl md:text-4xl text-on-surface mb-4">
              Perangkat
            </h3>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              Kelola administrasi pembelajaran dengan perangkat ajar terintegrasi:
              Program Tahunan, Program Semester, dan RPP+.
            </p>
            <div className="flex flex-wrap gap-3">
              {["PROTA", "PROMES", "RPP+"].map((chip) => (
                <span
                  key={chip}
                  className="px-4 py-2 rounded-full bg-surface-container-high text-primary text-xs font-semibold"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:h-48">
            <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full" />
            <div className="relative w-full h-full bg-white/20 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-center">
              <Terminal className="w-12 h-12 text-primary/60" aria-hidden="true" />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-primary/10 pt-16 md:pt-24 mb-32">
        {[
          { value: "98%", label: "EFISIENSI WAKTU" },
          { value: "12K+", label: "GURU AKTIF" },
          { value: "240TB", label: "DATA TERARSIP" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="text-center"
          >
            <p className="font-heading text-5xl md:text-7xl text-primary mb-2">
              {stat.value}
            </p>
            <p className="text-xs font-bold tracking-[0.1em] text-on-surface-variant">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative bg-primary-container rounded-[42px_18px_42px_18px] p-12 md:p-20 overflow-hidden text-center"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-primary-fixed-dim/20 blur-[100px] rounded-full -ml-16 -mb-16 pointer-events-none" />

        <div className="relative">
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
            Siap Memulai Transformasi?
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
            Bergabunglah dengan ribuan pendidik yang telah mendefinisikan ulang
            cara mereka mengajar dengan teknologi masa depan.
          </p>
          <div className="flex flex-col md:flex-row gap-5 justify-center">
            <Link
              href="/materi"
              className="inline-flex items-center gap-2 bg-primary-fixed-dim text-on-primary-fixed px-8 py-4 rounded-full font-semibold hover:scale-105 active:scale-[0.98] shadow-xl transition-transform duration-300"
            >
              Daftar Sekarang
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              href="/tentang"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 backdrop-blur-sm active:scale-[0.98] transition-all duration-300"
            >
              Lihat Dokumentasi
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function FeatureCard({
  colSpan,
  icon: Icon,
  badge,
  title,
  desc,
  cta,
  delay,
}: {
  colSpan: string;
  icon: typeof BookOpen;
  badge?: string;
  title: string;
  desc: string;
  cta?: string | typeof Plus;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const }}
      className={`${colSpan} group bg-glass backdrop-blur-2xl border border-glass-stroke rounded-[42px_18px_42px_18px] p-10 flex flex-col justify-between shadow-glass hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden`}
    >
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/5 blur-3xl rounded-full group-hover:opacity-100 opacity-50 transition-opacity pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          {typeof cta === "string" && (
            <div className="flex items-center gap-2 text-sm font-semibold text-primary md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {cta}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
        </div>

        {badge && (
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-3">
            {badge}
          </span>
        )}

        <h3 className="font-heading text-2xl md:text-3xl text-on-surface mb-2">
          {title}
        </h3>
        <p className="text-base md:text-base text-on-surface-variant leading-relaxed">
          {desc}
        </p>
      </div>

      {cta && typeof cta !== "string" && (
        <span className="self-end w-10 h-10 rounded-full bg-on-surface text-white flex items-center justify-center group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5" aria-hidden="true" />
        </span>
      )}
    </motion.div>
  );
}
