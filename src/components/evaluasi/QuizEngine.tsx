"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import type { SoalItem, BabSoal } from "@/data/soal";

type QuizState = "intro" | "playing" | "result";

const letterMap = ["A", "B", "C", "D", "E"];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function QuizEngine({ bab }: { bab: BabSoal }) {
  const [quizState, setQuizState] = useState<QuizState>("intro");
  const [shuffledSoal, setShuffledSoal] = useState<SoalItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const soal = shuffledSoal[currentIndex];
  const totalSoal = shuffledSoal.length;
  const isCorrect = selected === soal?.jawaban;

  const startQuiz = useCallback(() => {
    setShuffledSoal(shuffleArray(bab.soal));
    setJawaban({});
    setCurrentIndex(0);
    setSelected(null);
    setShowFeedback(false);
    setShowReview(false);
    setQuizState("playing");
  }, [bab.soal]);

  const handleSelect = (option: string) => {
    if (showFeedback || !soal) return;
    setSelected(option);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (selected && soal) {
      setJawaban((prev) => ({ ...prev, [soal.nomor]: selected }));
    }
    setSelected(null);
    setShowFeedback(false);

    if (currentIndex < totalSoal - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizState("result");
    }
  };

  const hitungSkor = () => {
    let benar = 0;
    for (const s of shuffledSoal) {
      if (jawaban[s.nomor] === s.jawaban) benar++;
    }
    return benar;
  };

  const skor = hitungSkor();
  const salah = totalSoal - skor;
  const persentase = Math.round((skor / totalSoal) * 100);

  const resultEmoji = (score: number) => {
    const pct = Math.round((score / totalSoal) * 100);
    if (pct >= 90) return { emoji: "🌟", label: "Luar Biasa!" };
    if (pct >= 70) return { emoji: "👍", label: "Bagus!" };
    if (pct >= 50) return { emoji: "💪", label: "Cukup, Semangat!" };
    return { emoji: "📚", label: "Ayo Belajar Lagi!" };
  };

  if (quizState === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-center max-w-lg mx-auto"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <BookOpen className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <h2 className="font-heading text-3xl md:text-4xl text-on-surface mb-3">
          {bab.title}
        </h2>
        <p className="text-on-surface-variant mb-6">
          Uji pemahamanmu dengan {totalSoal} soal pilihan ganda.
        </p>

        <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-[32px] p-6 shadow-glass mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-2xl p-4 text-center">
              <p className="font-heading text-2xl font-bold text-primary">
                {totalSoal}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">Total Soal</p>
            </div>
            <div className="bg-primary/5 rounded-2xl p-4 text-center">
              <p className="font-heading text-2xl font-bold text-primary">
                {bab.kelas}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">Kelas</p>
            </div>
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
        >
          Mulai Kuis
          <Sparkles className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="mt-6">
          <Link
            href="/evaluasi"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" aria-hidden="true" />
            Pilih Bab Lain
          </Link>
        </div>
      </motion.div>
    );
  }

  if (quizState === "result") {
    const result = resultEmoji(skor);
    const wrongAnswers = shuffledSoal.filter(
      (s) => jawaban[s.nomor] !== s.jawaban
    );

    if (showReview) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl text-on-surface">
              Review Jawaban
            </h2>
            <button
              onClick={() => setShowReview(false)}
              className="text-sm text-primary font-semibold hover:underline"
            >
              Kembali ke Skor
            </button>
          </div>

          <div className="space-y-6">
            {shuffledSoal.map((s, i) => {
              const userAnswer = jawaban[s.nomor];
              const correct = userAnswer === s.jawaban;
              const opsiEntries = Object.entries(s.opsi);

              return (
                <motion.div
                  key={s.nomor}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] as const }}
                  className={`bg-glass backdrop-blur-2xl border rounded-[24px] p-6 shadow-glass ${
                    correct
                      ? "border-green-300/30"
                      : "border-red-300/30"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    {correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <p className="text-on-surface font-medium">
                      {s.nomor}. {s.pertanyaan}
                    </p>
                  </div>

                  <div className="ml-8 space-y-2">
                    {opsiEntries.map(([key, val]) => {
                      let className =
                        "px-4 py-2.5 rounded-xl text-sm border transition-all";
                      if (key === s.jawaban) {
                        className +=
                          " bg-green-50 border-green-300 text-green-800 font-semibold";
                      } else if (key === userAnswer && !correct) {
                        className +=
                          " bg-red-50 border-red-300 text-red-800";
                      } else {
                        className +=
                          " border-primary/10 text-on-surface-variant";
                      }
                      return (
                        <div key={key} className={className}>
                          <span className="font-bold mr-2">{key}.</span>
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-10 space-y-4">
            <button
              onClick={startQuiz}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5" aria-hidden="true" />
              Ulangi Kuis
            </button>
            <div>
              <Link
                href="/evaluasi"
                className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" aria-hidden="true" />
                Pilih Bab Lain
              </Link>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        className="max-w-lg mx-auto text-center"
      >
        <div className="text-6xl mb-6">{result.emoji}</div>

        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-primary" aria-hidden="true" />
        </div>

        <h2 className="font-heading text-3xl md:text-4xl text-on-surface mb-2">
          {result.label}
        </h2>
        <p className="text-on-surface-variant mb-8">{bab.title}</p>

        <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-[32px] p-8 shadow-glass mb-8">
          <div className="text-6xl font-heading font-bold text-primary mb-2">
            {skor}
            <span className="text-2xl text-on-surface-variant">/{totalSoal}</span>
          </div>
          <p className="text-sm text-on-surface-variant">
            {persentase}% Benar
          </p>

          <div className="w-full bg-primary/10 rounded-full h-3 mt-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${persentase}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
              className="h-full bg-primary rounded-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-green-50 rounded-2xl p-4">
              <p className="font-heading text-2xl font-bold text-green-600">
                {skor}
              </p>
              <p className="text-xs text-green-600/70">Benar</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4">
              <p className="font-heading text-2xl font-bold text-red-600">
                {salah}
              </p>
              <p className="text-xs text-red-600/70">Salah</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={startQuiz}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
            Ulangi Kuis
          </button>

          {wrongAnswers.length > 0 && (
            <button
              onClick={() => setShowReview(true)}
              className="inline-flex items-center gap-2 bg-white text-primary border-2 border-primary/20 px-8 py-4 rounded-full font-semibold hover:bg-primary/5 active:scale-[0.98] transition-all duration-300"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Review Jawaban
            </button>
          )}
        </div>

        <div className="mt-6">
          <Link
            href="/evaluasi"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" aria-hidden="true" />
            Pilih Bab Lain
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!soal) return null;

  const opsiEntries = Object.entries(soal.opsi);
  const progress = ((currentIndex + 1) / totalSoal) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-on-surface-variant">
            Soal {currentIndex + 1} dari {totalSoal}
          </span>
          <span className="text-sm font-medium text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={soal.nomor}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-[32px] p-8 shadow-glass mb-6">
            <p className="text-on-surface font-heading text-xl leading-relaxed mb-8">
              {soal.pertanyaan}
            </p>

            <div className="space-y-3">
              {opsiEntries.map(([key, val], idx) => {
                let className =
                  "w-full text-left px-5 py-4 rounded-2xl border-2 text-base font-medium transition-all duration-300 flex items-center gap-4";

                if (showFeedback) {
                  if (key === soal.jawaban) {
                    className +=
                      " bg-green-50 border-green-400 text-green-800";
                  } else if (key === selected) {
                    className +=
                      " bg-red-50 border-red-400 text-red-800";
                  } else {
                    className +=
                      " border-primary/5 text-on-surface-variant opacity-50";
                  }
                } else if (selected === key) {
                  className +=
                    " border-primary bg-primary/5 text-primary";
                } else {
                  className +=
                    " border-primary/5 text-on-surface-variant hover:border-primary/30 hover:bg-primary/5 hover:text-on-surface";
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    disabled={showFeedback}
                    className={className}
                  >
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                        showFeedback && key === soal.jawaban
                          ? "bg-green-500 text-white"
                          : showFeedback && key === selected
                          ? "bg-red-500 text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {key}
                    </span>
                    <span className="flex-1">{val}</span>
                    {showFeedback && key === soal.jawaban && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    )}
                    {showFeedback && key === selected && key !== soal.jawaban && (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center">
        {showFeedback ? (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
          >
            {currentIndex < totalSoal - 1 ? (
              <>
                Selanjutnya
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </>
            ) : (
              <>
                Lihat Skor
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </>
            )}
          </button>
        ) : (
          <p className="text-sm text-on-surface-variant">
            Pilih jawaban di atas
          </p>
        )}
      </div>
    </div>
  );
}
