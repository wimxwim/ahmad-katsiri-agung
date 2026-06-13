"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Gamepad2, ExternalLink, ArrowRight } from "lucide-react";

const GAMES = [
  {
    title: "Game Beriman kepada Malaikat",
    desc: "Game interaktif tentang malaikat Allah untuk siswa SMP.",
    url: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-malaikat",
    badge: "EKSTERNAL",
    image: "/images/games/game-beriman-kepada-malaikat.webp",
  },
  {
    title: "Game Membiasakan Tabayyun dan Menjauhi Ghibah",
    desc: "Game interaktif tentang tabayyun dan menjauhi ghibah untuk siswa SMP.",
    url: "https://kuis-bangun-ruang9.my.canva.site/membiasakan-tabayyun-dan-menjauhi-ghibah",
    badge: "EKSTERNAL",
    image: "/images/games/game-membiasakan-tabayyun-dan-menjauhi-ghibah.webp",
  },
  {
    title: "Game Salat Mencegah Perbuatan Keji dan Mungkar",
    desc: "Game interaktif tentang hikmah salat mencegah perbuatan keji dan mungkar.",
    url: "https://kuis-bangun-ruang9.my.canva.site/salat-mencegah-perbuatan-keji-dan-mungkarr",
    badge: "EKSTERNAL",
    image: "/images/games/game-salat-mencegah-perbuatan-keji-dan-mungkar.webp",
  },
  {
    title: "Game Amanah dan Jujur",
    desc: "Game interaktif tentang sifat amanah dan jujur dalam kehidupan sehari-hari.",
    url: "https://jujurdanamanah.my.canva.site/",
    badge: "EKSTERNAL",
    image: "/images/games/game-jujur-dan-amanah.webp",
  },
  {
    title: "Game Kitab Allah SWT",
    desc: "Game interaktif mengenal kitab-kitab Allah SWT untuk siswa SMP.",
    url: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-kitab-allah",
    badge: "EKSTERNAL",
    image: "/images/games/game-kitab-allah-swt.webp",
  },
  {
    title: "Game Beriman kepada Nabi dan Rasul",
    desc: "Game interaktif tentang nabi dan rasul untuk siswa SMP.",
    url: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-nabi-dan-rasul",
    badge: "EKSTERNAL",
    image: "/images/games/game-beriman-kepada-nabi-dan-rasul.webp",
  },
  {
    title: "Game Moderasi Beragama",
    desc: "Game interaktif tentang moderasi beragama sebagai wujud Islam rahmatan lil alamin.",
    url: "https://kuis-bangun-ruang9.my.canva.site/moderasi-beragama",
    badge: "EKSTERNAL",
    image: "/images/games/game-moderasi-beragama.webp",
  },
  {
    title: "Game Adab dalam Islam",
    desc: "Game interaktif tentang adab-adab dalam Islam untuk siswa SMP.",
    url: "https://kuis-bangun-ruang9.my.canva.site/adab-dalam-islamm",
    badge: "EKSTERNAL",
    image: "/images/games/game-adab-dalam-islam.webp",
  },
  {
    title: "Game Beriman kepada Hari Akhir",
    desc: "Game interaktif tentang iman kepada hari akhir untuk siswa SMP.",
    url: "https://kuis-bangun-ruang9.my.canva.site/aplikasi-tanpa-judul",
    badge: "EKSTERNAL",
    image: "/images/games/game-beriman-kepada-hari-akhir.webp",
  },
  {
    title: "Game Beriman kepada Qada & Qadar",
    desc: "Game interaktif tentang qada dan qadar untuk siswa SMP.",
    url: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-qada-dan-qadar",
    badge: "EKSTERNAL",
    image: "/images/games/game-beriman-kepada-qada-&-qadar.webp",
  },
  {
    title: "Game Semangat Mencari Ilmu",
    desc: "Game interaktif tentang semangat mencari ilmu sebagai kewajiban setiap muslim.",
    url: "https://kuis-bangun-ruang9.my.canva.site/semangat-mencari-ilmu",
    badge: "EKSTERNAL",
    image: "/images/games/game-semangat-mencari-ilmu.webp",
  },
  {
    title: "Game Manusia sebagai Khalifah di Bumi",
    desc: "Game interaktif tentang peran dan tanggung jawab manusia sebagai khalifah di muka bumi.",
    url: "https://kuis-bangun-ruang9.my.canva.site/manusia-sebagai-khalifah-di-bumi",
    badge: "EKSTERNAL",
    image: "/images/games/game-manusia-khalifah-di-muka-bumi.webp",
  },
];

export default function GamePage() {
  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 pb-24 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-center mb-12 sm:mb-20"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Gamepad2 className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl lg:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Game Edukasi
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant max-w-xl mx-auto">
          Koleksi game edukasi interaktif. Klik game untuk memulai
          petualangan belajar.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto mb-16 sm:mb-24">
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
              delay: i * 0.07,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
            className="group block bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-glass hover:shadow-2xl hover:-translate-y-2 transition-transform duration-500"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-4">
              {game.badge}
            </span>

            <div className="aspect-[16/9] rounded-2xl bg-primary/5 border border-white/40 mb-6 overflow-hidden relative">
              {game.image ? (
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center p-4">
                  <p className="font-heading text-lg sm:text-xl text-white text-center leading-snug">
                    {game.title}
                  </p>
                </div>
              )}
            </div>

            <h3 className="font-heading text-xl sm:text-2xl text-on-surface mb-3">
              {game.title}
            </h3>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
              {game.desc}
            </p>
            <div className="flex items-center gap-2 text-base font-semibold text-primary group-hover:gap-3 transition-all">
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
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
        >
          Jelajahi Materi
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>
      </motion.div>
    </div>
  );
}
