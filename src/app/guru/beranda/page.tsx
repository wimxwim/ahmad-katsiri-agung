"use client";

// NOTE: per-user dashboard - keep dynamic; server cache is getCachedDashboard (90s) + private max-age 30s; loading.tsx dead until Server Component conversion
// TODO F4-3: migrasi ke useQuery - contoh sudah di kelas/diskusi, beranda masih apiFetch+aliveRef untuk demo bertahap
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
  PlusCircle,
  Zap,
  Eye,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Rocket,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { useEffect, useState, useRef, useCallback, Fragment, Suspense } from "react";
import { apiFetch } from "@/lib/api-helpers";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useTabFocus } from "@/hooks/useTabFocus";
import { CompletionDonut } from "@/components/analytics/CompletionDonut";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonDashboardGuru } from "@/components/ui/SkeletonBlocks";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { FREE_TIER_UPLOAD_LIMIT } from "@/lib/token-constants";

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
  isEstimated?: boolean;
  estimatedFields?: string[];
}

interface BalanceData {
  userId: string;
  balance: number;
  totalTopup: number;
  totalSpent: number;
  lastTopupAt: string | null;
  isUnlocked: boolean;
  unlockedAt: string | null;
  subscription?: {
    isUnlocked: boolean;
    uploadCount: number;
    uploadLimit: number;
    canGenerate: boolean;
    canUpload: boolean;
  };
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

const WORKFLOW_STEPS = [
  { number: 1, label: "Buat Kursus", desc: "Kerangka kursus baru", href: "/guru/buat", icon: PlusCircle },
  { number: 2, label: "Upload Dokumen", desc: "PDF/DOCX siap AI", href: "/guru/upload", icon: Upload },
  { number: 3, label: "Draft AI", desc: "Generate & review", href: "/guru/drafts", icon: Sparkles },
  { number: 4, label: "Terbitkan ke Siswa", desc: "Publikasi untuk siswa", href: "/guru/kursus", icon: Rocket },
] as { number: number; label: string; desc: string; href: string; icon: React.ElementType }[];

interface OnboardingData {
  completedSteps: number;
  totalSteps: number;
  isComplete: boolean;
  steps: { key: string; label: string; done: boolean }[];
  currentStep: string;
}

const SPRING_CONFIG = { type: "spring" as const, stiffness: 100, damping: 20 };

function Countdown({ seconds, onDone }: { seconds: number; onDone?: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onDone?.(); return; }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);
  if (left <= 0) return null;
  return <span className="ml-1 font-mono text-xs">{left}s</span>;
}

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
      <div className="bg-glass border border-border-precision rounded-[32px] p-4 shadow-glass hover:shadow-glass-lg transition-shadow duration-300">
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `color-mix(in oklch, ${color} 8%, transparent)` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-tertiary/[0.03] rounded-[32px]" />
      <div className="relative bg-glass border border-border-precision rounded-[32px] p-8 sm:p-10 shadow-glass-xl text-center">
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

// F11-5 Loading & ErrorBoundary + aria-busy + Suspense: ganti inline pulse tanpa aria-busy -> SkeletonBlocks konsisten
function AnimatedSkeleton() {
  return (
    <div aria-busy="true" role="status" aria-label="Memuat dashboard">
      <SkeletonDashboardGuru />
    </div>
  );
}

function BerandaContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<string | null>(null);
  const [onboardExpanded, setOnboardExpanded] = useState(false);
  const aliveRef = useRef(true);
  const retryCount = useRef(0);

  const fetchData = useCallback(async () => {
    const [dashResult, onboardResult, balanceResult] = await Promise.all([
      apiFetch<DashboardData>("/api/v1/guru/dashboard"),
      apiFetch<OnboardingData>("/api/v1/guru/onboarding"),
      apiFetch<BalanceData>("/api/v1/token/balance"),
    ]);
    if (!aliveRef.current) return;
    if (!dashResult.ok) {
      // F11-3 Status terdiferensiasi 429/402/403/404
      setErrorStatus(dashResult.status);
      setRetryAfter(dashResult.retryAfter ?? null);
      if (dashResult.status === 404) {
        setData(null);
        setError("");
        setLoading(false);
        return;
      }
      if (dashResult.status === 429 || dashResult.status === 402 || dashResult.status === 403) {
        setError(dashResult.error);
        setLoading(false);
        return;
      }
      if (retryCount.current < 2 && (dashResult.status === 401 || dashResult.status >= 500)) {
        retryCount.current++;
        await new Promise((r) => setTimeout(r, 400 * retryCount.current));
        return fetchData();
      }
      setError(dashResult.error);
    } else {
      setData(dashResult.data ?? null);
      setError("");
      setErrorStatus(null);
    }
    if (onboardResult.ok && onboardResult.data) {
      setOnboarding(onboardResult.data);
    } else {
      console.error("[guru/beranda] onboarding fetch failed:", onboardResult.error);
    }
    if (balanceResult.ok && balanceResult.data) {
      setBalance(balanceResult.data);
    }
    setLoading(false);
  }, []);

  const onTabFocus = useCallback(() => {
    fetchData();
  }, [fetchData]);
  useTabFocus(onTabFocus);

  useEffect(() => {
    aliveRef.current = true;
    fetchData();
    return () => { aliveRef.current = false; };
  }, [fetchData]);

  if (loading) return <AnimatedSkeleton />;

  // F11-3 404 -> EmptyState bukan error page
  if (errorStatus === 404) {
    return <EmptyState icon={BookOpen} title="Data tidak ditemukan" description="Dashboard belum tersedia. Mulai dengan membuat kursus pertama." action={{ label: "Buat Kursus", href: "/guru/buat" }} />;
  }

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
        <p className="text-sm text-on-surface-variant mb-2">{error}</p>
        {errorStatus === 429 && retryAfter && <p className="text-xs text-on-surface-variant mb-2">Coba lagi dalam <Countdown seconds={parseInt(retryAfter, 10) || 30} onDone={() => { setLoading(true); setError(""); retryCount.current = 0; fetchData(); }} /> detik</p>}
        {errorStatus === 402 && <Link href="/guru/topup" className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 mb-3">Topup Rp10.000</Link>}
        {errorStatus === 403 && <p className="text-xs text-on-surface-variant mb-3">Sesi habis, muat ulang halaman untuk login kembali.</p>}
        <button
          onClick={() => {
            setLoading(true);
            setError("");
            setErrorStatus(null);
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

  const hasAnyActivity = data && (
    data.totalSiswa > 0 ||
    data.draftMenunggu > 0 ||
    data.totalMateriPublished > 0 ||
    data.totalQuizPublished > 0
  );
  if (!data || (data.totalKursus === 0 && !hasAnyActivity)) {
    return <WelcomeEmptyState />;
  }

  const hasDraftPriority = data.draftMenunggu > 0;
  const hasStudentAlert = data.siswaBelumMengerjakan > 0 || data.siswaBerisiko > 0 || data.siswaKritis > 0;
  const nextStep = onboarding?.steps.find((s) => !s.done);

  const publishedKursusCount = (data.kursusList ?? []).filter((k) => k.statusPublikasi === "PUBLIK").length;
  const stepBadges: ({ text: string; className: string } | null)[] = [
    data.totalKursus > 0
      ? { text: `${data.totalKursus} kursus`, className: "bg-primary/10 text-primary" }
      : null,
    data.totalMateriPublished > 0
      ? { text: `${data.totalMateriPublished} materi`, className: "bg-primary/10 text-primary" }
      : null,
    data.draftMenunggu > 0
      ? { text: `${data.draftMenunggu} draft menunggu review`, className: "bg-amber-50 text-amber-700" }
      : { text: "Draft siap", className: "bg-surface text-on-surface-variant" },
    publishedKursusCount > 0
      ? { text: `${publishedKursusCount} kursus terbit`, className: "bg-emerald-50 text-emerald-700" }
      : null,
  ];

  const isFreeMode = process.env.NEXT_PUBLIC_FREE_GENERATE_MODE === "true";
  const canGenerate = balance?.subscription?.canGenerate ?? balance?.isUnlocked ?? false;
  const isFree = isFreeMode || canGenerate;
  const uploadCount = balance?.subscription?.uploadCount ?? 0;
  const uploadLimit = balance?.subscription?.uploadLimit ?? FREE_TIER_UPLOAD_LIMIT;
  const remainingUploads = Math.max(0, (uploadLimit === Infinity ? 15 : uploadLimit) - uploadCount);
  const uploadProgress = uploadLimit === Infinity ? 100 : Math.min(100, (uploadCount / uploadLimit) * 100);

  return (
    <div className="space-y-5 isolate">
      <Breadcrumb items={[{ label: "Ringkasan" }]} />
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
            {isFree ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Zap className="w-3 h-3" />
                Gratis — Generate Unlimited (Promo)
              </span>
            ) : (
              <>
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
                  href="/guru/topup"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  Top-Up 5k untuk unlock
                </Link>
              </>
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
        {!isFree && balance && (
          <div className="mt-3 p-3 rounded-2xl border border-amber-200 bg-amber-50/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-amber-800">Sisa gratis {remainingUploads} upload</span>
              <span className="text-xs text-amber-700">{uploadCount}/{uploadLimit === Infinity ? "∞" : uploadLimit}</span>
            </div>
            <div className="h-2 bg-black/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-[11px] text-amber-700 mt-1">Top-up untuk upload unlimited dan generate tanpa batas.</p>
          </div>
        )}
        {isFree && balance && !canGenerate && (
          <div className="mt-3 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60">
            <p className="text-xs font-semibold text-emerald-800">Gratis — Generate Unlimited (Promo) aktif</p>
            <p className="text-[11px] text-emerald-700 mt-1">Sisa gratis {remainingUploads} upload — nikmati promo generate tanpa batas.</p>
          </div>
        )}
        {data.isEstimated && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Estimasi (absensi belum tersedia){data.estimatedFields?.length ? ` - ${data.estimatedFields.join(", ")}` : ""}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-12 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE }}
          className="col-span-12 lg:col-span-8"
        >
          <div className="@container h-full">
            <div className="relative overflow-hidden bg-glass border border-border-precision rounded-[32px] p-5 shadow-glass hover:shadow-glass-lg transition-shadow duration-300 bento-card @container isolate h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-tertiary/[0.03] pointer-events-none" />
              <div className="relative">
                <div className="mb-4">
                  <h2 className="font-heading font-bold text-lg text-on-surface">Alur Kerja Guru</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">Dari dokumen hingga diterbitkan ke siswa.</p>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-stretch gap-2.5">
                  {WORKFLOW_STEPS.map((step, i) => {
                    const badge = stepBadges[i];
                    return (
                      <Fragment key={step.label}>
                        {i > 0 && (
                          <div
                            aria-hidden="true"
                            className="flex justify-center px-0.5 py-0.5 lg:py-0 lg:px-0 lg:items-center"
                          >
                            <ArrowRight className="w-4 h-4 text-primary/30 rotate-90 lg:rotate-0 shrink-0" />
                          </div>
                        )}
                        <Link
                          href={step.href}
                          className="group relative flex items-center gap-3 lg:flex-col lg:text-center bg-white/40 border border-border-precision rounded-xl p-3 shadow-sm hover:bg-white/80 hover:border-primary/25 hover:shadow-glass-lg active:scale-[0.99] transition-all duration-200 lg:flex-1 lg:min-w-0 motion-card"
                        >
                          <span className="relative w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <step.icon className="w-4 h-4" />
                            <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
                              {step.number}
                            </span>
                          </span>
                          <div className="flex-1 min-w-0 lg:w-full">
                            <p className="text-xs font-semibold text-on-surface truncate">{step.label}</p>
                            <p className="text-[10px] text-on-surface-variant truncate">{step.desc}</p>
                            {badge && (
                              <span
                                className={cn(
                                  "mt-1 inline-block max-w-full truncate px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide",
                                  badge.className,
                                )}
                              >
                                {badge.text}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-3 h-3 text-on-surface-variant/30 group-hover:text-on-surface-variant group-hover:translate-x-0.5 transition-all shrink-0 lg:hidden" />
                        </Link>
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.08 }}
          className="col-span-12 lg:col-span-4"
        >
          <div className="bg-glass border border-border-precision rounded-[32px] p-4 shadow-glass hover:shadow-glass-lg transition-shadow duration-300 isolate h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-on-surface text-sm">
                {data.draftMenunggu} draft menunggu review
              </h3>
              <Link
                href="/guru/drafts"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Lihat
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="h-2 bg-black/5 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.draftMenunggu > 0 ? Math.min((data.draftMenunggu / Math.max(data.draftMenunggu, 5)) * 100, 100) : 0}%` }}
                transition={{ duration: 1, ease: EASE_CURVE }}
                className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
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
              className="inline-flex items-center gap-1 mt-auto text-xs font-semibold text-primary hover:underline"
            >
              Review Draft
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="overflow-x-auto -mx-3 px-3 scrollbar-none snap-x snap-mandatory">
        <div className="flex gap-3">
          <StatRailCard label="Kursus" value={data.totalKursus} icon={BookOpen} color="#005231" />
          <StatRailCard label="Siswa" value={data.totalSiswa} icon={Users} color="#005231" />
          <StatRailCard label="Kuis Dikerjakan" value={data.totalKuisDikerjakan} icon={FileCheck} color="#005231" />
          <StatRailCard label="Draft AI" value={data.draftMenunggu} icon={FileCheck} color="#5a4200" />
          <StatRailCard label="Materi Terbit" value={data.totalMateriPublished} icon={GraduationCap} color="#005231" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.12 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">Trend Mingguan</span>
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> 4 minggu
          </span>
        </div>
        {data.totalKursus > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CompletionDonut
              tuntas={data.totalMateriPublished}
              belumTuntas={Math.max(0, data.totalKursus - data.totalMateriPublished + data.draftMenunggu) || 1}
              ariaLabel="Ketuntasan materi mingguan"
            />
            <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-4 sm:p-5 hover:shadow-glass-lg transition-shadow duration-300">
              <h3 className="font-heading font-semibold text-sm text-on-surface mb-3">Aktivitas 4 Minggu</h3>
              <div className="flex items-end gap-2 h-[180px] px-2">
                {[1, 2, 3, 4].map((w, i) => {
                  const base = data.totalKuisDikerjakan > 0 ? Math.round((data.totalKuisDikerjakan / 4) * (0.6 + i * 0.15)) : 0;
                  const h = data.totalKuisDikerjakan > 0 ? Math.min(100, Math.max(12, (base / Math.max(1, data.totalKuisDikerjakan)) * 160)) : 12;
                  return (
                    <div key={w} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-lg bg-primary/80 transition-all"
                        style={{ height: `${h}px` }}
                        role="progressbar"
                        aria-valuenow={base}
                        aria-valuemin={0}
                        aria-valuemax={data.totalKuisDikerjakan || 1}
                        aria-label={`Minggu ${w}: ${base} aktivitas`}
                      />
                      <span className="text-xs font-medium text-on-surface-variant">M{w}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-on-surface-variant mt-3 text-center">Data mingguan segera — placeholder proporsional dari total kuis dikerjakan</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-6 hover:shadow-glass-lg transition-shadow duration-300">
            <EmptyState icon={BarChart3} title="Data mingguan segera" description="Tren 4 minggu akan tampil setelah ada aktivitas kursus." />
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.1 }}
        className="@container"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2 block">
          Aksi Cepat
        </span>
        <div className="grid grid-cols-2 gap-2 bento-card @container">
          {QUICK_ACTIONS.map((qa) => (
            <Link
              key={qa.label}
              href={qa.href}
              className="group flex items-center gap-2.5 bg-glass border border-border-precision rounded-[32px] p-3 shadow-glass hover:shadow-glass-lg hover:bg-white/80 hover:border-primary/25 hover:shadow-glass-lg active:scale-[0.99] transition-all duration-200 isolate motion-card"
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
        transition={{ ...SPRING_CONFIG, delay: 0.2 }}
        className="@container"
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
        <div className="flex flex-col gap-2 bento-card @container">
          {(data.kursusList ?? []).slice(0, 3).map((k) => {
            const badge = STATUS_BADGE[k.statusPublikasi] || STATUS_BADGE.DRAFT;
            return (
              <Link
                key={k.id}
                href={`/guru/kursus/${k.id}`}
                className="bg-glass border border-border-precision rounded-[32px] p-3.5 shadow-glass hover:shadow-glass-lg hover:bg-white/80 hover:border-primary/25 active:scale-[0.99] transition-all duration-200 isolate"
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
              prefetch={false}
              className="text-xs font-semibold text-tertiary hover:underline flex items-center gap-1"
            >
              Analytics
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-glass border border-border-precision rounded-[32px] p-4 shadow-glass hover:shadow-glass-lg transition-shadow duration-300 space-y-2 isolate">
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

export default function GuruBerandaPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div aria-busy="true" role="status"><SkeletonDashboardGuru /></div>}>
        <BerandaContent />
      </Suspense>
    </ErrorBoundary>
  );
}
