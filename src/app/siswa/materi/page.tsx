"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ArrowRight,
  PartyPopper,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getCached, setCache } from "@/lib/data-cache";

interface MateriItem {
  id: string;
  judul: string;
  ringkasan: string | null;
  urutan: number;
  sudahDibaca: boolean;
  selesai: boolean;
  progressPersen: number;
  publishedAt: string;
  kursusId: string;
}

interface KursusOption {
  id: string;
  judul: string;
}

function MateriContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<MateriItem[]>([]);
  const [kursusList, setKursusList] = useState<KursusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  const kursusId = searchParams.get("kursusId");
  const welcome = searchParams.get("welcome");

  useEffect(() => {
    if (welcome === "1") setShowWelcome(true);

    const cacheKey = `materi:${kursusId || 'all'}`;
    const cached = getCached<MateriItem[]>(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    const url = new URL("/api/v1/siswa/materi", window.location.origin);
    if (kursusId) url.searchParams.set("kursusId", kursusId);

    setLoading(true);
    setError("");

    fetch(url.toString(), { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setCache(cacheKey, j.data || [], 60_000);
        setData(j.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, [kursusId, welcome]);

  useEffect(() => {
    const cached = getCached<KursusOption[]>("materi:kursusList");
    if (cached) {
      setKursusList(cached);
      return;
    }
    fetch("/api/v1/siswa/feed", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return;
        const j = await r.json();
        if (j.kursusList) {
          setCache("materi:kursusList", j.kursusList, 120_000);
          setKursusList(j.kursusList);
        }
      })
      .catch((error) => {
        console.error("[materi] fetch kursus list failed:", error);
      });
  }, []);

  const handleFilterClick = useCallback(
    (id: string | null) => {
      const url = new URL(window.location.pathname, window.location.origin);
      if (id) url.searchParams.set("kursusId", id);
      router.push(url.toString());
    },
    [router],
  );

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError("");
    const cacheKey = `materi:${kursusId || 'all'}`;
    const cached = getCached<MateriItem[]>(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    const url = new URL("/api/v1/siswa/materi", window.location.origin);
    if (kursusId) url.searchParams.set("kursusId", kursusId);
    fetch(url.toString(), { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setCache(cacheKey, j.data || [], 60_000);
        setData(j.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, [kursusId]);

  const uniqueKursusIds = useMemo(
    () => [...new Set(data.map((m) => m.kursusId))],
    [data],
  );
  const showFilter = uniqueKursusIds.length > 1 && kursusList.length > 0;

  if (loading) {
    return (
      <div>
        <SkeletonList />
      </div>
    );
  }

  if (error) {
    return (
      <div>
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
            onClick={handleRetry}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE }}
          className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <PartyPopper className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-emerald-800 text-sm">
              Selamat bergabung!
            </p>
            <p className="text-emerald-700 text-sm mt-0.5">
              Kamu berhasil mendaftar ke kursus ini. Selamat belajar!
            </p>
          </div>
          <button
            onClick={() => setShowWelcome(false)}
            className="shrink-0 text-emerald-500 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
            aria-label="Tutup banner"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_CURVE }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-on-surface">
            Materi Belajar
          </h1>
          <p className="text-xs text-on-surface-variant">
            Akses semua materi pembelajaran
          </p>
        </div>
      </motion.div>

      {/* Kursus Filter */}
      {showFilter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.1 }}
          className="flex flex-wrap gap-1.5 mb-4"
        >
<button
            onClick={() => handleFilterClick(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden",
              !kursusId
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary hover:bg-primary/15",
            )}
          >
            Semua
          </button>
          {kursusList
            .filter((k) => uniqueKursusIds.includes(k.id))
.map((k) => (
              <button
                key={k.id}
                onClick={() => handleFilterClick(k.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden",
                  kursusId === k.id
                    ? "bg-primary text-white"
                    : "bg-primary/10 text-primary hover:bg-primary/15",
                )}
              >
                {k.judul}
              </button>
            ))}
        </motion.div>
      )}

      {/* Empty State */}
      {data.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada materi"
          description="Gurumu belum menerbitkan materi untuk kursus ini. Cek kembali nanti ya."
          action={{ label: "Lihat Kuis Tersedia", href: "/siswa/quiz" }}
        />
      ) : (
        /* Materi List */
        <div className="flex flex-col gap-2">
          {data.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: EASE_CURVE,
                delay: i * 0.08,
              }}
            >
<Link
                href={`/siswa/materi/${m.id}`}
                className="flex items-center gap-3 bg-glass rounded-2xl border border-border-precision p-3.5 shadow-glass hover:bg-white/80 active:scale-[0.99] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.selesai ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                  {m.selesai ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <BookOpen className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-on-surface truncate">
                    {m.judul}
                  </h3>
                  {m.ringkasan && (
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                      {m.ringkasan}
                    </p>
                  )}
                  {m.sudahDibaca && !m.selesai && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 max-w-[120px] h-1 bg-border-precision rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.max(m.progressPersen, 4)}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            ease: EASE_CURVE,
                            delay: i * 0.08 + 0.3,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-primary tabular-nums">
                        {m.progressPersen > 0
                          ? `${m.progressPersen}%`
                          : "Baru"}
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-on-surface-variant/60 mt-1">
                    {m.selesai
                      ? "✓ Selesai"
                      : m.sudahDibaca
                        ? "Sedang dipelajari"
                        : "Belum dibaca"}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-on-surface-variant/30 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiswaMateriListPage() {
  return (
    <Suspense
      fallback={
        <div>
          <SkeletonList />
        </div>
      }
    >
      <MateriContent />
    </Suspense>
  );
}