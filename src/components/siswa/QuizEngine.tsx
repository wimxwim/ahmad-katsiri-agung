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
  ThumbsUp,
  Smile,
  BookOpen,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { cn } from "@/lib/utils";
import { useQuizLock } from "@/hooks/useQuizLock";
import { QuizLockOverlay } from "@/components/siswa/QuizLockOverlay";

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
  modeEvaluasi: "BELAJAR" | "ULANGAN" | "CBT";
}

const tipeLabel: Record<string, string> = {
  PG: "Pilihan Ganda",
  ISIAN: "Isian",
  ESSAY: "Essay",
};

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
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isianText, setIsianText] = useState("");
  const timerExpiredRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const selectedRef = useRef(selected);
  const soalRef = useRef<SoalItem | null>(null);
  const submittedRef = useRef(false);
  const isianTextRef = useRef(isianText);
  const [serverResult, setServerResult] = useState<{
    nilai: number; jumlahBenar: number; jumlahSalah: number; totalSoal: number;
    jawabanBenar: Record<string, string>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    selectedRef.current = selected;
  });

  isianTextRef.current = isianText;

  const onMaxViolations = useCallback(() => {
    setQuizState("result");
  }, []);

  const lock = useQuizLock({
    enabled: quizState === "playing",
    mode: quiz.modeEvaluasi,
    maxViolations: 3,
    onMaxViolations,
  });

  const totalSeconds = quiz.durasiMenit * 60;

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
          setJawaban((prev) => ({ ...prev, [q.id]: s }));
        }
        if (isianTextRef.current && soalRef.current) {
          setJawaban((prev) => ({ ...prev, [soalRef.current!.id]: isianTextRef.current }));
        }
        setQuizState("result");
      }
      return;
    }
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);
    }, 250);
    return () => clearInterval(id);
  }, [quizState, timeLeft, totalSeconds]);

  // Exit confirmation
  useEffect(() => {
    if (quizState !== "playing") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [quizState]);

  const soal = shuffledSoal[currentIndex];
  soalRef.current = soal ?? null;
  const totalSoal = shuffledSoal.length;

  const startQuiz = useCallback(async () => {
    setError(null);
    setShuffledSoal(shuffleArray(quiz.soal));
    try {
      const startRes = await fetch(`/api/v1/siswa/quiz/${quiz.id}/start`, {
        method: "POST",
        credentials: "include",
      });
      if (!startRes.ok) {
        setError("Gagal memulai quiz. Silakan coba lagi.");
        return;
      }
    } catch {
      setError("Gagal memulai quiz. Periksa koneksi internet Anda.");
      return;
    }
    setJawaban({});
    setCurrentIndex(0);
    setSelected(null);
    setIsianText("");
    setShowFeedback(false);
    setShowReview(false);
    setQuizState("playing");
    setTimeLeft(quiz.durasiMenit * 60);
    startTimeRef.current = Date.now();
    timerExpiredRef.current = false;
    submittedRef.current = false;
  }, [quiz.soal, quiz.durasiMenit, quiz.id]);

  const handleSelect = (option: string) => {
    if (showFeedback || !soal) return;
    setSelected(option);
    if (quiz.modeEvaluasi === "BELAJAR") {
      setShowFeedback(true);
    } else {
      setJawaban((prev) => ({ ...prev, [soal.id]: option }));
      if (currentIndex < totalSoal - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setQuizState("result");
      }
    }
  };

  const handleIsianSubmit = () => {
    if (!isianText.trim() || !soal) return;
    setSelected(isianText.trim());
    if (quiz.modeEvaluasi === "BELAJAR") {
      setShowFeedback(true);
    } else {
      setJawaban((prev) => ({ ...prev, [soal.id]: isianText.trim() }));
      if (currentIndex < totalSoal - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setQuizState("result");
      }
    }
  };

  const handleNext = () => {
    if (soal) {
      const answer = soal.tipe === "PG" ? selected : isianText.trim();
      if (answer) {
        setJawaban((prev) => ({ ...prev, [soal.id]: answer }));
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
      const r = await fetch(`/api/v1/siswa/quiz/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ durasiDetik: quiz.durasiMenit * 60 - timeLeft, jawaban }),
      });
      if (r.ok) {
        const j = await r.json();
        if (j.data) {
          setServerResult({
            nilai: j.data.nilai,
            jumlahBenar: j.data.jumlahBenar,
            jumlahSalah: j.data.jumlahSalah,
            totalSoal: j.data.totalSoal,
            jawabanBenar: j.data.jawabanBenar || {},
          });
        }
      }
    } catch (e) {
      console.error("Submit hasil gagal:", e);
      if (quiz.modeEvaluasi === "BELAJAR") {
        setServerResult({
          nilai: Math.round((hitungSkor() / totalSoal) * 100),
          jumlahBenar: hitungSkor(),
          jumlahSalah: totalSoal - hitungSkor(),
          totalSoal: totalSoal,
          jawabanBenar: {},
        });
      } else {
        setError("Gagal mengirim jawaban. Silakan coba lagi.");
        setQuizState("result");
      }
    }
  }, [quiz.id, quiz.durasiMenit, timeLeft, jawaban]);

  useEffect(() => {
    if (quizState === "result") submitHasil();
  }, [quizState, submitHasil]);

  const hitungSkor = useCallback(() => {
    let benar = 0;
    for (const s of shuffledSoal) {
      const jawab = jawaban[s.id];
      if (!jawab) continue;
      if (s.tipe === "PG") {
        if (jawab === s.kunci) benar++;
      } else {
        if (jawab.toLowerCase().trim() === s.kunci.toLowerCase().trim()) benar++;
      }
    }
    return benar;
  }, [shuffledSoal, jawaban]);

  const skor = serverResult ? serverResult.jumlahBenar : hitungSkor();
  const totalSoalDisplay = serverResult ? serverResult.totalSoal : totalSoal;
  const persentase = totalSoalDisplay > 0 ? Math.round((skor / totalSoalDisplay) * 100) : 0;

  function resultIcon(persentase: number) {
    if (persentase >= 90) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (persentase >= 70) return <ThumbsUp className="w-8 h-8 text-emerald-500" />;
    if (persentase >= 50) return <Smile className="w-8 h-8 text-amber-500" />;
    return <BookOpen className="w-8 h-8 text-primary" />;
  }

  function resultLabel(persentase: number) {
    if (persentase >= 90) return "Luar Biasa!";
    if (persentase >= 70) return "Bagus!";
    if (persentase >= 50) return "Cukup, Semangat!";
    return "Ayo Belajar Lagi!";
  }

  // ── INTRO ──
  if (quizState === "intro") {
    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
          className="text-center max-w-lg mx-auto"
        >
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl text-on-surface mb-3">Gagal Memulai</h2>
          <p className="text-on-surface-variant mb-8">{error}</p>
          <button
            onClick={startQuiz}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
          >
            <RotateCcw className="w-5 h-5" />
            Coba Lagi
          </button>
          <div className="mt-6">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          </div>
        </motion.div>
      );
    }
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
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <p className="font-heading text-2xl font-bold text-primary">{quiz.durasiMenit}</p>
              </div>
              <p className="text-xs text-on-surface-variant">Menit</p>
            </div>
          </div>
        </div>
        <button
          onClick={startQuiz}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
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
    const result = resultIcon(persentase);
    const label = resultLabel(persentase);

    if (showReview) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl text-on-surface">Review Jawaban</h2>
            <button onClick={() => setShowReview(false)} className="text-sm text-primary font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden">
              Kembali ke Skor
            </button>
          </div>
          <div className="space-y-6">
            {shuffledSoal.map((s, i) => {
              const userAnswer = jawaban[s.id];
              const correctAnswer = serverResult?.jawabanBenar[s.id] ?? s.kunci;
              const correct = s.tipe === "PG" ? userAnswer === correctAnswer : userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
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
                      <span className="text-xs text-on-surface-variant">{tipeLabel[s.tipe] ?? s.tipe} · </span>
                      <span className="text-on-surface font-medium"><MathRenderer text={s.pertanyaan} /></span>
                    </div>
                  </div>
                  {s.tipe === "PG" ? (
                    <div className="ml-8 space-y-2">
                      {opsiEntries.map(([key, val]) => {
                        let cls = "px-4 py-2.5 rounded-xl text-sm border transition-all";
                        if (key === correctAnswer) cls += " bg-green-50 border-green-300 text-green-800 font-semibold";
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
                        <MathRenderer text={correctAnswer} />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          <div className="text-center mt-10 space-y-4">
<button onClick={startQuiz} className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden">
              <RotateCcw className="w-5 h-5" /> Ulangi Kuis
            </button>
            <div>
              <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kuis
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_CURVE }} className="max-w-lg mx-auto text-center">
        <div className="mb-6 flex justify-center">{result}</div>
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        <h2 className="font-heading text-3xl md:text-4xl text-on-surface mb-2">{label}</h2>
        <p className="text-on-surface-variant mb-8">{quiz.judul}</p>
        <div className="bg-glass border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-glass mb-8">
          <div className="text-6xl font-heading font-bold text-primary mb-2">
            {skor}<span className="text-2xl text-on-surface-variant">/{totalSoalDisplay}</span>
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
              <p className="font-heading text-2xl font-bold text-red-600">{totalSoalDisplay - skor}</p>
              <p className="text-xs text-red-600/70">Salah</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={startQuiz} className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300">
            <RotateCcw className="w-5 h-5" /> Ulangi Kuis
          </button>
{quiz.modeEvaluasi === "BELAJAR" && (
            <button onClick={() => setShowReview(true)} className="inline-flex items-center gap-2 bg-white text-primary border-2 border-primary/20 px-8 py-4 rounded-full font-semibold hover:bg-primary/5 active:scale-[0.98] transition-all duration-300">
              <BookOpen className="w-5 h-5" /> Review Jawaban
            </button>
          )}
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

  const handleExit = () => {
    if (Object.keys(jawaban).length > 0) {
      if (!window.confirm("Kamu punya jawaban yang belum disimpan. Yakin mau keluar?")) return;
    }
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <QuizLockOverlay
        show={lock.showWarning}
        violations={lock.violations}
        maxViolations={3}
        mode={quiz.modeEvaluasi}
      />

      <div className="flex items-center justify-between mb-3">
        <button onClick={handleExit} className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-red-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Keluar
        </button>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full font-heading font-bold text-sm tabular-nums transition-colors duration-300",
          timeLeft < 60
            ? "bg-red-50 text-red-600 animate-pulse"
            : timeLeft < 300
              ? "bg-amber-50 text-amber-700"
              : "bg-primary/10 text-primary"
        )}>
          <Clock className="w-4 h-4" />
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-on-surface-variant">
            Soal {currentIndex + 1} dari {totalSoal}
          </span>
        </div>
        <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: EASE_CURVE }} className="h-full bg-primary rounded-full" />
        </div>
      </div>

      {timeLeft < 60 && timeLeft > 0 && (
        <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold text-center">
          ⚠️ Waktu hampir habis! Segera selesaikan kuis.
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={soal.nomor} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE_CURVE }}>
          <div className="bg-glass border border-border-precision rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-glass mb-6 min-h-[260px]">
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary mb-3">
              {tipeLabel[soal.tipe] ?? soal.tipe}
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
                    <button key={key} onClick={() => handleSelect(key)} disabled={showFeedback} className={cls + " focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"}>
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
                  <button onClick={handleIsianSubmit} disabled={!isianText.trim()} className="w-full bg-primary text-white px-4 py-3 rounded-full text-sm font-semibold hover:brightness-110 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden">
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
          <button onClick={handleNext} className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden">
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
                  if (selected) setJawaban((prev) => ({ ...prev, [soal.id]: selected }));
                  setSelected(null);
                  setIsianText("");
                  setShowFeedback(false);
                }
                setCurrentIndex(i);
              }}
              className={cn(
                "w-10 h-10 min-w-[44px] min-h-[44px] rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden",
                i === currentIndex && "bg-primary text-white scale-110",
                i !== currentIndex && jawaban[s.id] && "bg-emerald-100 text-emerald-700 border border-emerald-300",
                i !== currentIndex && !jawaban[s.id] && "bg-surface text-on-surface-variant border border-border-precision",
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