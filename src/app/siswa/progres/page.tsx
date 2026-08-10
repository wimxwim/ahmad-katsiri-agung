"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  RefreshCw,
  Clock,
  Target,
  Flame,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

interface AttemptItem {
  id: string;
  quizPublishedId: string;
  quizJudul: string;
  nilai: number | null;
  jumlahBenar: number;
  jumlahSalah: number;
  durasiDetik: number;
  waktuMulai: string;
  status: string;
  modeEvaluasi: string;
  tampilkanNilai: boolean;
  kursusId: string | null;
  kursusJudul: string | null;
}

interface Konsistensi {
  streakHari: number;
  hariAktif7: number;
  mingguAktif: number[];
  totalHariAktif: number;
}

interface MasteryCp {
  skillId: string;
  nama: string;
  pL: number;
  repetitionNum: number;
  nextReviewAt: string | null;
  status: "Dikuasai" | "Dalam Proses" | "Perlu Remedial";
  selesai: boolean;
}

interface ProgresResponse {
  attempts: AttemptItem[];
  totalKursus: number;
  totalAttempt: number;
  totalSelesai: number;
  rataNilai: number;
  konsistensi?: Konsistensi;
  masteryCps?: MasteryCp[];
}

interface GroupedCourse {
  kursusId: string;
  kursusJudul: string;
  attempts: AttemptItem[];
  rataNilai: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_CURVE },
  },
};

export default function SiswaProgresPage() {
  const [data, setData] = useState<ProgresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/v1/siswa/progres", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setData(j.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groupedCourses: GroupedCourse[] = useMemo(() => {
    if (!data?.attempts.length) return [];
    const groups = new Map<string, AttemptItem[]>();
    for (const a of data.attempts) {
      const key = a.kursusId ?? "tanpa-kursus";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    }
    return Array.from(groups.entries()).map(([key, attempts]) => {
      const first = attempts[0];
      const nilaiList = attempts
        .map((a) => a.nilai)
        .filter((n): n is number => n !== null);
      const rataNilai =
        nilaiList.length > 0
          ? Math.round(nilaiList.reduce((s, n) => s + n, 0) / nilaiList.length)
          : 0;
      return {
        kursusId: key,
        kursusJudul: first?.kursusJudul ?? "Tanpa Kursus",
        attempts,
        rataNilai,
      };
    });
  }, [data]);

  const konsistensi: Konsistensi = data?.konsistensi ?? {
    streakHari: 0,
    hariAktif7: 0,
    mingguAktif: [0, 0, 0, 0, 0, 0, 0],
    totalHariAktif: 0,
  };
  const masteryCps: MasteryCp[] = data?.masteryCps ?? [];
  const maxMingguAktif = Math.max(1, ...konsistensi.mingguAktif);
  const weekdayInits = ["S", "S", "R", "K", "J", "S", "M"];
  const masteryBarColor = (status: string) =>
    status === "Dikuasai"
      ? "bg-emerald-500"
      : status === "Dalam Proses"
        ? "bg-amber-500"
        : "bg-red-400";
  const masteryBadgeClass = (status: string) =>
    status === "Dikuasai"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Dalam Proses"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-600";

  if (loading) {
    return (
      <div>
        <SkeletonList />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_CURVE }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-heading font-bold text-xl text-on-surface mb-2">
          Gagal Memuat
        </h2>
        <p className="text-sm text-on-surface-variant mb-6 text-center max-w-sm">
          {error}
        </p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE }}
        className="flex items-center gap-3 mb-5"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-on-surface">
            Progres Belajar
          </h1>
          <p className="text-xs text-on-surface-variant">
            Riwayat kuis dan capaian belajar kamu
          </p>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.03 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5"
      >
        {[
          { label: "Kursus", value: data?.totalKursus ?? 0, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
          { label: "Kuis", value: data?.totalAttempt ?? 0, icon: Target, color: "text-tertiary", bg: "bg-tertiary/10" },
          { label: "Selesai", value: data?.totalSelesai ?? 0, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Rata-rata", value: data?.rataNilai ?? 0, icon: BarChart3, color: "text-blue-700", bg: "bg-blue-50" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-glass border border-border-precision rounded-2xl p-3.5 shadow-glass"
          >
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", stat.bg)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <p className="font-heading font-bold text-lg text-on-surface tabular-nums leading-none">
              {stat.value}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Konsistensi Belajar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.05 }}
        className="bg-glass border border-border-precision rounded-2xl p-6 shadow-glass mb-5"
      >
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="font-heading font-bold text-on-surface">
            {konsistensi.streakHari > 0
              ? `${konsistensi.streakHari} hari berturut-turut`
              : "Mulai istiqomah hari ini!"}
          </h2>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">
          Hari aktif 7 hari terakhir: {konsistensi.hariAktif7} hari
        </p>
        <div className="flex items-end gap-2.5 mt-4">
          {konsistensi.mingguAktif.map((count, i) => {
            const isActive = count > 0;
            const barHeight = isActive
              ? Math.max(8, (count / maxMingguAktif) * 56)
              : 0;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-6 rounded-full",
                    isActive
                      ? "h-16 bg-primary"
                      : "h-2 bg-surface border border-border-precision",
                  )}
                  style={isActive ? { height: `${barHeight}px` } : undefined}
                />
                <span className="text-[10px] font-bold text-on-surface-variant">
                  {weekdayInits[i]}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-on-surface-variant mt-4">
          Terus istiqomah! Belajar sedikit setiap hari lebih baik daripada
          banyak sekaligus.
        </p>
      </motion.div>

      {/* Penguasaan Materi */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.07 }}
        className="mb-5"
      >
        <h2 className="font-heading text-xl text-on-surface">
          Penguasaan Materi
        </h2>
        <p className="text-xs text-on-surface-variant mb-4">
          Berdasarkan Capaian Pembelajaran
        </p>
        {masteryCps.length === 0 ? (
          <div className="bg-glass border border-border-precision rounded-2xl p-6 text-center shadow-glass">
            <p className="text-sm text-on-surface-variant">
              Belum ada data penguasaan. Ayo kerjakan kuis untuk melihat
              penguasaan materi kamu!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {masteryCps.map((cp) => {
              const pct = Math.round((cp.pL ?? 0) * 100);
              return (
                <div
                  key={cp.skillId}
                  className="bg-glass border border-border-precision rounded-2xl p-4 shadow-glass"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-sm text-on-surface truncate">
                      {cp.nama}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0",
                        masteryBadgeClass(cp.status),
                      )}
                    >
                      {cp.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          masteryBarColor(cp.status),
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-on-surface-variant tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {data && data.attempts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.05 }}
        >
          <EmptyState
            icon={BarChart3}
            title="Belum ada riwayat kuis"
            description="Mulai kerjakan kuis untuk melihat progres belajar kamu di sini."
            action={{ label: "Lihat Kuis", href: "/siswa/quiz" }}
          />
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {groupedCourses.map((course) => (
            <motion.section key={course.kursusId} variants={itemAnim}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-on-surface-variant" />
                  <h2 className="font-heading font-semibold text-on-surface">
                    {course.kursusJudul}
                  </h2>
                </div>
                <span className="text-xs text-on-surface-variant tabular-nums">
                  {course.attempts.length} kuis
                  {course.attempts.some((a) => a.nilai !== null) && (
                    <span className="ml-2 font-semibold text-primary">
                      · Rata-rata: {course.rataNilai}
                    </span>
                  )}
                </span>
              </div>
              <div className="space-y-2">
                {course.attempts.map((a) => {
                  const nilai = a.nilai ?? 0;
                  const dapatNilai = a.tampilkanNilai !== false && a.nilai !== null;
                  const color = !dapatNilai
                    ? "text-on-surface-variant"
                    : nilai >= 80
                      ? "text-emerald-700"
                      : nilai >= 60
                        ? "text-amber-700"
                        : "text-red-600";
                  const bgColor = !dapatNilai
                    ? "bg-surface"
                    : nilai >= 80
                      ? "bg-emerald-50"
                      : nilai >= 60
                        ? "bg-amber-50"
                        : "bg-red-50";
                  return (
                    <div
                      key={a.id}
                      className="bg-glass border border-border-precision rounded-2xl p-4 flex items-center gap-4 shadow-glass hover:bg-white/80 transition-colors duration-200"
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl grid place-items-center shrink-0",
                          bgColor,
                        )}
                      >
                        <span
                          className={cn(
                            "font-heading font-bold text-lg",
                            color,
                          )}
                        >
                          {dapatNilai ? nilai : "—"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-on-surface truncate">
                          {a.quizJudul}
                        </p>
                        <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5 flex-wrap">
                          {new Date(a.waktuMulai).toLocaleString("id-ID")}
                          {dapatNilai && (
                            <>
                              <span>·</span>
                              <span>
                                {a.jumlahBenar} benar / {a.jumlahSalah} salah
                              </span>
                            </>
                          )}
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(a.durasiDetik / 60)}m{" "}
                            {a.durasiDetik % 60}s
                          </span>
                          {a.modeEvaluasi !== "BELAJAR" && (
                            <span className="text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              {a.modeEvaluasi}
                            </span>
                          )}
                        </p>
                      </div>
                      {a.status === "SELESAI" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </motion.div>
      )}
    </div>
  );
}