"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  PartyPopper,
  X,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
        setData(j.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, [kursusId, welcome]);

  useEffect(() => {
    fetch("/api/v1/siswa/feed", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return;
        const j = await r.json();
        if (j.kursusList) {
          setKursusList(j.kursusList);
        }
      })
      .catch(() => {});
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
      <div className="px-3 sm:px-5 lg:px-8 py-5 sm:py-8">
        <SkeletonList />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 sm:px-5 lg:px-8 py-5 sm:py-8">
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
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 lg:px-8 py-5 sm:py-8">
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
            className="shrink-0 text-emerald-500 hover:text-emerald-700"
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
        className="mb-8"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center mb-4 shadow-lg">
          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-on-surface mb-2">
          Materi Belajar
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-lg">
          Akses semua materi pembelajaran dari kursus yang kamu ikuti. Pelajari,
          pahami, dan selesaikan setiap modul.
        </p>
      </motion.div>

      {/* Kursus Filter */}
      {showFilter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <button
            onClick={() => handleFilterClick(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all",
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
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all",
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
        />
      ) : (
        /* Materi Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                className="block bg-glass rounded-2xl sm:rounded-[32px] border border-border-precision p-5 sm:p-6 shadow-glass hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group"
              >
                {/* Gradient Card Header */}
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center p-6 mb-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <p className="font-heading text-lg sm:text-xl text-white text-center leading-snug relative z-10">
                    {m.judul}
                  </p>
                  <div className="absolute top-3 right-3 z-10">
                    {m.selesai ? (
                      <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selesai
                      </span>
                    ) : m.sudahDibaca ? (
                      <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        <Circle className="w-3.5 h-3.5" />
                        Belum Selesai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        <Sparkles className="w-3.5 h-3.5" />
                        Baru
                      </span>
                    )}
                  </div>
                </div>

                {/* Ringkasan */}
                {m.ringkasan && (
                  <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
                    {m.ringkasan}
                  </p>
                )}

                {/* Progress */}
                {m.sudahDibaca && !m.selesai && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-border-precision rounded-full h-2">
                        <motion.div
                          className="bg-primary h-2 rounded-full"
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
                    </div>
                    <span className="text-xs font-bold text-primary tabular-nums">
                      {m.progressPersen > 0
                        ? `${m.progressPersen}%`
                        : "Baru"}
                    </span>
                  </div>
                )}

                {m.selesai && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">
                      Selesai dipelajari
                    </span>
                  </div>
                )}

                {!m.sudahDibaca && (
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-on-surface-variant/30" />
                    <span className="text-xs text-on-surface-variant/60">
                      Belum dibaca
                    </span>
                  </div>
                )}
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
        <div className="px-3 sm:px-5 lg:px-8 py-5 sm:py-8">
          <SkeletonList />
        </div>
      }
    >
      <MateriContent />
    </Suspense>
  );
}