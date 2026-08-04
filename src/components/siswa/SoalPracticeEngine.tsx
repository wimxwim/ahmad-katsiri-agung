"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuizLock } from "@/hooks/useQuizLock";
import { QuizLockOverlay } from "@/components/siswa/QuizLockOverlay";

interface SoalData {
  id: string;
  nomor: number;
  pertanyaan: string;
  tipe: "PG" | "ISIAN" | "ESSAY";
  opsi: Record<string, string>;
  kunci: string;
}

interface BatchData {
  id: string;
  judul: string;
  totalSoal: number;
  soal: SoalData[];
}

type PracticeState = "intro" | "playing" | "result";

export function SoalPracticeEngine({ batch, onBack }: { batch: BatchData; onBack: () => void }) {
  const [state, setState] = useState<PracticeState>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<{ benar: number; salah: number; detail: { nomor: number; jawaban: string; kunci: string; benar: boolean }[] } | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number>(0);

  const lock = useQuizLock({
    enabled: state === "playing",
    mode: "PRACTICE",
    maxViolations: 5,
  });

  useEffect(() => {
    if (state !== "playing") {
      if (state === "result") return;
      setElapsedSeconds(0);
      return;
    }
    startTimeRef.current = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (state !== "result" || !results) return;
    const controller = new AbortController();
    fetch(`/api/v1/siswa/soal/${batch.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        durasiDetik: elapsedSeconds,
        jawaban: batch.soal.reduce((acc, s) => {
          acc[s.id] = jawaban[s.id] || "";
          return acc;
        }, {} as Record<string, string>),
      }),
      signal: controller.signal,
    }).catch(() => {});
    return () => controller.abort();
  }, [state, results]);

  const currentSoal = batch.soal[currentIndex];
  const totalSoal = batch.soal.length;

  const handleSelect = useCallback((soalId: string, value: string) => {
    setJawaban((prev) => ({ ...prev, [soalId]: value }));
    const correct = currentSoal.tipe === "ISIAN"
      ? value.toLowerCase().trim() === currentSoal.kunci.toLowerCase().trim()
      : value === currentSoal.kunci;
    setLastCorrect(correct);
    setShowFeedback(true);
  }, [currentSoal]);

  const handleNext = useCallback(() => {
    setShowFeedback(false);
    setLastCorrect(null);
    if (currentIndex < totalSoal - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate results
      let benar = 0;
      let salah = 0;
      const detail = batch.soal.map((s) => {
        const jwb = jawaban[s.id] || "";
        const correct = s.tipe === "ISIAN"
          ? jwb.toLowerCase().trim() === s.kunci.toLowerCase().trim()
          : jwb === s.kunci;
        if (correct) benar++;
        else salah++;
        return { nomor: s.nomor, jawaban: jwb, kunci: s.kunci, benar: correct };
      });
      setResults({ benar, salah, detail });
      setState("result");
    }
  }, [currentIndex, totalSoal, jawaban, batch.soal]);

  const handleJump = useCallback((index: number) => {
    setShowFeedback(false);
    setLastCorrect(null);
    setCurrentIndex(index);
  }, []);

  const handleRetry = useCallback(() => {
    setJawaban({});
    setCurrentIndex(0);
    setShowFeedback(false);
    setLastCorrect(null);
    setResults(null);
    setState("intro");
  }, []);

  if (state === "intro") {
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-8 shadow-glass-lg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-tertiary" />
          </div>
          <h1 className="font-heading font-bold text-xl text-on-surface mb-1">{batch.judul}</h1>
          <p className="text-sm text-on-surface-variant mb-6">Soal Latihan</p>

          <div className="grid grid-cols-2 gap-4 mb-8 max-w-xs mx-auto">
            <div className="bg-surface rounded-2xl p-4">
              <p className="text-2xl font-bold text-on-surface">{totalSoal}</p>
              <p className="text-xs text-on-surface-variant">Total Soal</p>
            </div>
            <div className="bg-surface rounded-2xl p-4">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-on-surface-variant" />
                <p className="text-2xl font-bold text-on-surface">∞</p>
              </div>
              <p className="text-xs text-on-surface-variant">Tanpa Batas Waktu</p>
            </div>
          </div>

          <div className="bg-tertiary/5 border border-tertiary/10 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-tertiary mb-2">Mode Latihan:</p>
            <ul className="text-xs text-on-surface-variant space-y-1">
              <li>✅ Feedback langsung setiap jawaban</li>
              <li>✅ Tidak ada batas waktu</li>
              <li>✅ Bisa loncat ke soal manapun</li>
              <li>✅ Bisa diulang berkali-kali</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 border border-border-precision text-on-surface-variant px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-surface active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <button
              onClick={() => setState("playing")}
              className="inline-flex items-center gap-2 bg-tertiary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <FileText className="w-4 h-4" />
              Mulai Latihan
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "result" && results) {
    const persen = Math.round((results.benar / totalSoal) * 100);
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-8 shadow-glass-lg">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${persen >= 70 ? "bg-emerald-100" : "bg-amber-100"}`}>
            {persen >= 70 ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            )}
          </div>
          <h1 className="font-heading font-bold text-2xl text-on-surface mb-1">Latihan Selesai!</h1>
          <p className="text-sm text-on-surface-variant">{batch.judul}</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6 max-w-sm mx-auto">
          <div className="bg-surface rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-on-surface">{totalSoal}</p>
            <p className="text-[10px] text-on-surface-variant">Total</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-700">{results.benar}</p>
            <p className="text-[10px] text-emerald-600">Benar</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-red-700">{results.salah}</p>
            <p className="text-[10px] text-red-600">Salah</p>
          </div>
          <div className="bg-surface rounded-2xl p-3 text-center">
            <p className="text-lg font-bold text-on-surface">{Math.floor(elapsedSeconds / 60)}</p>
            <p className="text-[10px] text-on-surface-variant">Menit</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-on-surface-variant mb-1">
            <span>Skor</span>
            <span>{persen}%</span>
          </div>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", persen >= 70 ? "bg-emerald-500" : "bg-amber-500")}
              style={{ width: `${persen}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {results.detail.map((d) => (
            <div key={d.nomor} className={cn("flex items-center gap-2 p-2 rounded-xl text-xs", d.benar ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800")}>
              {d.benar ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
              <span className="font-semibold">Soal {d.nomor}</span>
              {!d.benar && <span className="text-red-600">Jawaban: {d.kunci}</span>}
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 border border-border-precision text-on-surface-variant px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-surface active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 bg-tertiary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <FileText className="w-4 h-4" />
            Ulangi Latihan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-8 shadow-glass-lg">
      <QuizLockOverlay
        show={lock.showWarning}
        violations={lock.violations}
        maxViolations={5}
        mode="PRACTICE"
      />

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            if (Object.keys(jawaban).length > 0 && !window.confirm("Kamu punya jawaban yang belum selesai. Yakin mau keluar?")) return;
            onBack();
          }}
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Keluar
        </button>
        <div className="text-center">
          <p className="text-xs font-semibold text-on-surface-variant">Soal {currentIndex + 1} dari {totalSoal}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs tabular-nums text-on-surface-variant">
          <Clock className="w-3.5 h-3.5" />
          {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, "0")}
        </div>
      </div>

      <div className="w-full h-1.5 bg-surface rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-tertiary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalSoal) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: EASE_CURVE }}
        >
          <div className="mb-6">
            <h3 className="font-heading font-semibold text-on-surface mb-4 leading-relaxed">
              {currentSoal.pertanyaan}
            </h3>

            {currentSoal.tipe === "PG" && (
              <div className="space-y-2">
                {Object.entries(currentSoal.opsi).map(([key, value]) => {
                  const isSelected = jawaban[currentSoal.id] === key;
                  const isCorrect = key === currentSoal.kunci;
                  let bgClass = "bg-white border-border-precision hover:border-primary/30";
                  if (showFeedback && isSelected) {
                    bgClass = isCorrect ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300";
                  } else if (showFeedback && isCorrect) {
                    bgClass = "bg-emerald-50 border-emerald-300";
                  }
                  return (
                    <button
                      key={key}
                      onClick={() => !showFeedback && handleSelect(currentSoal.id, key)}
                      disabled={showFeedback}
                      className={cn("w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center gap-3", bgClass, !showFeedback && "cursor-pointer active:scale-[0.99]")}
                    >
                      <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0", isSelected ? "bg-primary text-white" : "bg-surface text-on-surface-variant")}>
                        {key}
                      </span>
                      <span className="text-on-surface">{value}</span>
                      {showFeedback && isSelected && (
                        isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 ml-auto shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {currentSoal.tipe === "ISIAN" && (
              <div>
                <input
                  type="text"
                  value={jawaban[currentSoal.id] || ""}
                  onChange={(e) => setJawaban((prev) => ({ ...prev, [currentSoal.id]: e.target.value }))}
                  disabled={showFeedback}
                  placeholder="Tulis jawabanmu..."
                  className="w-full p-3.5 rounded-xl border border-border-precision bg-white text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:border-primary/40"
                />
                {!showFeedback && (
                  <button
                    onClick={() => handleSelect(currentSoal.id, jawaban[currentSoal.id] || "")}
                    disabled={!jawaban[currentSoal.id]}
                    className="mt-3 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 disabled:opacity-30 transition-all"
                  >
                    Periksa Jawaban
                  </button>
                )}
              </div>
            )}

            {currentSoal.tipe === "ESSAY" && (
              <div>
                <textarea
                  value={jawaban[currentSoal.id] || ""}
                  onChange={(e) => setJawaban((prev) => ({ ...prev, [currentSoal.id]: e.target.value }))}
                  disabled={showFeedback}
                  placeholder="Tulis jawaban essay kamu di sini..."
                  className="w-full p-3.5 rounded-xl border border-border-precision bg-white text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:border-primary/40 min-h-[120px]"
                  rows={5}
                />
                {!showFeedback && (
                  <button
                    onClick={() => handleSelect(currentSoal.id, jawaban[currentSoal.id] || "")}
                    disabled={!jawaban[currentSoal.id]}
                    className="mt-3 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 disabled:opacity-30 transition-all"
                  >
                    Periksa Jawaban
                  </button>
                )}
              </div>
            )}

            {showFeedback && (
              <div className={cn("mt-4 p-3 rounded-xl text-sm", lastCorrect ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200")}>
                {lastCorrect ? (
                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Benar! Jawabannya: <strong>{currentSoal.kunci}</strong></p>
                ) : (
                  <p className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Jawaban yang benar: <strong>{currentSoal.kunci}</strong></p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {showFeedback && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 bg-tertiary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {currentIndex < totalSoal - 1 ? "Lanjut" : "Lihat Hasil"}
          </button>
        </div>
      )}

      {!showFeedback && (
        <div className="mt-6">
          <p className="text-xs text-on-surface-variant mb-2">Loncat ke soal:</p>
          <div className="flex flex-wrap gap-1.5">
            {batch.soal.map((s, i) => (
              <button
                key={s.id}
                onClick={() => handleJump(i)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                  i === currentIndex ? "bg-tertiary text-white" : jawaban[s.id] ? "bg-emerald-100 text-emerald-700" : "bg-surface text-on-surface-variant hover:bg-tertiary/10"
                )}
              >
                {s.nomor}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}