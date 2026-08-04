"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Megaphone, AlertCircle, Pin, RefreshCw, Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

interface PengumumanItem {
  id: string;
  judul: string;
  konten: string;
  target: string;
  guruNama: string | null;
  isPinned: boolean;
  publishedAt: string;
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

export default function SiswaPengumumanPage() {
  const [data, setData] = useState<PengumumanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/v1/siswa/pengumuman", {
        credentials: "include",
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || "Gagal memuat");
      }
      const j = await r.json();
      setData(j.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

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
          onClick={() => {
            setError("");
            setLoading(true);
            fetchData();
          }}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </motion.div>
    );
  }

  const pinnedItems = data.filter((p) => p.isPinned);
  const regularItems = data.filter((p) => !p.isPinned);

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
          <Megaphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-on-surface">
            Pengumuman
          </h1>
          <p className="text-xs text-on-surface-variant">
            {data.length > 0
              ? `${data.length} pemberitahuan`
              : "Pemberitahuan dari guru & sekolah"}
          </p>
        </div>
      </motion.div>

      {data.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.05 }}
        >
          <EmptyState
            icon={Megaphone}
            title="Belum ada pengumuman"
            description="Guru dan sekolah akan mengirim pengumuman ke kamu lewat halaman ini. Cek kembali secara berkala."
          />
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {/* Pinned Items */}
          {pinnedItems.map((p) => (
            <motion.div key={p.id} variants={itemAnim}>
              <div className="bg-glass border border-amber-300 rounded-2xl p-4 shadow-glass hover:bg-white/80 transition-colors duration-200">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                    <Pin className="w-3 h-3" />
                    PINNED
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface">
                      {p.judul}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-2 whitespace-pre-wrap leading-relaxed">
                      {p.konten}
                    </p>
                    <p className="text-xs text-on-surface-variant/60 mt-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {p.guruNama || "Guru"} ·{" "}
                      {new Date(p.publishedAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Regular Items */}
          {regularItems.map((p) => (
            <motion.div key={p.id} variants={itemAnim}>
              <div
                className={cn(
                  "bg-glass border border-border-precision rounded-2xl p-4 shadow-glass hover:bg-white/80 transition-colors duration-200",
                )}
              >
                <div className="flex items-start gap-3">
                  {p.target !== "SEMUA" && p.target && (
                    <span className="text-xs font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                      KURSUS
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface">
                      {p.judul}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-2 whitespace-pre-wrap leading-relaxed">
                      {p.konten}
                    </p>
                    <p className="text-xs text-on-surface-variant/60 mt-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {p.guruNama || "Guru"} ·{" "}
                      {new Date(p.publishedAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}