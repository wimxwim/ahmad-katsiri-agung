"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  AlertTriangle,
  Award,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Lightbulb,
  GraduationCap,
  FileEdit,
  Brain,
  Target,
  Search,
  ChevronDown,
  Share2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import ScoreTrendChart from "@/components/analytics/ScoreTrendChart";
import CompletionDonut from "@/components/analytics/CompletionDonut";
import ScoreDistribution from "@/components/analytics/ScoreDistribution";
import MaterialPerformance from "@/components/analytics/MaterialPerformance";
import QuizAttemptsChart from "@/components/analytics/QuizAttemptsChart";
import StudentActivityHeatmap from "@/components/analytics/StudentActivityHeatmap";
import CourseProgress from "@/components/analytics/CourseProgress";
import { apiFetch } from "@/lib/api-helpers";
import { KKM, EASE_CURVE } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Interfaces - sesuai route.ts baru
// ---------------------------------------------------------------------------

type KursusBreakdown = {
  kursusId: string;
  judul: string;
  totalSiswa: number;
  totalAttempt: number;
  rataNilai: number;
  siswaTuntas: number;
  siswaBelumTuntas: number;
};

type WeakTopic = {
  soalId: string;
  pertanyaan: string;
  tipe: string;
  totalJawab: number;
  totalBenar: number;
  totalSalah: number;
  errorRate: number;
};

type RemedialItem = {
  siswaId: string;
  nama: string;
  rataNilai: number;
  totalAttempt: number;
  kursus: string[];
};

type RemedialDetailItem = {
  siswaId: string;
  nama: string;
  jumlahSoalSalah: number;
  topMateri: string | null;
  persenBenar: number;
};

type StudentAbility = {
  siswaId: string;
  nama: string;
  kursusId: string;
  theta: number;
  level: string;
};

type SoalDifficultyItem = {
  id: string;
  pertanyaan: string;
  tipe: string;
  eloRating: number;
  irtA: number;
  irtB: number;
  irtC: number;
  difficulty: string;
};

type SkillMasteryItem = {
  siswaId: string;
  nama: string | null;
  skillId: string;
  pL: number;
  memoryStrength: number | null;
  repetitionNum: number | null;
  lastPracticedAt: string | null;
  nextReviewAt: string | null;
};

type ScoreTrend = {
  week: string;
  rata: number;
  total: number;
};

type ScoreDistributionData = {
  bucket0_59: number;
  bucket60_69: number;
  bucket70_79: number;
  bucket80_89: number;
  bucket90_100: number;
};

type AttemptTrend = {
  week: string;
  total: number;
};

type Heatmap = {
  dow: number;
  hour: number;
  total: number;
};

type PerMateri = {
  skillId: string;
  nama: string;
  avgBenar: number;
  total: number;
};

type RingkasanHybrid = {
  levelCounts: Record<string, number>;
  soalSulitCount: number;
  skillMahirCount: number;
};

type AnalyticsResponse = {
  totalKursus: number;
  totalSiswa: number;
  totalDraft: number;
  totalKuisAktif: number;
  totalAttempt: number;
  totalSiswaTuntas: number;
  totalSiswaBelumTuntas: number;
  rataNilaiKeseluruhan: number;
  trend: { minggu: string; total: number }[];
  scoreTrend: ScoreTrend[];
  scoreDistribution: ScoreDistributionData;
  attemptTrend: AttemptTrend[];
  activityHeatmap: Heatmap[];
  performaPerMateri: PerMateri[];
  ringkasanHybrid: RingkasanHybrid;
  periode: string;
  kursusBreakdown: KursusBreakdown[];
  remedialList: RemedialItem[];
  remedialDetail: RemedialDetailItem[];
  weakTopics: WeakTopic[];
  studentAbilities: StudentAbility[];
  soalDifficulty: SoalDifficultyItem[];
  skillMastery: SkillMasteryItem[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function levelBadgeColor(level: string): string {
  if (level === "Mahir") return "bg-[#005231] text-white";
  if (level === "Menengah") return "bg-[#0d7a4a] text-white";
  if (level === "Dasar") return "bg-[#e67e22] text-white";
  return "bg-white border border-border-precision text-muted-foreground";
}

function difficultyBadgeColor(difficulty: string): string {
  if (difficulty === "Sulit") return "bg-[#c0392b] text-white";
  if (difficulty === "Sedang") return "bg-[#e67e22] text-white";
  return "bg-[#005231] text-white";
}

function errorRateColor(rate: number): string {
  if (rate >= 70) return "bg-[#c0392b]";
  if (rate >= 50) return "bg-[#e67e22]";
  return "bg-[#d4a017]";
}

function masteryBarColor(pL: number): string {
  if (pL >= 0.8) return "bg-[#005231]";
  if (pL >= 0.5) return "bg-[#e67e22]";
  return "bg-[#c0392b]";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GuruAnalyticsPage() {
  const [periode, setPeriode] = useState<"7d" | "28d" | "90d">("28d");
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    data: queryData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["guru", "analytics", periode],
    queryFn: async () => {
      const res = await apiFetch<AnalyticsResponse>(`/api/v1/guru/analytics?periode=${periode}`);
      if (!res.ok) throw new Error(res.error || "Gagal memuat analytics");
      return res.data as AnalyticsResponse;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
  const data = queryData ?? null;
  const error = queryError ? (queryError as Error).message : null;

  const filteredKursus = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.kursusBreakdown;
    return data.kursusBreakdown.filter((k) => k.judul.toLowerCase().includes(q));
  }, [data, search]);

  const filteredRemedial = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.remedialList;
    return data.remedialList.filter(
      (r) => r.nama.toLowerCase().includes(q) || r.kursus.some((c) => c.toLowerCase().includes(q))
    );
  }, [data, search]);

  const filteredRemedialDetail = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.remedialDetail;
    return data.remedialDetail.filter(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        (r.topMateri ? r.topMateri.toLowerCase().includes(q) : false)
    );
  }, [data, search]);

  const insightLines = useMemo(() => {
    if (!data) return [];
    const lines: string[] = [];
    const kursusCount = data.totalKursus;
    const totalSiswa = data.totalSiswa;
    const tuntasPct =
      totalSiswa > 0 ? Math.round((data.totalSiswaTuntas / totalSiswa) * 100) : 0;

    lines.push(
      `Anda mengelola ${kursusCount} kursus dengan ${totalSiswa} siswa terdaftar dalam periode ${periode}.`
    );

    if (totalSiswa > 0) {
      lines.push(
        `Kelulusan ${tuntasPct}% - ${data.totalSiswaTuntas} siswa tuntas (KKM ${KKM}), ${data.totalSiswaBelumTuntas} belum tuntas.`
      );
    }

    if (data.kursusBreakdown.length > 0) {
      const sorted = [...data.kursusBreakdown].sort((a, b) => b.rataNilai - a.rataNilai);
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];
      if (best) {
        lines.push(`Performa terbaik: ${best.judul} dengan rata-rata ${best.rataNilai}.`);
      }
      if (worst && sorted.length > 1 && worst.kursusId !== best.kursusId) {
        lines.push(`Perlu perhatian: ${worst.judul} dengan rata-rata ${worst.rataNilai}.`);
      }
    }

    if (data.weakTopics.length > 0) {
      lines.push(
        `${data.weakTopics.length} topik dengan tingkat kesalahan tinggi terdeteksi - tinjau materi terkait.`
      );
    } else if (data.totalAttempt > 0) {
      lines.push(`Tidak ada topik dengan kesalahan dominan - performa soal merata.`);
    }

    if (data.performaPerMateri.length > 0) {
      const lowest = [...data.performaPerMateri].sort((a, b) => a.avgBenar - b.avgBenar)[0];
      if (lowest && lowest.avgBenar < 0.6) {
        lines.push(
          `Materi "${lowest.nama}" memiliki tingkat kebenaran terendah (${Math.round(lowest.avgBenar * 100)}%) - pertimbangkan pengayaan.`
        );
      }
    }

    return lines;
  }, [data, periode]);

  const kelulusanPct = useMemo(() => {
    if (!data) return 0;
    return Math.round((data.totalSiswaTuntas / Math.max(data.totalSiswa, 1)) * 100);
  }, [data]);

  const handleShare = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 340;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no ctx");
      ctx.fillStyle = "#f2fcf7";
      ctx.fillRect(0, 0, 600, 340);
      ctx.fillStyle = "#005231";
      ctx.font = "700 18px 'Bricolage Grotesque', Inter, sans-serif";
      ctx.fillText("Kelas - Analytics AKAL Center", 24, 36);
      const tanggal = new Date().toISOString().slice(0, 10);
      ctx.fillStyle = "#6f7a71";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(`Periode: ${periode}  |  ${tanggal}`, 24, 56);
      const siswa = data?.totalSiswa ?? 0;
      const pct = kelulusanPct;
      const rata = data?.rataNilaiKeseluruhan ?? 0;
      const stats = [
        { label: "Total Siswa", value: String(siswa) },
        { label: "Kelulusan", value: `${pct}%` },
        { label: "Rata Nilai", value: String(rata) },
      ];
      stats.forEach((s, i) => {
        const x = 24 + i * 184;
        const y = 76;
        const w = 168;
        const h = 72;
        const r = 16;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(27,107,69,0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#6f7a71";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText(s.label, x + 14, y + 22);
        ctx.fillStyle = "#005231";
        ctx.font = "700 22px 'Bricolage Grotesque', Inter, sans-serif";
        ctx.fillText(s.value, x + 14, y + 50);
      });
      ctx.fillStyle = "#6f7a71";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("AKAL Center  |  akalcenter.my.id", 24, 320);
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `akal-analytics-${tanggal}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      const siswa = data?.totalSiswa ?? 0;
      const pct = kelulusanPct;
      const rata = data?.rataNilaiKeseluruhan ?? 0;
      const tanggal = new Date().toISOString().slice(0, 10);
      const text = `AKAL Center Analytics (${periode}, ${tanggal}) - Siswa: ${siswa}, Kelulusan: ${pct}%, Rata Nilai: ${rata}`;
      const nav = navigator as Navigator & { share?: (d: { title: string; text: string }) => Promise<void> };
      if (nav.share) {
        nav.share({ title: "Analytics AKAL Center", text }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    }
  };

  // Derived for header stats
  const hasData = data !== null && (data.totalKursus > 0 || data.totalAttempt > 0 || data.totalSiswa > 0);

  return (
    <div className="min-h-screen bg-surface px-3 sm:px-5 lg:px-8 py-6">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Analytics
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Ringkasan progres belajar siswa
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="inline-flex items-center bg-surface-container rounded-full p-1 border border-border-precision">
                {(["7d", "28d", "90d"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriode(p)}
                    className={
                      periode === p
                        ? "px-4 py-1.5 rounded-full bg-[#005231] text-white text-sm font-medium transition-colors"
                        : "px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    }
                  >
                    {p === "7d" ? "7 hari" : p === "28d" ? "28 hari" : "90 hari"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                className="w-9 h-9 rounded-full bg-white border border-border-precision flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#005231]/20 transition-colors"
                aria-label="Muat ulang"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kursus atau siswa..."
                className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white border border-border-precision text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#005231]/20 focus:border-[#005231]/30 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border-precision text-sm font-medium text-foreground hover:border-[#005231]/20 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Bagikan ke Kepala Sekolah
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl h-28 animate-pulse"
                />
              ))}
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-8 bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl h-64 animate-pulse" />
              <div className="col-span-12 lg:col-span-4 bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl h-64 animate-pulse" />
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-5 bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl h-64 animate-pulse" />
              <div className="col-span-12 lg:col-span-7 bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl h-64 animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-heading font-semibold text-foreground">Gagal memuat analytics</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005231] text-white text-sm font-medium hover:bg-[#004028] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
          </div>
        ) : !data || !hasData ? (
          <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-container border border-border-precision flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-heading font-semibold text-foreground">Belum ada data analytics</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Data akan muncul setelah siswa mengerjakan quiz. Buat kursus dan undang siswa untuk memulai.
            </p>
            <Link
              href="/guru/kursus"
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full bg-[#005231] text-white text-sm font-medium hover:bg-[#004028] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Kelola Kursus
            </Link>
          </div>
        ) : (
          <>
            {/* KPI 5 - staggerChildren 0.08 */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}>
                <StatCard label="Total Kursus" value={data.totalKursus} icon={BookOpen} color="#005231" />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}>
                <StatCard label="Siswa Terdaftar" value={data.totalSiswa} icon={Users} color="#005231" />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}>
                <StatCard label="Belum Tuntas" value={data.totalSiswaBelumTuntas} icon={AlertTriangle} color={data.totalSiswaBelumTuntas > 0 ? "#e67e22" : "#005231"} />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}>
                <StatCard label="Rata Nilai" value={data.rataNilaiKeseluruhan} icon={Award} color="#005231" />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}>
                <StatCard label="Kelulusan" value={`${kelulusanPct}%`} icon={GraduationCap} color="#005231" />
              </motion.div>
            </motion.div>

            {/* Bento row 1: ScoreTrend + QuizAttempts */}
            <div className="grid grid-cols-12 gap-4 mb-6">
              <div className="col-span-12 lg:col-span-8">
                <ScoreTrendChart data={data.scoreTrend} ariaLabel="Perkembangan rata-rata nilai" />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <QuizAttemptsChart data={data.attemptTrend} ariaLabel="Percobaan quiz per minggu" />
              </div>
            </div>

            {/* Bento row 2: CompletionDonut + ScoreDistribution */}
            <div className="grid grid-cols-12 gap-4 mb-6">
              <div className="col-span-12 lg:col-span-5">
                <CompletionDonut tuntas={data.totalSiswaTuntas} belumTuntas={data.totalSiswaBelumTuntas} ariaLabel="Status ketuntasan" />
              </div>
              <div className="col-span-12 lg:col-span-7">
                <ScoreDistribution data={data.scoreDistribution} ariaLabel="Distribusi nilai" />
              </div>
            </div>

            {/* MaterialPerformance full width */}
            <div className="mb-6">
              <MaterialPerformance data={data.performaPerMateri} ariaLabel="Performa per materi" />
            </div>

            {/* Bento row 3: Heatmap + WeakTopics */}
            <div className="grid grid-cols-12 gap-4 mb-6">
              <div className="col-span-12 lg:col-span-7">
                <StudentActivityHeatmap data={data.activityHeatmap} ariaLabel="Aktivitas siswa per hari dan jam" />
              </div>

              {/* WeakTopics custom */}
              <div className="col-span-12 lg:col-span-5">
                <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <Target className="w-4 h-4 text-amber-700" />
                    </div>
                    <h3 className="font-heading font-semibold text-sm text-foreground">Topik Sulit</h3>
                  </div>

                  {data.weakTopics.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-surface-container border border-border-precision flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Tidak ada topik dengan kesalahan tinggi</p>
                      <p className="text-xs text-muted-foreground">Semua soal dijawab cukup baik</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {data.weakTopics.slice(0, 5).map((t) => (
                        <div
                          key={t.soalId}
                          className="rounded-2xl border border-border-precision bg-white/70 p-3 flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm text-foreground leading-snug line-clamp-2 flex-1" title={t.pertanyaan}>
                              {t.pertanyaan}
                            </p>
                            <span className="shrink-0 inline-flex items-center rounded-full bg-white border border-border-precision text-xs font-medium px-2 py-1 text-muted-foreground">
                              {t.tipe}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-surface-container overflow-hidden border border-border-precision">
                              <div
                                className={`h-full rounded-full transition-all ${errorRateColor(t.errorRate)}`}
                                style={{ width: `${Math.min(100, Math.max(0, t.errorRate))}%` }}
                                role="progressbar"
                                aria-valuenow={t.errorRate}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Error rate ${t.errorRate}%`}
                              />
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-foreground shrink-0">
                              {t.errorRate}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t.totalSalah} salah dari {t.totalJawab} jawaban &middot; {t.totalBenar} benar
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ringkasan untuk Guru */}
            <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#005231]/10 border border-[#005231]/15 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-[#005231]" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-foreground">Ringkasan untuk Guru</h3>
              </div>
              <ul className="flex flex-col gap-2">
                {insightLines.map((line, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#005231] shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Remedial card */}
            <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#005231]/10 border border-[#005231]/15 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-[#005231]" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-foreground">Perlu Remedial</h3>
                <span className="ml-auto inline-flex items-center rounded-full bg-white border border-border-precision text-xs font-medium px-2.5 py-1 text-muted-foreground">
                  KKM {KKM}
                </span>
              </div>

              {filteredRemedial.length === 0 ? (
                <div className="rounded-2xl border border-border-precision bg-white/70 p-6 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#005231]/10 border border-[#005231]/15 flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#005231]" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Semua di atas KKM</p>
                  <p className="text-xs text-muted-foreground">Tidak ada siswa yang memerlukan remedial saat ini</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredRemedial.slice(0, 5).map((s) => {
                    const detail = filteredRemedialDetail.find((d) => d.siswaId === s.siswaId);
                    return (
                      <div
                        key={s.siswaId}
                        className="rounded-2xl border border-border-precision bg-white/70 p-3 sm:p-4 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#005231] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                          {s.rataNilai}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/guru/siswa/${s.siswaId}`}
                            className="font-heading font-semibold text-sm text-foreground hover:text-[#005231] transition-colors line-clamp-1"
                          >
                            {s.nama}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">
                            {s.kursus.length > 0 ? s.kursus.join(" - ") : "Tanpa kursus"} &middot; {s.totalAttempt} percobaan
                            {detail?.topMateri ? ` - Topik sulit: ${detail.topMateri}` : ""}
                          </p>
                        </div>
                        <Link
                          href={`/guru/siswa/${s.siswaId}`}
                          className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-[#005231] hover:text-[#004028] transition-colors"
                        >
                          Detail
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href="/guru/siswa"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#005231] text-white text-sm font-medium hover:bg-[#004028] transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Tinjau Semua Siswa
                </Link>
                <Link
                  href="/guru/siswa"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-border-precision text-sm font-medium text-foreground hover:border-[#005231]/20 transition-colors"
                >
                  <FileEdit className="w-4 h-4" />
                  Lihat Detail
                </Link>
                <Link
                  href="/guru/kuis"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-border-precision text-sm font-medium text-foreground hover:border-[#005231]/20 transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  Buat Kuis Remedial
                </Link>
                <Link
                  href="/guru/kursus"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-border-precision text-sm font-medium text-foreground hover:border-[#005231]/20 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Lihat Kursus
                </Link>
              </div>
            </div>

            {/* CourseProgress full width */}
            <div className="mb-6">
              <CourseProgress data={filteredKursus} />
            </div>

            {/* Ringkasan Hybrid pills */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {Object.entries(data.ringkasanHybrid.levelCounts).length > 0 ? (
                Object.entries(data.ringkasanHybrid.levelCounts).map(([level, count]) => (
                  <span
                    key={level}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border-precision text-xs font-medium text-foreground"
                  >
                    <span className={`w-2 h-2 rounded-full ${levelBadgeColor(level).split(" ")[0]}`} />
                    {level}: {count}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-border-precision text-xs font-medium text-muted-foreground">
                  Belum ada level
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border-precision text-xs font-medium text-foreground">
                <Target className="w-3 h-3 text-muted-foreground" />
                Soal sulit: {data.ringkasanHybrid.soalSulitCount}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border-precision text-xs font-medium text-foreground">
                <Award className="w-3 h-3 text-muted-foreground" />
                Skill mahir: {data.ringkasanHybrid.skillMahirCount}
              </span>
            </div>

            {/* Collapsible Analisis Lanjutan */}
            <motion.div className="mb-6" initial={false} animate={showAdvanced ? "open" : "collapsed"}>
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="w-full bg-white border border-border-precision rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-[#005231]/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-surface-container border border-border-precision flex items-center justify-center">
                    <Brain className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm text-foreground">Lihat Analisis Lanjutan</p>
                    <p className="text-xs text-muted-foreground">Kemampuan siswa, tingkat kesulitan soal, dan penguasaan skill</p>
                  </div>
                </div>
                <motion.span
                  animate={{ rotate: showAdvanced ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: EASE_CURVE }}
                  className="shrink-0 flex items-center justify-center"
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {showAdvanced ? (
                  <motion.div
                    key="advanced-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE_CURVE }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="mt-4 grid grid-cols-12 gap-4">
                  {/* StudentAbilities */}
                  <div className="col-span-12 lg:col-span-4">
                    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5 h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-xl bg-[#005231]/10 border border-[#005231]/15 flex items-center justify-center">
                          <GraduationCap className="w-3.5 h-3.5 text-[#005231]" />
                        </div>
                        <h4 className="font-heading font-semibold text-sm text-foreground">Kemampuan Siswa</h4>
                      </div>
                      {data.studentAbilities.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">Belum ada data kemampuan</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {data.studentAbilities.slice(0, 5).map((s) => {
                            const pct = Math.min(100, Math.max(0, ((s.theta + 3) / 6) * 100));
                            return (
                              <div key={`${s.siswaId}-${s.kursusId}`} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium text-foreground truncate flex-1" title={s.nama}>
                                    {s.nama}
                                  </span>
                                  <span className={`shrink-0 inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${levelBadgeColor(s.level)}`}>
                                    {s.level}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 rounded-full bg-surface-container overflow-hidden border border-border-precision">
                                    <div
                                      className="h-full rounded-full bg-[#005231] transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                                    {s.theta.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SoalDifficulty */}
                  <div className="col-span-12 lg:col-span-4">
                    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5 h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                          <Target className="w-3.5 h-3.5 text-amber-700" />
                        </div>
                        <h4 className="font-heading font-semibold text-sm text-foreground">Tingkat Kesulitan Soal</h4>
                      </div>
                      {data.soalDifficulty.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">Belum ada data soal</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {data.soalDifficulty.slice(0, 5).map((s) => {
                            const pct = Math.min(100, Math.max(0, ((1500 - s.eloRating) / 800) * 100));
                            return (
                              <div key={s.id} className="flex flex-col gap-1.5">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-sm text-foreground leading-snug line-clamp-2 flex-1" title={s.pertanyaan}>
                                    {s.pertanyaan}
                                  </span>
                                  <span className={`shrink-0 inline-flex items-center rounded-full text-xs font-medium px-2 py-0.5 ${difficultyBadgeColor(s.difficulty)}`}>
                                    {s.difficulty}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 rounded-full bg-surface-container overflow-hidden border border-border-precision">
                                    <div
                                      className="h-full rounded-full bg-[#c0392b] transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                                    {Math.round(s.eloRating)}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {s.tipe} &middot; a {Number(s.irtA).toFixed(2)} b {Number(s.irtB).toFixed(2)} c {Number(s.irtC).toFixed(2)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SkillMastery grouped */}
                  <div className="col-span-12 lg:col-span-4">
                    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 sm:p-5 h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-xl bg-[#005231]/10 border border-[#005231]/15 flex items-center justify-center">
                          <Brain className="w-3.5 h-3.5 text-[#005231]" />
                        </div>
                        <h4 className="font-heading font-semibold text-sm text-foreground">Penguasaan Skill</h4>
                      </div>
                      {data.skillMastery.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">Belum ada data penguasaan</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {(() => {
                            const grouped = new Map<string, SkillMasteryItem[]>();
                            for (const m of data.skillMastery.slice(0, 30)) {
                              const arr = grouped.get(m.skillId) ?? [];
                              arr.push(m);
                              grouped.set(m.skillId, arr);
                            }
                            const entries = Array.from(grouped.entries()).slice(0, 5);
                            return entries.map(([skillId, items]) => {
                              const avgPL = items.reduce((s, x) => s + Number(x.pL), 0) / items.length;
                              const pct = Math.min(100, Math.max(0, avgPL * 100));
                              return (
                                <div key={skillId} className="rounded-2xl border border-border-precision bg-white/70 p-3 flex flex-col gap-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium text-foreground truncate flex-1" title={skillId}>
                                      {skillId.slice(0, 8)}...
                                    </span>
                                    <span className="text-xs tabular-nums font-medium text-foreground shrink-0">
                                      {Math.round(avgPL * 100)}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-surface-container overflow-hidden border border-border-precision">
                                    <div
                                      className={`h-full rounded-full transition-all ${masteryBarColor(avgPL)}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {items.length} siswa &middot; {items.filter((x) => Number(x.pL) >= 0.8).length} mahir
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {items.slice(0, 4).map((it) => (
                                      <span
                                        key={`${it.siswaId}-${it.skillId}`}
                                        className="inline-flex items-center rounded-full bg-white border border-border-precision text-xs px-2 py-0.5 text-muted-foreground"
                                        title={it.nama ?? it.siswaId}
                                      >
                                        {(it.nama ?? it.siswaId).slice(0, 12)} {Math.round(Number(it.pL) * 100)}%
                                      </span>
                                    ))}
                                    {items.length > 4 ? (
                                      <span className="text-xs text-muted-foreground">+{items.length - 4} lagi</span>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
