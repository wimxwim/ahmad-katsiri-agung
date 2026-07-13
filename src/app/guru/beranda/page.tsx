"use client";

import {
  BookOpen,
  Clock,
  AlertCircle,
  ClipboardList,
  GraduationCap,
  FileCheck,
  Users,
  Circle,
  ArrowRight,
  Sparkles,
  Upload,
  Rocket,
  Zap,
  Layers,
  UserPlus,
  CheckCircle2,
  FileText,
  PenLine,
  Eye,
  ChevronRight,
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
  { label: "Upload Dokumen", href: "/guru/upload", icon: Upload, desc: "PDF/DOCX untuk draft AI" },
  { label: "Buat Manual", href: "/guru/buat", icon: PenLine, desc: "Tulis materi tanpa AI" },
  { label: "Kelola Kelas", href: "/guru/kelas", icon: Layers, desc: "Atur kelas & siswa" },
  { label: "Daftar Siswa", href: "/guru/siswa", icon: Users, desc: "Lihat progres siswa" },
  { label: "Buat Kuis", href: "/guru/buat", icon: ClipboardList, desc: "Kuis baru manual" },
  { label: "Undang Siswa", href: "/guru/kelas", icon: UserPlus, desc: "Kelola keanggotaan kelas" },
] as { label: string; href: string; icon: React.ElementType; desc: string }[];

interface OnboardingData {
  completedSteps: number;
  totalSteps: number;
  isComplete: boolean;
  steps: { key: string; label: string; done: boolean }[];
  currentStep: string;
}

const SPRING_CONFIG = { type: "spring" as const, stiffness: 100, damping: 20 };
const STAGGER = { staggerChildren: 0.08 };

function AnimatedNumber({ value, duration }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const dur = duration ?? 1.2;

  useEffect(() => {
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
    return () => cancelAnimationFrame(raf);
  }, [value, dur]);

  return <>{display}</>;
}

interface DoubleBezelStatProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}

function DoubleBezelStatCard({ label, value, icon: Icon, color, delay = 0 }: DoubleBezelStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING_CONFIG, delay }}
      className="relative group"
    >
      <div className="absolute inset-0 rounded-card bg-gradient-to-br from-white/40 to-transparent border border-border-precision shadow-glass" />
      <motion.div
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay * 0.3 }}
        className="relative rounded-card bg-glass backdrop-blur-2xl p-5"
      >
        <div className="rounded-portal bg-gradient-to-br from-primary/[0.04] to-transparent border border-primary/[0.08] p-4">
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}14` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: delay * 0.4 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
          <p className="font-heading text-3xl font-bold text-on-surface tabular-nums">
            <AnimatedNumber value={value} duration={1} />
          </p>
          <p className="text-xs text-on-surface-variant mt-1 font-medium uppercase tracking-wider">
            {label}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuickActionCard({
  item,
  index,
}: {
  item: (typeof QUICK_ACTIONS)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING_CONFIG, delay: 0.05 * index + 0.15 }}
    >
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{
          duration: 2.5 + index * 0.3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2,
        }}
      >
        <Link
          href={item.href}
          className="group flex items-center gap-3 bg-glass border border-border-precision rounded-2xl p-3.5 shadow-glass hover:shadow-glass-lg hover:border-primary/20 transition-all duration-300"
        >
          <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <item.icon className="w-4 h-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-on-surface truncate">{item.label}</p>
            <p className="text-xs text-on-surface-variant truncate">{item.desc}</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/40 group-hover:text-on-surface-variant group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

const PIPELINE_STAGES = [
  { key: "upload", label: "Diunggah", icon: Upload },
  { key: "extract", label: "Ekstraksi", icon: FileText },
  { key: "generate", label: "Generasi AI", icon: Sparkles },
  { key: "review", label: "Review", icon: Eye },
] as const;

function DraftPipelineCard({
  draftCount,
  delay,
}: {
  draftCount: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING_CONFIG, delay: delay ?? 0.25 }}
      className="bg-glass border border-border-precision rounded-card p-5 shadow-glass"
    >
      <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-2">
        Draft Pipeline
      </span>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-on-surface">
          {draftCount} draft menunggu
        </h3>
        <Link
          href="/guru/drafts"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          Lihat semua
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="relative mb-4">
        <div className="h-2 bg-black/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((draftCount / 5) * 100, 100)}%` }}
            transition={{ duration: 1.2, ease: EASE_CURVE, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PIPELINE_STAGES.map((stage, i) => {
          const isActive = i < Math.min(draftCount, 4);
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_CONFIG, delay: 0.4 + i * 0.08 }}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors",
                isActive ? "bg-primary/5" : "bg-black/[0.02]"
              )}
            >
              <span
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isActive ? "bg-primary/10 text-primary" : "bg-black/5 text-on-surface-variant/40"
                )}
              >
                <stage.icon className="w-3.5 h-3.5" />
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  isActive ? "text-primary" : "text-on-surface-variant/40"
                )}
              >
                {stage.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function StudentInsightCard({
  weakTopics,
  siswaBerisiko,
  siswaKritis,
  siswaBelumMengerjakan,
  delay,
}: {
  weakTopics: DashboardData["weakTopics"];
  siswaBerisiko: number;
  siswaKritis: number;
  siswaBelumMengerjakan: number;
  delay?: number;
}) {
  const hasData = weakTopics.length > 0 || siswaBerisiko > 0 || siswaKritis > 0 || siswaBelumMengerjakan > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING_CONFIG, delay: delay ?? 0.3 }}
      className="bg-glass border border-border-precision rounded-card p-5 shadow-glass"
    >
      <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-tertiary mb-2">
        Insight Siswa
      </span>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-on-surface">
          Perlu perhatian
        </h3>
        <Link
          href="/guru/analytics"
          className="text-xs font-semibold text-tertiary hover:underline flex items-center gap-1"
        >
          Analytics
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {!hasData ? (
        <p className="text-sm text-on-surface-variant py-3">
          Belum ada data insight. Insight akan muncul saat siswa mulai mengerjakan kuis.
        </p>
      ) : (
        <motion.div variants={{ visible: { transition: STAGGER } }} initial="hidden" animate="visible" className="space-y-3">
          {siswaBelumMengerjakan > 0 && (
            <motion.div
              variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
              className="flex items-center gap-3 bg-blue-50/60 rounded-xl px-4 py-2.5"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900">{siswaBelumMengerjakan} siswa</p>
                <p className="text-xs text-blue-600">belum mengerjakan kuis</p>
              </div>
            </motion.div>
          )}

          {(siswaBerisiko > 0 || siswaKritis > 0) && (
            <motion.div
              variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
              className="flex items-center gap-3 bg-red-50/60 rounded-xl px-4 py-2.5"
            >
              <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-900">
                  {siswaKritis + siswaBerisiko} siswa
                </p>
                <p className="text-xs text-red-600">
                  {siswaKritis > 0 && `${siswaKritis} kritis`}
                  {siswaKritis > 0 && siswaBerisiko > 0 && ", "}
                  {siswaBerisiko > 0 && `${siswaBerisiko} berisiko`}
                </p>
              </div>
            </motion.div>
          )}

          {weakTopics.length > 0 && (
            <motion.div
              variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
              className="space-y-2"
            >
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">
                Topik tersulit
              </p>
              {weakTopics.slice(0, 3).map((t, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/60 rounded-xl px-4 py-2.5">
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
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left"
        >
          {[
            { step: 1, title: "Upload Dokumen", desc: "PDF atau DOCX pembelajaran kamu" },
            { step: 2, title: "AI Buat Draft", desc: "Materi, kuis, dan soal otomatis" },
            { step: 3, title: "Review & Terbitkan", desc: "Kamu yang memutuskan hasil akhir" },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.1 }}
              className="flex gap-3 p-4 rounded-2xl bg-white/40"
            >
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                {s.step}
              </span>
              <div>
                <p className="text-sm font-semibold text-on-surface">{s.title}</p>
                <p className="text-xs text-on-surface-variant">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function AnimatedSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-primary/5 rounded-lg animate-pulse" />
          <div className="h-7 w-48 bg-primary/5 rounded-lg animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-primary/5 rounded-full animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-glass rounded-card p-5 h-28 animate-pulse border border-border-precision">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/5" />
              </div>
              <div className="h-7 w-16 bg-primary/5 rounded-lg mb-1" />
              <div className="h-3 w-20 bg-primary/5 rounded" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-glass rounded-2xl p-3.5 h-18 animate-pulse border border-border-precision" />
          ))}
        </div>

        <div className="bg-glass rounded-card p-5 h-52 animate-pulse border border-border-precision" />
        <div className="bg-glass rounded-card p-5 h-52 animate-pulse border border-border-precision" />
      </div>
    </div>
  );
}

export default function GuruBerandaPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const aliveRef = useRef(true);

  async function fetchData() {
    const [dashResult, onboardResult] = await Promise.all([
      apiFetch<DashboardData>("/api/v1/guru/dashboard"),
      apiFetch<OnboardingData>("/api/v1/guru/onboarding"),
    ]);
    if (!aliveRef.current) return;
    if (!dashResult.ok) {
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_CURVE }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-1">
            Ruang Kerja
          </span>
          <h1 className="font-heading font-bold text-2xl text-on-surface">Ringkasan</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola kursus, siswa, dan draft AI kamu di satu tempat.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {data.aiQuotaLimit > 0 && (
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-glass",
                data.aiQuotaUsed >= data.aiQuotaLimit
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : data.aiQuotaUsed >= data.aiQuotaLimit * 0.8
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              )}
            >
              <Zap className="w-3 h-3" />
              AI: {data.aiQuotaUsed}/{data.aiQuotaLimit}
            </div>
          )}
          <Link
            href="/guru/buat"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all shadow-glass"
          >
            <Sparkles className="w-4 h-4" />
            Buat Kursus
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {onboarding && !onboarding.isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE, delay: 0.1 }}
          className="p-4 rounded-2xl border border-primary/15 bg-primary/5"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <Rocket className="w-4 h-4" />
              Onboarding — {onboarding.completedSteps}/{onboarding.totalSteps} langkah
            </p>
            <span className="text-xs text-on-surface-variant">
              {onboarding.totalSteps - onboarding.completedSteps} tersisa
            </span>
          </div>
          <div className="h-2 bg-black/5 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(onboarding.completedSteps / onboarding.totalSteps) * 100}%` }}
              transition={{ duration: 1, ease: EASE_CURVE }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
          </div>
          <Link
            href="/guru/onboarding"
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-primary hover:underline"
          >
            Lanjutkan Onboarding
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE_CURVE }}
          className="grid grid-cols-2 gap-3"
        >
          <DoubleBezelStatCard
            label="Total Kursus"
            value={data.totalKursus}
            icon={BookOpen}
            color="#005231"
            delay={0.05}
          />
          <DoubleBezelStatCard
            label="Siswa"
            value={data.totalSiswa}
            icon={Users}
            color="#005231"
            delay={0.1}
          />
          <DoubleBezelStatCard
            label="Draft AI"
            value={data.draftMenunggu}
            icon={FileCheck}
            color="#5a4200"
            delay={0.15}
          />
          <DoubleBezelStatCard
            label="Materi Terbit"
            value={data.totalMateriPublished}
            icon={GraduationCap}
            color="#005231"
            delay={0.2}
          />
        </motion.div>

        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant mb-3 px-1">
            Aksi Cepat
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map((qa, i) => (
              <QuickActionCard key={qa.label} item={qa} index={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <DraftPipelineCard draftCount={data.draftMenunggu} delay={0.25} />
        <StudentInsightCard
          weakTopics={data.weakTopics}
          siswaBerisiko={data.siswaBerisiko}
          siswaKritis={data.siswaKritis}
          siswaBelumMengerjakan={data.siswaBelumMengerjakan}
          delay={0.3}
        />
      </div>

      {(hasDraftPriority || hasStudentAlert) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.35 }}
          className="space-y-3"
        >
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant px-1">
            Perlu Tindakan
          </span>

          {hasDraftPriority && (
            <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
              <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-amber-900 text-sm">
                  {data.draftMenunggu} draft AI menunggu review
                </p>
                <p className="text-xs text-amber-700">
                  Selesaikan review agar materi dan kuis bisa dipublikasikan ke siswa.
                </p>
              </div>
              <Link
                href="/guru/drafts"
                className="shrink-0 inline-flex items-center gap-1.5 bg-amber-700 text-white px-4 py-2 rounded-full text-xs font-semibold hover:brightness-110 transition-all"
              >
                Review
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {hasStudentAlert && (
            <div className="flex items-center gap-3 bg-red-50/70 border border-red-200 rounded-2xl p-4">
              <span className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-red-900 text-sm">
                  {data.siswaBelumMengerjakan > 0
                    ? `${data.siswaBelumMengerjakan} siswa belum mengerjakan kuis`
                    : `${data.siswaBerisiko + data.siswaKritis} siswa perlu perhatian`}
                </p>
                <p className="text-xs text-red-700">
                  {data.siswaBelumMengerjakan > 0 && "Beberapa siswa belum memulai kuis. "}
                  {data.siswaKritis > 0 && `${data.siswaKritis} kritis, `}
                  {data.siswaBerisiko > 0 && `${data.siswaBerisiko} berisiko. `}
                  Pantau di halaman siswa.
                </p>
              </div>
              <Link
                href="/guru/siswa"
                className="shrink-0 inline-flex items-center gap-1.5 bg-red-700 text-white px-4 py-2 rounded-full text-xs font-semibold hover:brightness-110 transition-all"
              >
                Lihat
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant mb-1">
              Kursus
            </span>
            <h2 className="font-heading font-semibold text-lg text-on-surface">Kursus Terbaru</h2>
          </div>
          <Link
            href="/guru/kursus"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Semua kursus
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.kursusList.map((k, i) => {
            const badge = STATUS_BADGE[k.statusPublikasi] || STATUS_BADGE.DRAFT;
            return (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_CONFIG, delay: 0.45 + i * 0.06 }}
              >
                <Link
                  href={`/guru/kursus/${k.id}`}
                  className="group bg-glass border border-border-precision rounded-2xl sm:rounded-2xl p-6 shadow-glass hover:shadow-glass-lg transition-all duration-300 block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-1 flex-1 bg-primary/15 rounded-full mr-3 group-hover:bg-primary/30 transition-colors" />
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold tracking-wider ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-on-surface mb-1.5 group-hover:text-primary transition-colors">
                    {k.judul}
                  </h3>
                  <p className="text-sm text-on-surface-variant line-clamp-2">
                    {k.deskripsi || "Tanpa deskripsi"}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}