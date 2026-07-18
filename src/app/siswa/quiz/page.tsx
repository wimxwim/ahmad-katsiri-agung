"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { ClipboardList, Clock, AlertCircle, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { getCached, setCache } from "@/lib/data-cache";

interface QuizItem {
  id: string;
  judul: string;
  modeEvaluasi: string;
  durasiMenit: number;
  totalSoal: number;
  sudahDikerjakan: boolean;
  nilaiTerbaik: number | null;
  publishedAt: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_CURVE },
  },
};

function modeBadge(mode: string, sudah: boolean) {
  if (sudah) {
    return (
      <span className="text-[11px] font-bold tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
        SELESAI
      </span>
    );
  }

  switch (mode) {
    case "CBT":
      return (
        <span className="text-[11px] font-bold tracking-wider text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded-full">
          CBT
        </span>
      );
    case "ULANGAN":
      return (
        <span className="text-[11px] font-bold tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
          ULANGAN
        </span>
      );
    case "BELAJAR":
      return (
        <span className="text-[11px] font-bold tracking-wider text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full">
          BELAJAR
        </span>
      );
    default:
      return null;
  }
}

export default function SiswaQuizListPage() {
  const [data, setData] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const cached = getCached<QuizItem[]>("quiz:list");
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetch("/api/v1/siswa/quiz", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setCache("quiz:list", j.data || [], 60_000);
        setData(j.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <SkeletonList />;
  }

  if (error) {
    return (
      <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-5 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-xs text-red-700 mb-3">{error}</p>
<button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full text-xs font-semibold hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          {loading ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Memuat...</>
          ) : (
            <><RefreshCw className="w-3.5 h-3.5" /> Coba Lagi</>
          )}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-on-surface">Kuis & Evaluasi</h1>
          <p className="text-xs text-on-surface-variant">Uji pemahamanmu</p>
        </div>
      </motion.div>

      {/* Guide Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.05 }}
        className="bg-glass rounded-2xl border border-border-precision p-3.5 mb-4"
      >
        <p className="text-xs font-semibold text-on-surface mb-2">Cara mengerjakan:</p>
        <div className="flex gap-3 text-[11px] text-on-surface-variant">
          <span>1. Pilih kuis</span>
          <span>2. Kerjakan soal</span>
          <span>3. Lihat skor</span>
        </div>
      </motion.div>

      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada quiz"
          description="Gurumu belum menerbitkan quiz. Kerjakan materi terlebih dahulu ya."
          action={{ label: "Lihat Materi", href: "/siswa/materi" }}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          {data.map((q) => (
            <motion.div key={q.id} variants={item}>
              <Link
                href={`/siswa/cbt/${q.id}`}
                className="flex items-center gap-3 bg-glass rounded-2xl border border-border-precision p-3.5 shadow-glass hover:bg-white/80 active:scale-[0.99] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    q.sudahDikerjakan
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {q.sudahDikerjakan ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <ClipboardList className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-on-surface truncate">{q.judul}</h3>
                    {modeBadge(q.modeEvaluasi, q.sudahDikerjakan)}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {q.durasiMenit} menit
                    </span>
                    <span>{q.totalSoal} soal</span>
                    {q.sudahDikerjakan && q.nilaiTerbaik !== null && q.nilaiTerbaik !== undefined && (
                      <span className="text-emerald-700 font-bold">Nilai {q.nilaiTerbaik}</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-on-surface-variant/30 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}