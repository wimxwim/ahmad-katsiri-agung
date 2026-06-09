"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Clock, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ALL_MATERI } from "@/data/materi";

const BAB_LIST = Object.values(ALL_MATERI).sort(
  (a, b) => a.kelas - b.kelas || a.bab - b.bab
);

const KELAS = [7, 8, 9] as const;

export default function VideoPage() {
  const [filterKelas, setFilterKelas] = useState<number | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const filtered = filterKelas
    ? BAB_LIST.filter((m) => m.kelas === filterKelas)
    : BAB_LIST;

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-24 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-center mb-16"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Play className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-heading text-5xl md:text-7xl tracking-tighter text-on-surface leading-none mb-6">
          Video{" "}
          <span className="text-primary italic font-semibold">Pembelajaran</span>
        </h1>

        <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
          Tonton video pembelajaran Akidah Akhlak yang dikurasi khusus untuk
          siswa SMP/MTs.
        </p>
      </motion.div>

      <div className="flex justify-center mb-16 overflow-x-auto px-4 -mx-4">
        <div className="inline-flex items-center p-1.5 rounded-full bg-glass backdrop-blur-md border border-border-precision shadow-glass shrink-0">
          <button
            onClick={() => setFilterKelas(null)}
            className={`px-6 md:px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              filterKelas === null
                ? "bg-primary text-on-primary shadow-xl shadow-primary/20"
                : "text-on-surface-variant hover:bg-primary/5"
            }`}
          >
            Semua Kelas
          </button>
          {KELAS.map((k) => (
            <button
              key={k}
              onClick={() => setFilterKelas(k)}
              className={`px-6 md:px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                filterKelas === k
                  ? "bg-primary text-on-primary shadow-xl shadow-primary/20"
                  : "text-on-surface-variant hover:bg-primary/5"
              }`}
            >
              Kelas {k}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {filtered.map((bab, idx) => {
          const isPlaying = playing === bab.slug;

          return (
            <motion.div
              key={bab.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.06,
                ease: [0.16, 1, 0.3, 1] as const,
              }}
            >
              <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-[40px] overflow-hidden shadow-glass hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-5">
                  <div className="lg:col-span-2 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-3 w-fit">
                      KELAS {bab.kelas} — BAB {bab.bab}
                    </div>

                    <h2 className="font-heading text-2xl md:text-3xl text-on-surface mb-3">
                      {bab.title}
                    </h2>

                    <p className="text-on-surface-variant mb-6">
                      {bab.ringkasan}
                    </p>

                    {bab.videoUrl ? (
                      <button
                        onClick={() =>
                          setPlaying(isPlaying ? null : bab.slug)
                        }
                        className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 w-fit"
                      >
                        {isPlaying ? (
                          <>
                            <BookOpen className="w-4 h-4" />
                            Tutup Video
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Putar Video
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
                        <Clock className="w-4 h-4" />
                        Segera Hadir
                      </div>
                    )}

                    <Link
                      href={`/materi/${bab.slug}`}
                      className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:gap-2 transition-all mt-4 w-fit"
                    >
                      Buka Materi
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="lg:col-span-3 relative">
                    <AnimatePresence mode="wait">
                      {isPlaying && bab.videoUrl ? (
                        <motion.div
                          key="video"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
                        >
                          <div className="aspect-video">
                            <iframe
                              src={bab.videoUrl}
                              title={`Video: ${bab.title}`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="aspect-video bg-gradient-to-br from-primary/10 via-surface to-primary/5 flex items-center justify-center"
                        >
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                              {bab.videoUrl ? (
                                <Play className="w-10 h-10 text-primary/60" />
                              ) : (
                                <Clock className="w-10 h-10 text-primary/60" />
                              )}
                            </div>
                            <p className="text-sm text-on-surface-variant font-medium">
                              {bab.videoUrl
                                ? "Klik \"Putar Video\" untuk menonton"
                                : "Video sedang dipersiapkan"}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
