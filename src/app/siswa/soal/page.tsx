"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { FileText, AlertCircle, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { getCached, setCache } from "@/lib/data-cache";

interface SoalBatch {
  aiGenerationId: string;
  judul: string;
  kursusJudul: string;
  totalSoal: number;
  sudahDikerjakan: number;
  nilaiTerbaik: number;
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

export default function SiswaSoalListPage() {
  const [data, setData] = useState<SoalBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const cached = getCached<SoalBatch[]>("soal:list");
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetch("/api/v1/siswa/soal", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setCache("soal:list", j.data || [], 60_000);
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
          className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full text-xs font-semibold hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tertiary to-tertiary/70 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-on-surface">Soal Latihan</h1>
          <p className="text-xs text-on-surface-variant">Latihan mandiri untuk menguasai materi</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.05 }}
        className="bg-glass rounded-2xl border border-border-precision p-3.5 mb-4"
      >
        <p className="text-xs font-semibold text-on-surface mb-2">Cara latihan:</p>
        <div className="flex gap-3 text-[11px] text-on-surface-variant">
          <span>1. Pilih batch soal</span>
          <span>2. Kerjakan semuanya</span>
          <span>3. Lihat hasil</span>
        </div>
      </motion.div>

      {data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada soal latihan"
          description="Gurumu belum menerbitkan soal latihan. Baca materi dan kerjakan quiz terlebih dahulu ya."
          action={{ label: "Lihat Materi", href: "/siswa/materi" }}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          {data.map((b) => (
            <motion.div key={b.aiGenerationId} variants={item}>
              <Link
                href={`/siswa/soal/${b.aiGenerationId}`}
                className="flex items-center gap-3 bg-glass rounded-2xl border border-border-precision p-3.5 shadow-glass hover:bg-white/80 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-on-surface truncate">{b.judul}</h3>
                    <span className="text-[11px] font-bold tracking-wider text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded-full">
                      LATIHAN
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-on-surface-variant">
                    <span>{b.totalSoal} soal</span>
                    <span>·</span>
                    <span className="text-on-surface-variant/60">{b.kursusJudul}</span>
                  </div>
                  {b.sudahDikerjakan > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full mt-1.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Selesai · Nilai {b.nilaiTerbaik}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-on-surface-variant bg-on-surface-variant/10 px-1.5 py-0.5 rounded-full mt-1.5">
                      Belum dikerjakan
                    </span>
                  )}
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