"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Gamepad2, ExternalLink, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { useCmsData } from "@/components/providers/CmsProvider";
import { EASE_CURVE } from "@/lib/constants";

const GAMES_FALLBACK = [
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
    url: "https://kuis-bangun-ruang9.my.canva.site/salat-mencegah-perbuatan-keji-dan-mungkar",
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
    url: "https://kuis-bangun-ruang9.my.canva.site/adab-dalam-islam",
    badge: "EKSTERNAL",
    image: "/images/games/game-adab-dalam-islam.webp",
  },
  {
    title: "Game Beriman kepada Hari Akhir",
    desc: "Game interaktif tentang iman kepada hari akhir untuk siswa SMP.",
    url: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-hari-akhir",
    badge: "EKSTERNAL",
    image: "/images/games/game-beriman-kepada-hari-akhir.webp",
  },
  {
    title: "Game Beriman kepada Qada dan Qadar",
    desc: "Game interaktif tentang qada dan qadar untuk siswa SMP.",
    url: "https://kuis-bangun-ruang9.my.canva.site/beriman-kepada-qada-dan-qadar",
    badge: "EKSTERNAL",
    image: "/images/games/game-beriman-kepada-qada-dan-qadar.webp",
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

function GameSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto mb-16 sm:mb-24">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-8 animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-24 bg-primary/10 rounded-full" />
            <div className="h-6 w-20 bg-amber-500/10 rounded-full" />
          </div>
          <div className="aspect-[16/9] rounded-2xl bg-primary/5 mb-6" />
          <div className="h-7 w-3/4 bg-primary/10 rounded-lg mb-3" />
          <div className="h-4 w-full bg-primary/5 rounded mb-2" />
          <div className="h-4 w-2/3 bg-primary/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function GamePage() {
  const { games } = useCmsData();
  const [pageState, setPageState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    setPageState("ready");
  }, []);

  const gameList = games && games.length > 0
    ? games.map((g) => ({
        title: g.judul,
        desc: g.desc,
        url: g.url,
        badge: g.badge,
        image: g.image,
      }))
    : GAMES_FALLBACK;

  const isEmpty = gameList.length === 0;

  const handleRetry = () => {
    setPageState("ready");
  };

  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 pb-24 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
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

      {pageState === "loading" ? (
        <GameSkeleton />
      ) : pageState === "error" ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="font-heading text-xl text-on-surface mb-3">Gagal Memuat Game</h2>
          <p className="text-on-surface-variant mb-6">Terjadi kesalahan saat memuat data game.</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Gamepad2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-heading text-xl text-on-surface mb-3">Game edukasi akan segera hadir</h2>
          <p className="text-on-surface-variant mb-6">Koleksi game edukasi interaktif sedang dipersiapkan. Kunjungi kembali nanti!</p>
          <Link
            href="/materi"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            Jelajahi Materi
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto mb-16 sm:mb-24">
            {gameList.map((game, i) => (
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
                  ease: EASE_CURVE,
                }}
                className="group block bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-glass hover:shadow-2xl hover:-translate-y-2 transition-transform duration-500"
              >
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider">
                  {game.badge}
                </span>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold tracking-wide border border-amber-200/50">
                  ⏱ ±10 menit
                </span>
              </div>

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
            transition={{ duration: 0.5, delay: 0.4, ease: EASE_CURVE }}
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
        </>
      )}
    </div>
  );
}
