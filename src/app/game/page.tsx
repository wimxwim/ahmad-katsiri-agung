"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Gamepad2, ExternalLink, ArrowRight, Sparkles } from "lucide-react";

const GAMES = [
  {
    title: "Game Jujur dan Amanah",
    desc: "Game interaktif tentang kejujuran dan amanah untuk siswa SMP/MTs.",
    url: "https://jujurdanamanah.my.canva.site/",
    badge: "EKSTERNAL",
  },
  {
    title: "Game Kitab Allah SWT",
    desc: "Game interaktif mengenal kitab-kitab Allah SWT untuk siswa SMP/MTs.",
    url: "https://jujurdanamanah.my.canva.site/beriman-kepada-kitab-kitab-allah-swt",
    badge: "EKSTERNAL",
  },
  {
    title: "Game PAI Interaktif",
    desc: "Game pembelajaran PAI interaktif dari berbagai sumber edukasi.",
    url: "https://jurnalramadhansdnkebonkacang05.my.canva.site/aplikasi-tanpa-judul",
    badge: "EKSTERNAL",
  },
  {
    title: "Game Kegiatan Ramadhan",
    desc: "Game edukasi bertema kegiatan Ramadhan untuk siswa.",
    url: "https://kegiatanramadhansdnkarettengsin21pagi.my.canva.site/c31n9qdnttgjbeh9",
    badge: "EKSTERNAL",
  },
  {
    title: "Game Halal dan Haram",
    desc: "Game interaktif mengenal makanan dan minuman halal dan haram.",
    url: "https://perpustakaanbenhil12.my.canva.site/gamehalaldanharam",
    badge: "EKSTERNAL",
  },
];

export default function GamePage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-24 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-center mb-20"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Gamepad2 className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <h1 className="font-heading text-5xl md:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Game PAI Interaktif
        </h1>

        <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
          Koleksi game edukasi PAI dari berbagai sumber. Klik game untuk
          memulai petualangan belajar.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
        {GAMES.map((game, i) => (
          <motion.a
            key={game.title}
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
            className="group block bg-glass backdrop-blur-2xl border border-border-precision rounded-[32px] p-8 shadow-glass hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider mb-4">
              {game.badge}
            </span>

            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-primary" aria-hidden="true" />
            </div>

            <h3 className="font-heading text-2xl text-on-surface mb-3">
              {game.title}
            </h3>

            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              {game.desc}
            </p>

            <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
              Buka Game
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </div>
          </motion.a>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-center"
      >
        <Link
          href="/materi"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
        >
          Jelajahi Materi
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  );
}
