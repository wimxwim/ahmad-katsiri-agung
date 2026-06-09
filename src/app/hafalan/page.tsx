"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen, Sparkles } from "lucide-react";
import { ALL_MATERI } from "@/data/materi";

const DALIL_LIST = Object.values(ALL_MATERI)
  .filter((b) => b.dalil)
  .map((b) => ({
    id: b.slug,
    bab: `${b.title}`,
    kelas: `Kelas ${b.kelas} — Bab ${b.bab}`,
    surah: b.dalil!.surah,
    arab: b.dalil!.arab,
    arti: b.dalil!.arti,
  }));

export default function HafalanPage() {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hafal, setHafal] = useState<Set<string>>(new Set());

  const item = DALIL_LIST[current];

  const next = () => {
    if (current < DALIL_LIST.length - 1) {
      setCurrent(current + 1);
      setFlipped(false);
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setFlipped(false);
    }
  };

  const toggleHafal = () => {
    const next = new Set(hafal);
    if (next.has(item.id)) {
      next.delete(item.id);
    } else {
      next.add(item.id);
    }
    setHafal(next);
  };

  return (
    <div className="max-w-[640px] mx-auto px-4 md:px-8 pt-24 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8 text-primary" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-3xl md:text-5xl tracking-tighter text-on-surface leading-none mb-4">
          Hafalan Dalil
        </h1>
        <p className="text-base text-on-surface-variant max-w-md mx-auto">
          Geser atau tap kartu untuk membalik. Hafalkan dalil dari setiap bab
          pelajaran.
        </p>
      </motion.div>

      <div className="text-center mb-6">
        <span className="text-sm font-semibold text-on-surface-variant">
          {hafal.size} dari {DALIL_LIST.length} sudah dihafal
        </span>
      </div>

      <div className="relative" style={{ perspective: "1200px" }}>
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
          className="cursor-pointer"
          onClick={() => setFlipped(!flipped)}
        >
          <div
            className="relative transition-transform duration-700 w-full"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div
              className="bg-glass backdrop-blur-2xl border border-border-precision rounded-[40px] p-8 md:p-12 shadow-glass-lg"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider mb-6">
                  {item.kelas}
                </span>

                <p className="text-sm font-semibold text-on-surface-variant mb-3">
                  {item.surah}
                </p>

                <p
                  className="font-quran text-2xl md:text-3xl leading-[2] text-on-surface mb-8"
                  dir="rtl"
                >
                  {item.arab}
                </p>

                <p className="text-on-surface-variant italic">
                  Tap untuk lihat arti
                </p>
              </div>
            </div>

            <div
              className="absolute inset-0 bg-glass backdrop-blur-2xl border border-border-precision rounded-[40px] p-8 md:p-12 shadow-glass-lg flex items-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="text-center w-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>

                <p className="text-lg md:text-xl font-heading font-semibold text-on-surface mb-3">
                  Arti
                </p>

                <p className="text-base md:text-lg text-on-surface-variant leading-relaxed max-w-md mx-auto">
                  &ldquo;{item.arti}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={prev}
          disabled={current === 0}
          className="w-12 h-12 rounded-full bg-glass border border-border-precision flex items-center justify-center disabled:opacity-30 hover:bg-primary/5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-on-surface" aria-hidden="true" />
        </button>

        <span className="text-sm font-semibold text-on-surface-variant min-w-[80px] text-center">
          {current + 1} / {DALIL_LIST.length}
        </span>

        <button
          onClick={next}
          disabled={current === DALIL_LIST.length - 1}
          className="w-12 h-12 rounded-full bg-glass border border-border-precision flex items-center justify-center disabled:opacity-30 hover:bg-primary/5 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-on-surface" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => { setFlipped(false); setCurrent(0); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-glass border border-border-precision text-sm font-semibold text-on-surface-variant hover:bg-primary/5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Mulai Ulang
        </button>

        <button
          onClick={toggleHafal}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            hafal.has(item.id)
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "bg-glass border border-border-precision text-on-surface-variant hover:bg-primary/5"
          }`}
        >
          {hafal.has(item.id) ? "✓ Sudah Hafal" : "Tandai Hafal"}
        </button>
      </div>

      <div className="mt-12 grid grid-cols-9 gap-1.5 max-w-xs mx-auto">
        {DALIL_LIST.map((d, i) => (
          <button
            key={d.id}
            onClick={() => { setCurrent(i); setFlipped(false); }}
            className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
              i === current
                ? "bg-primary text-on-primary scale-110 shadow-lg"
                : hafal.has(d.id)
                  ? "bg-primary/20 text-primary"
                  : "bg-primary/5 text-on-surface-variant hover:bg-primary/10"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
