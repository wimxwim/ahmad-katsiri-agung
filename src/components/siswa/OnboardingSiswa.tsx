"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { BookOpen, Search, Sparkles, X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "akal_siswa_onboarding_done";

const STEPS = [
  {
    icon: Search,
    color: "bg-blue-50 text-blue-600",
    title: "Cari Kursus",
    desc: "Klik tombol Katalog Kursus untuk lihat kursus yang tersedia. Pilih yang kamu suka!",
  },
  {
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
    title: "Baca Materi",
    desc: "Setelah punya kursus, buka halaman Materi. Baca dan pelajari materinya satu per satu.",
  },
  {
    icon: Sparkles,
    color: "bg-amber-50 text-amber-600",
    title: "Kerjakan Kuis",
    desc: "Setelah selesai baca, kerjakan kuisnya! Lihat skormu dan terus belajar sampai bisa.",
  },
];

export function OnboardingSiswa({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.4, ease: EASE_CURVE }}
          className="relative bg-white rounded-[32px] p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-border-precision"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-on-surface-variant/50 hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <p className="text-xs font-bold tracking-wider text-primary uppercase mb-2">
              {step + 1} dari {STEPS.length}
            </p>
            <h2 className="font-heading font-bold text-xl text-on-surface">
              Selamat Datang! 🎉
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Yuk ikuti 3 langkah mudah ini untuk mulai belajar
            </p>
          </div>

          <div className="flex gap-1.5 justify-center mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-primary" : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: EASE_CURVE }}
            className="text-center mb-6"
          >
            <div className={`w-16 h-16 rounded-2xl ${current.color} flex items-center justify-center mx-auto mb-4`}>
              <Icon className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-lg text-on-surface mb-2">
              {current.title}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {current.desc}
            </p>
          </motion.div>

          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 px-4 rounded-2xl border border-border-precision text-sm font-semibold text-on-surface-variant hover:bg-surface transition-colors cursor-pointer"
              >
                Sebelumnya
              </button>
            )}
            <button
              onClick={() => {
                if (isLast) {
                  localStorage.setItem(STORAGE_KEY, "true");
                  onClose();
                } else {
                  setStep(step + 1);
                }
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-primary text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLast ? "Siap Belajar!" : "Lanjut"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function useOnboardingSiswa() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  return { show, close: () => { setShow(false); localStorage.setItem(STORAGE_KEY, "true"); } };
}