"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Sparkles, Upload, Users, ArrowRight, X } from "lucide-react";

const STEPS = [
  {
    id: "kursus",
    title: "Buat kursus pertamamu",
    desc: "Kursus adalah wadah untuk mengelompokkan materi, kuis, dan siswa.",
    icon: Sparkles,
    href: "/guru/buat",
  },
  {
    id: "upload",
    title: "Upload dokumen (PDF atau DOCX)",
    desc: "AI akan membuat draft materi, kuis, dan soal. Anda yang memutuskan.",
    icon: Upload,
    href: "/guru/upload",
  },
  {
    id: "kelas",
    title: "Buat kelas dan undang siswa",
    desc: "Tambahkan siswa ke kelas, atau import dari CSV untuk banyak siswa sekaligus.",
    icon: Users,
    href: "/guru/kelas",
  },
] as const;

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const auto = searchParams.get("step");
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Sync server state on mount; fallback to localStorage
  const syncFromServer = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/guru/onboarding", { credentials: "include" });
      if (res.ok) {
        const body = await res.json();
        const steps: string[] = body?.data?.completedSteps ?? body?.completedSteps ?? [];
        if (Array.isArray(steps) && steps.length > 0) {
          setCompleted(new Set(steps));
          try { window.localStorage.setItem("akal_onboarding_done", JSON.stringify(steps)); }
          catch { /* ignore */ }
          return;
        }
      }
    } catch {
      // offline — fall through to localStorage
    }
    // Fallback: read from localStorage
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("akal_onboarding_done");
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) setCompleted(new Set(parsed));
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("[onboarding] read localStorage failed:", error);
    }
  }, []);

  useEffect(() => {
    syncFromServer();
  }, [syncFromServer]);

  useEffect(() => {
    if (auto && (STEPS.find((s) => s.id === auto))) {
      // auto buka link step
    }
  }, [auto]);

  function markDone(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem("akal_onboarding_done", JSON.stringify([...next]));
      } catch (error) {
        console.error("[onboarding] write localStorage failed:", error);
      }
      // Sync with server (fire-and-forget)
      fetch("/api/v1/guru/onboarding", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: id }),
      }).catch((e) => { console.error("Onboarding sync failed:", e); });
      return next;
    });
  }

  function reset() {
    setCompleted(new Set());
    try {
      window.localStorage.removeItem("akal_onboarding_done");
    } catch (error) {
      console.error("[onboarding] remove localStorage failed:", error);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-badge text-primary">
            ONBOARDING
          </span>
          <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">
            Mulai dari sini, 3 langkah
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
            Ikuti panduan ini untuk menyiapkan ruang kerjamu. Anda bisa kembali ke sini kapan saja
            dari sidebar.
          </p>
        </div>
        {completed.size > 0 && (
          <button
            onClick={reset}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            Reset progres
          </button>
        )}
      </div>

      <div className="grid gap-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = completed.has(step.id);
          return (
            <div
              key={step.id}
              className={`bg-glass border rounded-2xl p-5 sm:p-6 shadow-glass flex items-start gap-4 ${
                done ? "border-emerald-300" : "border-border-precision"
              }`}
            >
              <span
                className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
                  done ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary"
                }`}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold tracking-wider text-on-surface-variant">
                    LANGKAH {i + 1}
                  </p>
                  {done && (
                    <span className="text-xs font-bold tracking-wider text-emerald-700">
                      SELESAI
                    </span>
                  )}
                </div>
                <p className="font-heading font-semibold text-on-surface mt-1">{step.title}</p>
                <p className="text-sm text-on-surface-variant mt-1">{step.desc}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={step.href}
                    onClick={() => markDone(step.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    {done ? "Lihat lagi" : "Mulai"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {!done && (
                    <button
                      onClick={() => markDone(step.id)}
                      className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary"
                    >
                      <X className="w-3 h-3" />
                      Tandai selesai
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {completed.size === STEPS.length && (
        <div className="mt-6 p-5 rounded-2xl border border-emerald-300 bg-emerald-50/40 text-emerald-900">
          <p className="font-heading font-semibold mb-1">Selamat, setup awal selesai!</p>
          <p className="text-sm">
            Ruang kerjamu siap. Langkah selanjutnya: publish kursus pertama, lalu undang siswa.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/guru/beranda"
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
            >
              Kembali ke Ringkasan
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/guru/profil"
              className="inline-flex items-center gap-2 bg-white text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/5 transition-colors"
            >
              Atur Profil
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
