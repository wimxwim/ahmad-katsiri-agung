"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Library,
  BookOpen,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Search,
  Clock,
  GraduationCap,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

interface KursusSaya {
  kursusId: string;
  judul: string;
  status: string;
  tanggalDaftar: string;
}

const STATUS_LABEL: Record<string, string> = {
  AKTIF: "Aktif",
  NONAKTIF: "Nonaktif",
  SELESAI: "Selesai",
  DITANGGUHKAN: "Ditangguhkan",
};

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

function statusColor(status: string) {
  switch (status) {
    case "AKTIF":
      return "bg-emerald-50 text-emerald-700";
    case "NONAKTIF":
      return "bg-amber-50 text-amber-700";
    case "SELESAI":
      return "bg-blue-50 text-blue-700";
    case "DITANGGUHKAN":
      return "bg-red-50 text-red-700";
    default:
      return "bg-surface text-on-surface-variant";
  }
}

export default function SiswaKursusPage() {
  const [kursus, setKursus] = useState<KursusSaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/enroll/status", { credentials: "include" });
      if (!res.ok) throw new Error("Gagal memuat data");
      const { data } = await res.json();
      setKursus(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const aktifCount = kursus.filter((k) => k.status === "AKTIF").length;

  return (
    <div>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
          <Library className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-on-surface">
            Kursus Saya
          </h1>
          <p className="text-xs text-on-surface-variant">
            {aktifCount > 0
              ? `${aktifCount} kursus aktif`
              : "Kelola kursus yang kamu ikuti"}
          </p>
        </div>
      </motion.div>

      {kursus.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.05 }}
        >
          <EmptyState
            icon={Library}
            title="Belum terdaftar di kursus manapun"
            description="Cari kursus gratis di katalog atau tanya gurumu untuk dibantu mendaftar."
            action={{ label: "Cari Kursus", href: "/kursus" }}
          />
        </motion.div>
      ) : (
        <>
          {/* Stat Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.03 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5"
          >
            {[
              { label: "Total", value: kursus.length, icon: Library, color: "text-primary", bg: "bg-primary/10" },
              { label: "Aktif", value: aktifCount, icon: GraduationCap, color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Selesai", value: kursus.filter((k) => k.status === "SELESAI").length, icon: BookOpen, color: "text-blue-700", bg: "bg-blue-50" },
              { label: "Nonaktif", value: kursus.filter((k) => k.status === "NONAKTIF" || k.status === "DITANGGUHKAN").length, icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
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

          {/* Kursus List */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {kursus.map((k) => (
              <motion.div key={k.kursusId} variants={itemAnim}>
                <Link
                  href={`/siswa/materi?kursusId=${k.kursusId}`}
                  className="flex items-center gap-3 bg-glass rounded-2xl border border-border-precision p-4 shadow-glass hover:bg-white/80 hover:border-primary/25 active:scale-[0.99] transition-all duration-200"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      k.status === "AKTIF"
                        ? "bg-emerald-50 text-emerald-700"
                        : k.status === "SELESAI"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700",
                    )}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-on-surface truncate">
                      {k.judul}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Terdaftar:{" "}
                      {new Date(k.tanggalDaftar).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "px-2 py-1 text-[10px] font-bold rounded-full",
                        statusColor(k.status),
                      )}
                    >
                      {STATUS_LABEL[k.status] || k.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-on-surface-variant/30" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA: Find more courses */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.2 }}
            className="mt-5"
          >
            <Link
              href="/kursus"
              className="flex items-center gap-3 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 rounded-2xl p-4 hover:border-primary/25 hover:bg-primary/10 active:scale-[0.99] transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-primary">
                  Cari Kursus Lain
                </p>
                <p className="text-xs text-on-surface-variant">
                  Jelajahi katalog kursus gratis
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary shrink-0" />
            </Link>
          </motion.div>
        </>
      )}
    </div>
  );
}