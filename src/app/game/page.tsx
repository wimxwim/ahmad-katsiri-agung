"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Gamepad2, ExternalLink, ArrowRight, AlertTriangle, RefreshCw, Clock } from "lucide-react";
import { useCmsData } from "@/components/providers/CmsProvider";
import { EASE_CURVE } from "@/lib/constants";

const GAMES_FALLBACK: {
  title: string;
  desc: string;
  url: string;
  badge: string;
  image: string;
}[] = [];

function GameSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto mb-16 sm:mb-24">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-2xl p-5 sm:p-8 animate-pulse">
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
    <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 pb-24 sm:pb-32">
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
            href="/kursus"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            Jelajahi Kursus
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
                className="group block bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-2xl p-5 sm:p-8 shadow-glass hover:shadow-2xl hover:-translate-y-2 transition-transform duration-500"
              >
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider">
                  {game.badge}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold tracking-wide border border-amber-200/50">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  ±10 menit
                </span>
              </div>

                <div className="aspect-[16/9] rounded-2xl bg-primary/5 border border-white/40 mb-6 overflow-hidden relative">
                  {game.image ? (
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, 400px"
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
              href="/kursus"
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
            >
              Jelajahi Kursus
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </motion.div>
        </>
      )}
    </div>
  );
}
