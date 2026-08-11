"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { FileText, ClipboardList, Clock, AlertCircle, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { setCache } from "@/lib/data-cache";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils";

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

interface SoalBatch {
  aiGenerationId: string;
  judul: string;
  kursusJudul: string;
  totalSoal: number;
  sudahDikerjakan: number;
  nilaiTerbaik: number;
  publishedAt: string;
}

type TabKey = "latihan" | "kuis";

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

export default function SiswaEvaluasiPage() {
  const [tab, setTab] = useState<TabKey>("latihan");
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [batches, setBatches] = useState<SoalBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch("/api/v1/siswa/quiz", { credentials: "include" }).then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat kuis");
        }
        return r.json();
      }),
      fetch("/api/v1/siswa/soal", { credentials: "include" }).then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat latihan");
        }
        return r.json();
      }),
    ])
      .then(([quizJson, soalJson]) => {
        const q = (quizJson.data || []) as QuizItem[];
        const s = (soalJson.data || []) as SoalBatch[];
        setQuizzes(q);
        setBatches(s);
        setCache("quiz:list", q, 60_000);
        setCache("soal:list", s, 60_000);
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

  return (
    <div>
      <Breadcrumb items={[{ label: "Beranda", href: "/siswa/beranda" }, { label: "Evaluasi" }]} />
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
          <h1 className="font-heading font-bold text-lg text-on-surface">Evaluasi</h1>
          <p className="text-xs text-on-surface-variant">Kerjakan kuis dan latihan untuk menguasai materi</p>
        </div>
      </motion.div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="bg-glass rounded-2xl border border-border-precision p-3.5">
          <p className="text-xs font-semibold text-primary mb-1">Kuis</p>
          <p className="text-[11px] text-on-surface-variant">Dinilai guru · ada batas waktu</p>
        </div>
        <div className="bg-glass rounded-2xl border border-border-precision p-3.5">
          <p className="text-xs font-semibold text-tertiary mb-1">Latihan</p>
          <p className="text-[11px] text-on-surface-variant">Mandiri · kunci langsung terlihat</p>
        </div>
      </div>

      <div className="flex border-b border-border-precision mb-4">
        <button
          onClick={() => setTab("latihan")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors",
            tab === "latihan"
              ? "text-primary border-primary"
              : "text-on-surface-variant border-transparent hover:text-on-surface",
          )}
        >
          Latihan
        </button>
        <button
          onClick={() => setTab("kuis")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors",
            tab === "kuis"
              ? "text-primary border-primary"
              : "text-on-surface-variant border-transparent hover:text-on-surface",
          )}
        >
          Kuis
        </button>
      </div>

      {loading ? (
        <SkeletonList />
      ) : error ? (
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
      ) : tab === "latihan" ? (
        batches.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Belum ada latihan"
            description="Gurumu belum menerbitkan latihan. Baca materi dan kerjakan kuis terlebih dahulu ya."
            action={{ label: "Lihat Materi", href: "/siswa/materi" }}
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {batches.map((b) => (
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
        )
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada kuis"
          description="Gurumu belum menerbitkan kuis. Kerjakan materi terlebih dahulu ya."
          action={{ label: "Lihat Materi", href: "/siswa/materi" }}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          {quizzes.map((q) => (
            <motion.div key={q.id} variants={item}>
              <Link
                href={`/siswa/cbt/${q.id}`}
                className="flex items-center gap-3 bg-glass rounded-2xl border border-border-precision p-3.5 shadow-glass hover:bg-white/80 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    q.sudahDikerjakan ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary",
                  )}
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
