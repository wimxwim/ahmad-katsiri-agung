"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  BookOpen,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { cn } from "@/lib/utils";

type QuizState = "intro" | "playing" | "result";

interface SoalItem {
  id: string;
  nomor: number;
  pertanyaan: string;
  tipe: "PG" | "ISIAN" | "ESSAY";
  opsi: Record<string, string>;
  kunci: string;
}

interface QuizData {
  id: string;
  judul: string;
  durasiMenit: number;
  totalSoal: number;
  soal: SoalItem[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  const buf = new Uint32Array(shuffled.length);
  crypto.getRandomValues(buf);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = buf[i] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface QuizEngineProps {
  quiz: QuizData;
  onBack: () => void;
}

export function QuizEngine({ quiz, onBack }: QuizEngineProps) {
  const [quizState, setQuizState] = useState<QuizState>("intro");
  const [shuffledSoal, setShuffledSoal] = useState<SoalItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isianText, setIsianText] = useState("");
  const timerExpiredRef = useRef(false);
  const selectedRef = useRef(selected);
  const soalRef = useRef<SoalItem | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    selectedRef.current = selected;
  });

  useEffect(() => {
    if (quizState !== "playing") {
      timerExpiredRef.current = false;
      return;
    }
    if (timeLeft <= 0) {
      if (!timerExpiredRef.current) {
        timerExpiredRef.current = true;
        const s = selectedRef.current;
        const q = soalRef.current;
        if (s && q) {
          setJawaban((prev) => ({ ...prev, [q.nomor]: s }));
        }
        if (isianText && soalRef.current) {
          setJawaban((prev) => ({ ...prev, [soalRef.current!.nomor]: isianText }));
        }
        setQuizState("result");
      }
      return;
    }
    const id = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [quizState, timeLeft, isianText]);

  const soal = shuffledSoal[currentIndex];
  soalRef.current = soal ?? null;
  const totalSoal = shuffledSoal.length;

  const startQuiz = useCallback(() => {
    setShuffledSoal(shuffleArray(quiz.soal));
    setJawaban({});
    setCurrentIndex(0);
    setSelected(null);
    setIsianText("");
    setShowFeedback(false);
    setShowReview(false);
    setQuizState("playing");
    setTimeLeft(quiz.durasiMenit * 60);
    timerExpiredRef.current = false;
    submittedRef.current = false;
  }, [quiz.soal, quiz.durasiMenit]);

  const handleSelect = (option: string) => {
    if (showFeedback || !soal) return;
    setSelected(option);
    setShowFeedback(true);
  };

  const handleIsianSubmit = () => {
    if (!isianText.trim() || !soal) return;
    setSelected(isianText.trim());
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (soal) {
      const answer = soal.tipe === "PG" ? selected : isianText.trim();
      if (answer) {
        setJawaban((prev) => ({ ...prev, [soal.nomor]: answer }));
      }
    }
    setSelected(null);
    setIsianText("");
    setShowFeedback(false);
    if (currentIndex < totalSoal - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizState("result");
    }
  };

  const submitHasil = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    try {
      await fetch(`/api/v1/siswa/quiz/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jawaban }),
      });
    } catch {
      // best-effort
    }
  }, [quiz.id, jawaban]);

  useEffect(() => {
    if (quizState === "result") submitHasil();
  }, [quizState, submitHasil]);

  const hitungSkor = useCallback(() => {
    let benar = 0;
    for (const s of shuffledSoal) {
      const jawab = jawaban[s.nomor];
      if (!jawab) continue;
      if (s.tipe === "PG") {
        if (jawab === s.kunci) benar++;
      } else {
        if (jawab.toLowerCase().trim() === s.kunci.toLowerCase().trim()) benar++;
      }
    }
    return benar;
  }, [shuffledSoal, jawaban]);

  const skor = hitungSkor();
  const persentase = totalSoal > 0 ? Math.round((skor / totalSoal) * 100) : 0;

  const resultEmoji = () => {
    if (persentase >= 90) return { emoji: "🌟", label: "Luar Biasa!" };
    if (persentase >= 70) return { emoji: "👍", label: "Bagus!" };
    if (persentase >= 50) return { emoji: "💪", label: "Cukup, Semangat!" };
    return { emoji: "📚", label: "Ayo Belajar Lagi!" };
  };

  // ── INTRO ──
  if (quizState === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
        className="text-center max-w-lg mx-auto"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <BookOpen className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl text-on-surface mb-3">{quiz.judul}</h2>
        <p className="text-on-surface-variant mb-6">Uji pemahamanmu dengan {totalSoal} soal.</p>
        <div className="bg-glass rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-glass mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-2xl p-4 text-center">
              <p className="font-heading text-2xl font-bold text-primary">{totalSoal}</p>
              <p className="text-xs text-on-surface-variant mt-1">Total Soal</p>
            </div>
            <div className="bg-primary/5 rounded-2xl p-4 text-center">
              <p className="font-heading text-2xl font-bold text-primary">{quiz.durasiMenit}</p>
              <p className="text-xs text-on-surface-variant mt-1">Menit</p>
            </div>
          </div>
        </div>
        <button
          onClick={startQuiz}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300"
        >
          Mulai Kuis
          <Sparkles className="w-5 h-5" />
        </button>
        <div className="mt-6">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </motion.div>
    );
  }

  // ── RESULT ──
  if (quizState === "result") {
    const result = resultEmoji();

    if (showReview) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl text-on-surface">Review Jawaban</h2>
            <button onClick={() => setShowReview(false)} className="text-sm text-primary font-semibold hover:underline">
              Kembali ke Skor
            </button>
          </div>
          <div className="space-y-6">
            {shuffledSoal.map((s, i) => {
              const userAnswer = jawaban[s.nomor];
              const correct = s.tipe === "PG" ? userAnswer === s.kunci : userAnswer?.toLowerCase().trim() === s.kunci.toLowerCase().trim();
              const opsiEntries = Object.entries(s.opsi);
              return (
                <motion.div
                  key={s.nomor}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, ease: EASE_CURVE }}
                  className={cn("bg-glass border rounded-[24px] p-6 shadow-glass", correct ? "border-green-300/30" : "border-red-300/30")}
                >
                  <div className="flex items-start gap-3 mb-4">
                    {correct ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                    <div>
                      <span className="text-xs text-on-surface-variant">{s.tipe} · </span>
                      <span className="text-on-surface font-medium"><MathRenderer text={s.pertanyaan} /></span>
                    </div>
                  </div>
                  {s.tipe === "PG" ? (
                    <div className="ml-8 space-y-2">
                      {opsiEntries.map(([key, val]) => {
                        let cls = "px-4 py-2.5 rounded-xl text-sm border transition-all";
                        if (key === s.kunci) cls += " bg-green-50 border-green-300 text-green-800 font-semibold";
                        else if (key === userAnswer && !correct) cls += " bg-red-50 border-red-300 text-red-800";
                        else cls += " border-primary/10 text-on-surface-variant";
                        return (
                          <div key={key} className={cls}>
                            <span className="font-bold mr-2">{key}.</span>
                            <MathRenderer text={val} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ml-8 space-y-2">
                      <div className="px-4 py-2.5 rounded-xl text-sm border border-primary/10">
                        <span className="text-xs text-on-surface-variant">Jawaban kamu: </span>
                        <span className={correct ? "text-green-700 font-semibold" : "text-red-700"}>{userAnswer || "(tidak dijawab)"}</span>
                      </div>
                      <div className="px-4 py-2.5 rounded-xl text-sm border bg-green-50 border-green-300 text-green-800 font-semibold">
                        <span className="text-xs text-green-600">Kunci: </span>
                        <MathRenderer text={s.kunci} />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          <div className="text-center mt-10 space-y-4">
            <button onClick={startQuiz} className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300">
              <RotateCcw className="w-5 h-5" /> Ulangi Kuis
            </button>
            <div>
              <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kuis
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_CURVE }} className="max-w-lg mx-auto text-center">
        <div className="text-6xl mb-6">{result.emoji}</div>
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl text-on-surface mb-2">{result.label}</h2>
        <p className="text-on-surface-variant mb-8">{quiz.judul}</p>
        <div className="bg-glass border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-glass mb-8">
          <div className="text-6xl font-heading font-bold text-primary mb-2">
            {skor}<span className="text-2xl text-on-surface-variant">/{totalSoal}</span>
          </div>
          <p className="text-sm text-on-surface-variant">{persentase}% Benar</p>
          <div className="w-full bg-primary/10 rounded-full h-3 mt-6 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${persentase}%` }} transition={{ duration: 1, ease: EASE_CURVE }} className="h-full bg-primary rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-green-50 rounded-2xl p-4">
              <p className="font-heading text-2xl font-bold text-green-600">{skor}</p>
              <p className="text-xs text-green-600/70">Benar</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4">
              <p className="font-heading text-2xl font-bold text-red-600">{totalSoal - skor}</p>
              <p className="text-xs text-red-600/70">Salah</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={startQuiz} className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300">
            <RotateCcw className="w-5 h-5" /> Ulangi Kuis
          </button>
          <button onClick={() => setShowReview(true)} className="inline-flex items-center gap-2 bg-white text-primary border-2 border-primary/20 px-8 py-4 rounded-full font-semibold hover:bg-primary/5 active:scale-[0.98] transition-all duration-300">
            <BookOpen className="w-5 h-5" /> Review Jawaban
          </button>
        </div>
        <div className="mt-6">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kuis
          </button>
        </div>
      </motion.div>
    );
  }

  // ── PLAYING ──
  if (!soal) return null;

  const opsiEntries = Object.entries(soal.opsi);
  const progress = ((currentIndex + 1) / totalSoal) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-on-surface-variant">
            Soal {currentIndex + 1} dari {totalSoal}
          </span>
          <span className={cn("text-sm font-medium tabular-nums flex items-center gap-1", timeLeft < 60 ? "text-red-500" : "text-primary")}>
            <Clock className="w-3.5 h-3.5" />
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
        <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: EASE_CURVE }} className="h-full bg-primary rounded-full" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={soal.nomor} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE_CURVE }}>
          <div className="bg-glass border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-glass mb-6 min-h-[260px]">
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary mb-3">
              {soal.tipe}
            </span>
            <p className="text-on-surface font-heading text-xl leading-relaxed mb-8">
              <MathRenderer text={soal.pertanyaan} />
            </p>

            {soal.tipe === "PG" ? (
              <div className="space-y-3">
                {opsiEntries.map(([key, val]) => {
                  let cls = "w-full text-left px-5 py-4 rounded-2xl border-2 text-base font-medium transition-all duration-300 flex items-center gap-4";
                  if (showFeedback) {
                    if (key === soal.kunci) cls += " bg-green-50 border-green-400 text-green-800";
                    else if (key === selected) cls += " bg-red-50 border-red-400 text-red-800";
                    else cls += " border-primary/5 text-on-surface-variant opacity-50";
                  } else if (selected === key) {
                    cls += " border-primary bg-primary/5 text-primary";
                  } else {
                    cls += " border-primary/5 text-on-surface-variant hover:border-primary/30 hover:bg-primary/5 hover:text-on-surface";
                  }
                  return (
                    <button key={key} onClick={() => handleSelect(key)} disabled={showFeedback} className={cls}>
                      <span className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0", showFeedback && key === soal.kunci ? "bg-green-500 text-white" : showFeedback && key === selected ? "bg-red-500 text-white" : "bg-primary/10 text-primary")}>
                        {key}
                      </span>
                      <span className="flex-1 text-left"><MathRenderer text={val} /></span>
                      {showFeedback && key === soal.kunci && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                      {showFeedback && key === selected && key !== soal.kunci && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={isianText}
                  onChange={(e) => setIsianText(e.target.value)}
                  disabled={showFeedback}
                  placeholder={soal.tipe === "ESSAY" ? "Tulis jawaban essay kamu di sini..." : "Tulis jawaban singkat..."}
                  className="w-full px-4 py-3 rounded-xl border-2 border-primary/10 bg-white text-sm min-h-[100px] focus:border-primary focus:outline-none disabled:opacity-50"
                  rows={soal.tipe === "ESSAY" ? 5 : 2}
                />
                {!showFeedback && (
                  <button onClick={handleIsianSubmit} disabled={!isianText.trim()} className="w-full bg-primary text-white px-4 py-3 rounded-full text-sm font-semibold hover:brightness-110 disabled:opacity-50">
                    Jawab
                  </button>
                )}
                {showFeedback && (
                  <div className={cn("p-4 rounded-xl text-sm", isianText.trim().toLowerCase() === soal.kunci.toLowerCase().trim() ? "bg-green-50 border border-green-300 text-green-800" : "bg-red-50 border border-red-300 text-red-800")}>
                    {isianText.trim().toLowerCase() === soal.kunci.toLowerCase().trim() ? (
                      <><CheckCircle2 className="w-4 h-4 inline mr-1" /> Jawaban benar!</>
                    ) : (
                      <><XCircle className="w-4 h-4 inline mr-1" /> Jawaban benar: <span className="font-semibold"><MathRenderer text={soal.kunci} /></span></>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center min-h-[60px] mb-6">
        {showFeedback ? (
          <button onClick={handleNext} className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300">
            {currentIndex < totalSoal - 1 ? (
              <>Selanjutnya<ArrowRight className="w-5 h-5" /></>
            ) : (
              <>Lihat Skor<Sparkles className="w-5 h-5" /></>
            )}
          </button>
        ) : (
          <p className="text-sm text-on-surface-variant self-center">Pilih jawaban di atas</p>
        )}
      </div>

      {totalSoal > 1 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {shuffledSoal.map((s, i) => (
            <button
              key={s.nomor}
              onClick={() => {
                if (i === currentIndex) return;
                if (showFeedback) {
                  if (selected) setJawaban((prev) => ({ ...prev, [soal.nomor]: selected }));
                  setSelected(null);
                  setIsianText("");
                  setShowFeedback(false);
                }
                setCurrentIndex(i);
              }}
              className={cn(
                "w-8 h-8 rounded-full text-xs font-semibold transition-all",
                i === currentIndex && "bg-primary text-white scale-110",
                i !== currentIndex && jawaban[s.nomor] && "bg-emerald-100 text-emerald-700 border border-emerald-300",
                i !== currentIndex && !jawaban[s.nomor] && "bg-surface text-on-surface-variant border border-border-precision",
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}