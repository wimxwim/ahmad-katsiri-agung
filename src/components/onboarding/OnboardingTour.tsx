"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, CheckCircle2, BookOpen, ArrowRight, X, ChevronRight, ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Step {
  icon: typeof Upload;
  title: string;
  desc: string;
  action?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    icon: Upload,
    title: "Upload Dokumen",
    desc: "Upload PDF atau DOCX bahan ajar Anda. AI akan mengekstrak teks dan menghasilkan draft materi, quiz, dan soal.",
    action: { label: "Mulai Upload", href: "/guru/upload" },
  },
  {
    icon: FileText,
    title: "Tinjau Draft AI",
    desc: "AI menghasilkan draft dalam 2-3 menit. Anda bisa lihat, edit, dan approve setiap bagian sebelum publish.",
    action: { label: "Lihat Draft", href: "/guru/drafts" },
  },
  {
    icon: CheckCircle2,
    title: "Approve & Publish",
    desc: "Setelah semua bagian di-approve, klik 'Tutup Review'. Materi akan otomatis terbit ke katalog kursus.",
    action: { label: "Buka Kursus", href: "/guru/kursus" },
  },
  {
    icon: BookOpen,
    title: "Kelola Kelas & Siswa",
    desc: "Buat kelas, generate kode undangan 6-digit, dan pantau progres belajar siswa dari dashboard.",
    action: { label: "Buka Kelas", href: "/guru/kelas" },
  },
  {
    icon: ClipboardCheck,
    title: "Cari Nilai",
    desc: "Lihat rekap nilai per kursus, distribusi skor, dan export Excel 1-klik. Pantau ketuntasan KKM dari satu tempat.",
    action: { label: "Lihat Nilai", href: "/guru/nilai" },
  },
];

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const done = localStorage.getItem("akal_onboarding_done");
    if (!done && !dismissed) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  const complete = () => {
    localStorage.setItem("akal_onboarding_done", "1");
    setVisible(false);
    setDismissed(true);
  };

  const skip = () => {
    setVisible(false);
    setDismissed(true);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      complete();
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={skip} />

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative z-10 w-full max-w-lg bg-white rounded-[32px] shadow-glass-xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary/10">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          </div>

          <button
            onClick={skip}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-primary/5 text-on-surface-variant transition-colors"
            aria-label="Lewati onboarding"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-8 pt-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-full">
                LANGKAH {step + 1} DARI {STEPS.length}
              </span>
            </div>

            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Icon className="w-7 h-7" />
              </div>

              <h2 className="font-heading text-2xl font-bold text-on-surface">
                {current.title}
              </h2>

              <p className="text-on-surface-variant mt-2 leading-relaxed">
                {current.desc}
              </p>
            </motion.div>

            <div className="flex items-center gap-3 mt-8">
              {current.action && (
                <button
                  onClick={() => {
                    complete();
                    router.push(current.action!.href);
                  }}
                  className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  {current.action.label}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface transition-all"
              >
                {step < STEPS.length - 1 ? (
                  <>
                    Lanjut
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  "Selesai"
                )}
              </button>

              <div className="flex-1" />

              <button
                onClick={skip}
                className="text-xs text-on-surface-variant/60 hover:text-on-surface-variant transition-colors px-3 py-2"
              >
                Lewati
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-1.5 pb-4">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? "bg-primary w-6" : "bg-primary/20"
                }`}
                aria-label={`Langkah ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
