"use client";

import {
  BookOpen,
  Clock,
  AlertCircle,
  ClipboardList,
  GraduationCap,
  FileCheck,
  Users,
  ArrowRight,
  Sparkles,
  Upload,
  Layers,
  Zap,
  Eye,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api-helpers";
import { cn } from "@/lib/utils";

interface DashboardData {
  totalKursus: number;
  totalSiswa: number;
  draftMenunggu: number;
  siswaBelumMengerjakan: number;
  totalKuisDikerjakan: number;
  totalMateriPublished: number;
  totalQuizPublished: number;
  kursusList: { id: string; judul: string; slug: string; deskripsi: string | null; statusPublikasi: string }[];
  weakTopics: { pertanyaan: string; errorRate: number; totalJawab: number }[];
  aiQuotaUsed: number;
  aiQuotaLimit: number;
  siswaBerisiko: number;
  siswaKritis: number;
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-amber-50 text-amber-700" },
  PUBLIK: { label: "Publik", color: "bg-emerald-50 text-emerald-700" },
  ARSIP: { label: "Arsip", color: "bg-surface text-on-surface-variant" },
};

const QUICK_ACTIONS = [
  { label: "Upload Materi", href: "/guru/upload", icon: Upload, desc: "PDF/DOCX untuk AI" },
  { label: "Kelola Kelas", href: "/guru/kelas", icon: Layers, desc: "Atur kelas & siswa" },
  { label: "Lihat Siswa", href: "/guru/siswa", icon: Users, desc: "Progres & nilai" },
  { label: "Buat Kuis", href: "/guru/buat", icon: ClipboardList, desc: "Kuis manual" },
] as { label: string; href: string; icon: React.ElementType; desc: string }[];

interface OnboardingData {
  completedSteps: number;
  totalSteps: number;
  isComplete: boolean;
  steps: { key: string; label: string; done: boolean }[];
  currentStep: string;
}

const SPRING_CONFIG = { type: "spring" as const, stiffness: 100, damping: 20 };

function AnimatedNumber({ value, duration }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const dur = duration ?? 1.2;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current && prevValue.current === value) {
      setDisplay(value);
      return;
    }
    const start = prevValue.current;
    const diff = value - start;
    let raf = 0;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (dur * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    prevValue.current = value;
    hasAnimated.current = true;
    return () => cancelAnimationFrame(raf);
  }, [value, dur]);

  return <>{display}</>;
}

function StatRailCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="shrink-0 w-[70vw] max-w-[200px] snap-start">
      <div className="bg-glass border border-border-precision rounded-2xl p-4 shadow-glass">
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}14` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            {label}
          </span>
        </div>
        <p className="font-heading text-2xl font-bold text-on-surface tabular-nums">
          <AnimatedNumber value={value} duration={0.8} />
        </p>
      </div>
    </div>
  );
}

function WelcomeEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_CURVE }}
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-tertiary/[0.03] rounded-[40px]" />
      <div className="relative bg-glass border border-border-precision rounded-[40px] p-8 sm:p-10 shadow-glass text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING_CONFIG, delay: 0.15 }}
          className="w-20 h-20 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-6"
        >
          <BookOpen className="w-10 h-10" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="font-heading text-2xl font-bold text-on-surface mb-3"
        >
          Selamat datang di Ruang Guru
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-sm text-on-surface-variant max-w-md mx-auto mb-8"
        >
          Ubah dokumen pembelajaran jadi materi, kuis, dan soal siap pakai. Mulai dengan langkah pertama di bawah ini.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/guru/upload"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:brightness-110 transition-all shadow-glass"
          >
            <Upload className="w-4 h-4" />
            Upload Dokumen Pertama
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/guru/buat"
            className="inline-flex items-center gap-2 bg-glass border border-border-precision text-on-surface px-6 py-3 rounded-full text-sm font-semibold hover:shadow-glass-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Buat Kursus Manual
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

function AnimatedSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-20 bg-primary/5 rounded-lg animate-pulse" />
        <div className="h-7 w-48 bg-primary/5 rounded-lg animate-pulse" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shrink-0 w-[70vw] max-w-[200px] bg-glass rounded-2xl p-4 h-24 animate-pulse border border-border-precision" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-3.5 h-16 animate-pulse border border-border-precision" />
        ))}
      </div>
      <div className="bg-glass rounded-card p-5 h-44 animate-pulse border border-border-precision" />
      <div className="bg-glass rounded-card p-5 h-44 animate-pulse border border-border-precision" />
    </div>
  );
}

export default function GuruBerandaPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onboardExpanded, setOnboardExpanded] = useState(false);
  const aliveRef = useRef(true);
  const retryCount = useRef(0);

  async function fetchData() {
    const [dashResult, onboardResult] = await Promise.all([
      apiFetch<DashboardData>("/api/v1/guru/dashboard"),
      apiFetch<OnboardingData>("/api/v1/guru/onboarding"),
    ]);
    if (!aliveRef.current) return;
    if (!dashResult.ok) {
      if (retryCount.current < 2 && (dashResult.status === 401 || dashResult.status >= 500)) {
        retryCount.current++;
        await new Promise((r) => setTimeout(r, 400 * retryCount.current));
        return fetchData();
      }
      setError(dashResult.error);
    } else {
      setData(dashResult.data ?? null);
    }
    if (onboardResult.ok && onboardResult.data) {
      setOnboarding(onboardResult.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    aliveRef.current = true;
    fetchData();
    return () => { aliveRef.current = false; };
  }, []);

  if (loading) return <AnimatedSkeleton />;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_CURVE }}
        className="text-center py-16"
      >
        <span className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 grid place-items-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </span>
        <p className="text-red-600 font-semibold mb-2">Gagal memuat data</p>
        <p className="text-sm text-on-surface-variant mb-4">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError("");
            retryCount.current = 0;
            fetchData();
          }}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
        >
          Coba lagi
        </button>
      </motion.div>
    );
  }

  if (!data || data.totalKursus === 0) {
    return <WelcomeEmptyState />;
  }

  const hasDraftPriority = data.draftMenunggu > 0;
  const hasStudentAlert = data.siswaBelumMengerjakan > 0 || data.siswaBerisiko > 0 || data.siswaKritis > 0;
  const nextStep = onboarding?.steps.find((s) => !s.done);

  return (
    <div className="space-y-5">
      {onboarding && !onboarding.isComplete && nextStep && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE }}
          className="p-3 rounded-2xl border border-primary/15 bg-primary/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Rocket className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-on-surface truncate">
                  {onboarding.completedSteps}/{onboarding.totalSteps} langkah — {nextStep.label}
                </p>
                <div className="h-1.5 bg-black/5 rounded-full overflow-hidden mt-1.5 max-w-[160px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(onboarding.completedSteps / onboarding.totalSteps) * 100}%` }}
                    transition={{ duration: 0.8, ease: EASE_CURVE }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/guru/onboarding"
                className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
              >
                Lanjutkan
              </Link>
              <button
                onClick={() => setOnboardExpanded(!onboardExpanded)}
                className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label={onboardExpanded ? "Sembunyikan detail" : "Lihat semua langkah"}
              >
                <ChevronDown
                  className={cn("w-4 h-4 transition-transform", onboardExpanded && "rotate-180")}
                />
              </button>
            </div>
          </div>
          {onboardExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 grid grid-cols-2 gap-1.5"
            >
              {onboarding.steps.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  {s.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-on-surface-variant/30 shrink-0" />
                  )}
                  <span className={cn("text-xs", s.done ? "text-emerald-700" : "text-on-surface-variant")}>
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {(hasDraftPriority || hasStudentAlert) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE }}
          className="space-y-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
            Perlu tindakan
          </span>

          {hasDraftPriority && (
            <Link
              href="/guru/drafts"
              className="flex items-center gap-3 bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 active:scale-[0.99] transition-all duration-200"
            >
              <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-900 text-sm">
                  {data.draftMenunggu} draft AI perlu direview
                </p>
                <p className="text-xs text-amber-700">Selesaikan review agar bisa dipublikasikan</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-700 shrink-0" />
            </Link>
          )}

          {hasStudentAlert && (
            <Link
              href="/guru/siswa"
              className="flex items-center gap-3 bg-red-50/70 border border-red-200 rounded-2xl p-3.5 active:scale-[0.99] transition-all duration-200"
            >
              <span className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-red-900 text-sm">
                  {data.siswaBelumMengerjakan > 0
                    ? `${data.siswaBelumMengerjakan} siswa belum mengerjakan kuis`
                    : `${data.siswaBerisiko + data.siswaKritis} siswa perlu perhatian`}
                </p>
                <p className="text-xs text-red-700">Pantau di halaman siswa</p>
              </div>
              <ArrowRight className="w-4 h-4 text-red-700 shrink-0" />
            </Link>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Ruang Kerja</span>
            <h1 className="font-heading font-bold text-xl text-on-surface">Ringkasan</h1>
          </div>
          <div className="flex items-center gap-2">
            {data.aiQuotaLimit > 0 && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold",
                  data.aiQuotaUsed >= data.aiQuotaLimit
                    ? "bg-red-50 text-red-700"
                    : data.aiQuotaUsed >= data.aiQuotaLimit * 0.8
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700",
                )}
              >
                <Zap className="w-3 h-3" />
                AI {data.aiQuotaUsed}/{data.aiQuotaLimit}
              </div>
            )}
            <Link
              href="/guru/buat"
              className="inline-flex items-center gap-1.5 bg-primary text-white px-3.5 py-2 rounded-full text-xs font-semibold hover:brightness-110 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Buat Kursus
            </Link>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant">
          Kelola kursus, siswa, dan draft AI dari satu tempat.
        </p>
      </motion.div>

      <div className="overflow-x-auto -mx-3 px-3 scrollbar-none snap-x snap-mandatory">
        <div className="flex gap-3">
          <StatRailCard label="Kursus" value={data.totalKursus} icon={BookOpen} color="#005231" />
          <StatRailCard label="Siswa" value={data.totalSiswa} icon={Users} color="#005231" />
          <StatRailCard label="Draft AI" value={data.draftMenunggu} icon={FileCheck} color="#5a4200" />
          <StatRailCard label="Materi Terbit" value={data.totalMateriPublished} icon={GraduationCap} color="#005231" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.1 }}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2 block">
          Aksi Cepat
        </span>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((qa) => (
            <Link
              key={qa.label}
              href={qa.href}
              className="group flex items-center gap-2.5 bg-glass border border-border-precision rounded-2xl p-3 shadow-glass hover:bg-white/80 hover:border-primary/25 hover:shadow-glass-lg active:scale-[0.99] transition-all duration-200"
            >
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <qa.icon className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-on-surface truncate">{qa.label}</p>
                <p className="text-[10px] text-on-surface-variant truncate">{qa.desc}</p>
              </div>
              <ChevronRight className="w-3 h-3 text-on-surface-variant/30 group-hover:text-on-surface-variant group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Draft AI</span>
          <Link
            href="/guru/drafts"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Lihat semua
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4 shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-on-surface">
              {data.draftMenunggu} draft menunggu review
            </h3>
          </div>
          <div className="h-2 bg-black/5 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((data.draftMenunggu / 5) * 100, 100)}%` }}
              transition={{ duration: 1, ease: EASE_CURVE }}
              className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
            />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { key: "upload", label: "Diunggah", icon: Upload },
              { key: "extract", label: "Ekstraksi", icon: FileText },
              { key: "generate", label: "AI", icon: Sparkles },
              { key: "review", label: "Review", icon: Eye },
            ].map((stage, i) => {
              const isActive = i < Math.min(data.draftMenunggu, 4);
              return (
                <div
                  key={stage.key}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl",
                    isActive ? "bg-primary/5" : "bg-black/[0.02]",
                  )}
                >
                  <stage.icon
                    className={cn(
                      "w-3.5 h-3.5",
                      isActive ? "text-primary" : "text-on-surface-variant/30",
                    )}
                  />
                  <span className={cn(
                    "text-[9px] font-semibold",
                    isActive ? "text-primary" : "text-on-surface-variant/30",
                  )}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Link
            href="/guru/drafts"
            className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary hover:underline"
          >
            Review Draft
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Kursus</span>
            <h2 className="font-heading font-semibold text-on-surface">Kursus Terbaru</h2>
          </div>
          <Link
            href="/guru/kursus"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Semua
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {data.kursusList.slice(0, 3).map((k) => {
            const badge = STATUS_BADGE[k.statusPublikasi] || STATUS_BADGE.DRAFT;
            return (
              <Link
                key={k.id}
                href={`/guru/kursus/${k.id}`}
                className="bg-glass border border-border-precision rounded-2xl p-3.5 shadow-glass hover:bg-white/80 hover:border-primary/25 active:scale-[0.99] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-on-surface truncate">{k.judul}</h3>
                    <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                      {k.deskripsi || "Tanpa deskripsi"}
                    </p>
                  </div>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {(data.weakTopics.length > 0 || data.siswaBerisiko > 0 || data.siswaKritis > 0 || data.siswaBelumMengerjakan > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-tertiary">Insight Siswa</span>
            <Link
              href="/guru/analytics"
              className="text-xs font-semibold text-tertiary hover:underline flex items-center gap-1"
            >
              Analytics
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-glass border border-border-precision rounded-2xl p-4 shadow-glass space-y-2">
            {data.siswaBelumMengerjakan > 0 && (
              <div className="flex items-center gap-3 bg-blue-50/60 rounded-xl px-3 py-2.5">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900">{data.siswaBelumMengerjakan} siswa</p>
                  <p className="text-xs text-blue-600">belum mengerjakan kuis</p>
                </div>
              </div>
            )}
            {(data.siswaBerisiko > 0 || data.siswaKritis > 0) && (
              <div className="flex items-center gap-3 bg-red-50/60 rounded-xl px-3 py-2.5">
                <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-900">
                    {data.siswaKritis + data.siswaBerisiko} siswa
                  </p>
                  <p className="text-xs text-red-600">
                    {data.siswaKritis > 0 && `${data.siswaKritis} kritis`}
                    {data.siswaKritis > 0 && data.siswaBerisiko > 0 && ", "}
                    {data.siswaBerisiko > 0 && `${data.siswaBerisiko} berisiko`}
                  </p>
                </div>
              </div>
            )}
            {data.weakTopics.slice(0, 3).map((t, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/60 rounded-xl px-3 py-2.5">
                <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-red-900 truncate">{t.pertanyaan}</p>
                  <p className="text-xs text-red-600">{t.totalJawab} siswa menjawab</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-red-700">{t.errorRate}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}