"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { Search, BookOpen, Download, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import { EmptyState } from "@/components/ui/EmptyState";
import { csrfHeaders } from "@/lib/csrf";
import { KKM } from "@/lib/constants";

// Bento Analytics-lite: CourseProgress + ScoreDistribution reuse jika ada summary
// Jika belum ada summary API, hanya list + KKM badge + EmptyState + search (tanpa dummy)
import { CourseProgress } from "@/components/analytics/CourseProgress";
import ScoreDistribution from "@/components/analytics/ScoreDistribution";

interface KursusItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  statusPublikasi?: string;
  enrolledCount?: number;
  rataNilai?: number | null;
  siswaTuntas?: number | null;
}

type SummaryRow = {
  kursusId: string;
  judul: string;
  totalSiswa: number;
  totalAttempt: number;
  rataNilai: number;
  siswaTuntas: number;
  siswaBelumTuntas: number;
};

const STATUS_OPTIONS = ["Semua", "DRAFT", "PUBLIK", "PRIVAT", "KRABAT", "ARSIP"] as const;

export default function NilaiListPage() {
  const [kursus, setKursus] = useState<KursusItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Analytics-lite: optional summary, tidak dummy — hanya tampil jika API tersedia
  const [summary, setSummary] = useState<SummaryRow[] | null>(null);
  const [scoreDist, setScoreDist] = useState<{ bucket0_59: number; bucket60_69: number; bucket70_79: number; bucket80_89: number; bucket90_100: number } | null>(null);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(kursus.map((k) => ({ Kursus: k.judul, Deskripsi: k.deskripsi ?? "-", Status: k.statusPublikasi ?? "DRAFT", RataNilai: k.rataNilai ?? "-", SiswaTuntas: k.siswaTuntas ?? "-" })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nilai");
    XLSX.writeFile(wb, "nilai-akal.xlsx");
  };

  async function fetchData() {
    try {
      const res = await fetch("/api/v1/kursus", { credentials: "include", headers: { ...csrfHeaders() } });
      if (!res.ok) throw new Error("Gagal memuat data");
      const { data } = await res.json();
      setKursus(data || []);
      // Try fetch analytics summary jika ada endpoint (silent fail, tanpa dummy)
      try {
        const r2 = await fetch("/api/v1/guru/analytics/summary", { credentials: "include", headers: { ...csrfHeaders() } });
        if (r2.ok) {
          const j = await r2.json();
          // dukung shape { kursusBreakdown, scoreDistribution } atau { data }
          if (j.kursusBreakdown && Array.isArray(j.kursusBreakdown)) setSummary(j.kursusBreakdown);
          else if (j.data && Array.isArray(j.data)) setSummary(j.data);
          if (j.scoreDistribution) setScoreDist(j.scoreDistribution);
          else if (j.distribution) setScoreDist(j.distribution);
        }
      } catch {
        // ignore — analytics-lite opsional
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = kursus.filter((k) => {
    const q = search.toLowerCase();
    const matchSearch = k.judul.toLowerCase().includes(q) || (k.deskripsi || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "Semua" ? true : (k.statusPublikasi || "DRAFT") === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" role="status" aria-label="Memuat daftar nilai">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-glass rounded-[32px] p-6 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">{error}</p>
        <button onClick={() => { setError(""); setLoading(true); fetchData(); }} className="text-sm text-primary hover:underline min-h-11 min-w-11 px-4 py-2.5 inline-flex items-center justify-center">Coba lagi</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header KKM pill + export */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="font-heading font-bold text-2xl text-on-surface">Daftar Kursus — Nilai</h1>
          <span className="shrink-0 inline-flex items-center rounded-full bg-white border border-border-precision text-xs font-medium px-3 py-1.5 min-h-11 text-muted-foreground">
            KKM {KKM}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-border-precision px-3 py-2 text-xs font-semibold text-on-surface hover:border-primary/20 transition-colors min-h-11">
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Search + filter status */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <label htmlFor="cari-nilai" className="sr-only">Cari kursus</label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <input
            id="cari-nilai"
            aria-label="Cari kursus"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kursus..."
            className="w-full pl-10 pr-4 py-2.5 min-h-11 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm"
          />
        </div>
        <div className="relative">
          <label htmlFor="filter-status-nilai" className="sr-only">Filter status</label>
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none" />
          <select
            id="filter-status-nilai"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2.5 min-h-11 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer min-w-[160px]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === "Semua" ? "Semua Status" : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bento Analytics-lite: 2 chart mini jika ada data summary (tanpa dummy) */}
      {(summary && summary.length > 0) || scoreDist ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {summary && summary.length > 0 ? (
            <CourseProgress data={summary} />
          ) : (
            <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-6">
              <h3 className="font-heading font-semibold text-sm text-foreground">Progress per Kursus</h3>
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground text-center px-4">
                Belum ada data progress
              </div>
            </div>
          )}
          {scoreDist ? (
            <ScoreDistribution data={scoreDist} />
          ) : (
            <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-6">
              <h3 className="font-heading font-semibold text-sm text-foreground">Distribusi Nilai</h3>
              <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground text-center px-4">
                Belum ada data — ajak siswa kerjakan quiz
              </div>
            </div>
          )}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        kursus.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada kursus"
            description="Buat kursus dulu untuk lihat nilai"
            action={{ label: "Buat Kursus", href: "/guru/buat" }}
            secondaryAction={{ label: "Lihat panduan nilai", href: "/panduan-ai" }}
          />
        ) : (
          <div className="text-center py-12 bg-glass rounded-[32px] border border-border-precision">
            <BookOpen className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-on-surface-variant">
              Tidak ada kursus yang cocok
            </p>
          </div>
        )
      ) : (
        <motion.div className="space-y-4" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
          {filtered.map((k) => (
            <motion.div key={k.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}><Link
              key={k.id}
              href={`/guru/kursus/${k.id}/nilai`}
              className="bg-glass border border-border-precision rounded-[32px] p-6 shadow-glass hover:shadow-glass-lg transition-all duration-300 flex items-center justify-between min-h-11 gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-on-surface truncate">{k.judul}</h3>
                  <span className="inline-flex items-center rounded-full bg-white border border-border-precision text-xs font-medium px-2 py-0.5 text-muted-foreground">
                    KKM {KKM}
                  </span>
                  {k.statusPublikasi && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2 py-0.5">
                      {k.statusPublikasi}
                    </span>
                  )}
                </div>
                <p className="text-sm text-on-surface-variant truncate mt-1">{k.deskripsi || "Tanpa deskripsi"}</p>
                {/* Preview nilai rata + tuntas jika ada (tanpa dummy) */}
                {(k.rataNilai != null || k.siswaTuntas != null) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {k.rataNilai != null && <span>Rata {k.rataNilai} </span>}
                    {k.siswaTuntas != null && <span>• {k.siswaTuntas} tuntas</span>}
                  </p>
                )}
              </div>
              <span className="text-primary text-sm font-semibold shrink-0 min-h-11 inline-flex items-center px-3 py-2.5 group-hover:translate-x-0.5 transition-transform">Lihat Nilai →</span>
            </Link></motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
