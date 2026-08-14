"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { CheckCircle2, Sparkles, Upload, Users, ArrowRight, X, AlertCircle, Loader2 } from "lucide-react";
import { csrfHeaders } from "@/lib/csrf";

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

interface DashboardCheck {
  totalKursus: number;
  draftMenunggu: number;
  totalMateriPublished: number;
  totalSiswa: number;
}

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const auto = searchParams.get("step");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [realVerified, setRealVerified] = useState<Record<string, boolean>>({ kursus: false, upload: false, kelas: false });
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState("");

  // Sync server state on mount; fallback to localStorage
  const syncFromServer = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/guru/onboarding", { credentials: "include" });
      if (res.ok) {
        const body = await res.json();
        const steps: string[] = body?.data?.completedStepKeys ?? body?.completedStepKeys ?? [];
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

  // F10-5 Onboarding terverifikasi — cek real via API dashboard/beranda, bukan localStorage saja
  // firstCourseCreated = kursusCount >0, firstMaterialUploaded = fileMateri count >0, firstAiGenerated = aiGeneration count >0
  const verifyRealProgress = useCallback(async () => {
    setVerifying(true);
    setVerifyError("");
    try {
      const [dashRes, draftsRes, kelasRes] = await Promise.allSettled([
        fetch("/api/v1/guru/dashboard", { credentials: "include" }).then((r) => r.ok ? r.json() : null),
        fetch("/api/v1/guru/drafts", { credentials: "include" }).then((r) => r.ok ? r.json() : null),
        fetch("/api/v1/kelas", { credentials: "include" }).then((r) => r.ok ? r.json() : null),
      ]);

      let kursusCount = 0;
      let draftCount = 0;
      let aiGeneratedCount = 0;
      let kelasCount = 0;

      if (dashRes.status === "fulfilled" && dashRes.value?.data) {
        const d = dashRes.value.data as DashboardCheck;
        kursusCount = d.totalKursus ?? 0;
        // draftMenunggu + published sebagai proxy fileMateri/aiGeneration
        draftCount = (d.draftMenunggu ?? 0) + (d.totalMateriPublished ?? 0);
        aiGeneratedCount = (d.totalMateriPublished ?? 0) + (d.draftMenunggu ?? 0);
      }

      if (draftsRes.status === "fulfilled" && draftsRes.value?.data) {
        const drafts = draftsRes.value.data as unknown[];
        if (Array.isArray(drafts)) {
          draftCount = drafts.length;
          aiGeneratedCount = drafts.length;
        }
      }

      if (kelasRes.status === "fulfilled" && kelasRes.value?.data) {
        const kelasData = kelasRes.value.data;
        if (Array.isArray(kelasData)) kelasCount = kelasData.length;
        else if (Array.isArray(kelasRes.value)) kelasCount = (kelasRes.value as unknown[]).length;
      } else if (dashRes.status === "fulfilled" && dashRes.value?.data) {
        // fallback: jika kelas API tidak ada, gunakan totalSiswa sebagai proxy kelas dibuat
        kelasCount = (dashRes.value.data as DashboardCheck).totalSiswa ?? 0;
      }

      const firstCourseCreated = kursusCount > 0;
      const firstMaterialUploaded = draftCount > 0;
      const firstAiGenerated = aiGeneratedCount > 0;
      // kelas step: jika ada kelas atau ada siswa terundang
      const firstKelasCreated = kelasCount > 0;

      setRealVerified({
        kursus: firstCourseCreated,
        upload: firstMaterialUploaded || firstAiGenerated,
        kelas: firstKelasCreated,
      });

      // Auto-sync verified ke server jika ada yang real done tapi belum di completed
      const verifiedKeys: string[] = [];
      if (firstCourseCreated) verifiedKeys.push("kursus");
      if (firstMaterialUploaded || firstAiGenerated) verifiedKeys.push("upload");
      if (firstKelasCreated) verifiedKeys.push("kelas");

      if (verifiedKeys.length > 0) {
        setCompleted((prev) => {
          const next = new Set(prev);
          let changed = false;
          for (const k of verifiedKeys) {
            if (!next.has(k)) { next.add(k); changed = true; }
          }
          if (changed) {
            try { window.localStorage.setItem("akal_onboarding_done", JSON.stringify([...next])); } catch {}
            // sync ke server fire-and-forget untuk tiap key baru
            for (const k of verifiedKeys) {
              if (!prev.has(k)) {
                fetch("/api/v1/guru/onboarding", {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json", ...csrfHeaders() },
                  body: JSON.stringify({ step: k }),
                }).catch(() => {});
              }
            }
          }
          return next;
        });
      }
    } catch (e) {
      setVerifyError("Gagal memverifikasi progres — coba refresh.");
      if (process.env.NODE_ENV !== "production") console.error("[onboarding] verifyRealProgress failed:", e);
    } finally {
      setVerifying(false);
    }
  }, []);

  useEffect(() => {
    syncFromServer();
    verifyRealProgress();
  }, [syncFromServer, verifyRealProgress]);

  useEffect(() => {
    if (auto && (STEPS.find((s) => s.id === auto))) {
      // auto buka link step
    }
  }, [auto]);

  function markDone(id: string) {
    // F10-5: ganti Tandai selesai palsu -> cek real terlebih dahulu
    const isRealDone = realVerified[id];
    if (!isRealDone) {
      setVerifyError(`Langkah "${STEPS.find(s=>s.id===id)?.title}" belum terverifikasi — selesaikan dulu (${id === "kursus" ? "buat kursus" : id === "upload" ? "upload dokumen" : "buat kelas"}), lalu refresh.`);
      // tetap trigger verify ulang
      verifyRealProgress();
      return;
    }
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
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
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

  const allVerifiedDone = STEPS.every((s) => realVerified[s.id]);

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
            dari sidebar. Progres terverifikasi otomatis dari data kursus, materi, dan kelas.
          </p>
          {verifying && (
            <p className="text-xs text-on-surface-variant mt-2 inline-flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memverifikasi progres...
            </p>
          )}
          {verifyError && (
            <p className="text-xs text-amber-700 mt-2 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
              <AlertCircle className="w-3.5 h-3.5" /> {verifyError}
            </p>
          )}
          {!verifying && allVerifiedDone && (
            <p className="text-xs font-semibold text-emerald-700 mt-2 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Semua langkah terverifikasi
            </p>
          )}
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

      <motion.div className="grid gap-3" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isVerified = realVerified[step.id];
          const isMarked = completed.has(step.id);
          const done = isVerified || isMarked;
          return (
            <motion.div
              key={step.id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}
              className={`bg-glass border rounded-[32px] p-5 sm:p-6 shadow-glass flex items-start gap-4 ${
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
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-bold tracking-wider text-on-surface-variant">
                    LANGKAH {i + 1}
                  </p>
                  {isVerified && (
                    <span className="text-xs font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      TERVERIFIKASI
                    </span>
                  )}
                  {done && !isVerified && (
                    <span className="text-xs font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      DITANDAI
                    </span>
                  )}
                  {!done && !verifying && (
                    <span className="text-xs font-bold tracking-wider text-on-surface-variant/60">
                      BELUM SELESAI
                    </span>
                  )}
                </div>
                <p className="font-heading font-semibold text-on-surface mt-1">{step.title}</p>
                <p className="text-sm text-on-surface-variant mt-1">{step.desc}</p>
                {!isVerified && !verifying && (
                  <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    Belum terverifikasi — {step.id === "kursus" ? "buat 1 kursus di /guru/buat" : step.id === "upload" ? "upload 1 dokumen di /guru/upload" : "buat 1 kelas di /guru/kelas"} lalu refresh halaman ini.
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Link
                    href={step.href}
                    onClick={() => { if (isVerified) markDone(step.id); }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    {done ? "Lihat lagi" : "Mulai"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {!done && (
                    <button
                      onClick={() => markDone(step.id)}
                      className={`inline-flex items-center gap-1 text-xs ${isVerified ? "text-on-surface-variant hover:text-primary" : "text-on-surface-variant/50 cursor-not-allowed"}`}
                      disabled={!isVerified && !verifying}
                      title={isVerified ? "Tandai selesai (terverifikasi)" : "Selesaikan langkah dulu — akan diverifikasi otomatis"}
                    >
                      <X className="w-3 h-3" />
                      {isVerified ? "Tandai selesai" : "Tandai selesai (butuh verifikasi)"}
                    </button>
                  )}
                  {isVerified && !isMarked && (
                    <span className="text-xs text-emerald-700">Terverifikasi otomatis — klik Tandai selesai untuk sinkron.</span>
                  )}
                </div>
              </div>
              </motion.div>
          );
        })}
      </motion.div>

      {(completed.size === STEPS.length || allVerifiedDone) && (
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
