"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { BookOpen, Users, Sparkles, ArrowRight, Upload, FileCheck, Layers, GraduationCap, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonDashboardGuru } from "@/components/ui/SkeletonBlocks";

interface DashboardData {
  totalKursus: number;
  totalSiswa: number;
  draftMenunggu: number;
  siswaBelumMengerjakan: number;
  totalKuisDikerjakan: number;
  totalMateriPublished: number;
  totalQuizPublished: number;
  kursusList: { id: string; judul: string; slug: string; deskripsi: string | null; statusPublikasi: string }[];
  weakTopics: { pertanyaan: string; errorRate: number; totalJawab: number }[];
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-amber-50 text-amber-700" },
  PUBLIK: { label: "Publik", color: "bg-emerald-50 text-emerald-700" },
  ARSIP: { label: "Arsip", color: "bg-surface text-on-surface-variant" },
};

const QUICK_ACTIONS = [
  { label: "Upload Dokumen", href: "/guru/upload", icon: Upload, desc: "PDF/DOCX untuk draft AI" },
  { label: "Review Draft AI", href: "/guru/drafts", icon: FileCheck, desc: "Tinjau hasil AI" },
  { label: "Kelola Kelas", href: "/guru/kelas", icon: Layers, desc: "Atur kelas & siswa" },
  { label: "Daftar Siswa", href: "/guru/siswa", icon: Users, desc: "Lihat progres siswa" },
];

export default function GuruBerandaPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/guru/dashboard", { credentials: "include" });
        if (!res.ok) throw new Error("Gagal memuat data");
        const { data: d } = await res.json();
        if (alive) setData(d || null);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchData();
    return () => { alive = false; };
  }, []);

  if (loading) return <SkeletonDashboardGuru />;

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (!data || data.totalKursus === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Belum ada kursus"
        description="Mulai dengan membuat kursus pertama atau upload dokumen untuk menghasilkan materi."
        action={{ label: "Upload Dokumen", href: "/guru/upload" }}
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-on-surface">Ringkasan</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola kursus, siswa, dan draft AI kamu di satu tempat.
          </p>
        </div>
        <Link
          href="/guru/buat"
          className="inline-flex items-center gap-2 self-start sm:self-auto bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all shadow-glass"
        >
          <Sparkles className="w-4 h-4" />
          Buat Kursus dengan AI
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_CURVE }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard label="Total Kursus" value={data.totalKursus} icon={BookOpen} color="#005231" />
        <StatCard label="Siswa Terdaftar" value={data.totalSiswa} icon={Users} color="#005231" />
        <StatCard label="Draft AI Menunggu" value={data.draftMenunggu} icon={FileCheck} color="#5a4200" />
        <StatCard label="Siswa Belum Mengerjakan" value={data.siswaBelumMengerjakan > 0 ? data.siswaBelumMengerjakan : 0} icon={GraduationCap} color="#005231" />
      </motion.div>

      {/* Priority cards — apa yang harus dilakukan sekarang */}
      {data.draftMenunggu > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE, delay: 0.1 }}
          className="mb-6 p-5 rounded-2xl border border-amber-200 bg-amber-50/60 shadow-glass"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </span>
            <div className="flex-1">
              <p className="font-heading font-semibold text-amber-900">
                {data.draftMenunggu} draft AI menunggu review
              </p>
              <p className="text-sm text-amber-700">
                Selesaikan review agar materi dan kuis bisa dipublikasikan ke siswa.
              </p>
            </div>
            <Link
              href="/guru/drafts"
              className="shrink-0 inline-flex items-center gap-1.5 bg-amber-700 text-white px-4 py-2 rounded-full text-xs font-semibold hover:brightness-110 transition-all"
            >
              Review Sekarang
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      )}

      {data.siswaBelumMengerjakan > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE, delay: 0.15 }}
          className="mb-6 p-5 rounded-2xl border border-blue-200 bg-blue-50/60 shadow-glass"
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </span>
            <div className="flex-1">
              <p className="font-heading font-semibold text-blue-900">
                {data.siswaBelumMengerjakan} siswa belum mengerjakan kuis
              </p>
              <p className="text-sm text-blue-700">
                Beberapa siswa belum memulai kuis. Pantau progres mereka di halaman siswa.
              </p>
            </div>
            <Link
              href="/guru/siswa"
              className="shrink-0 inline-flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-semibold hover:brightness-110 transition-all"
            >
              Lihat Siswa
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      )}

      {data.weakTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE, delay: 0.2 }}
          className="mb-6 p-5 rounded-2xl border border-red-200 bg-red-50/60 shadow-glass"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </span>
            <div className="flex-1">
              <p className="font-heading font-semibold text-red-900">
                Topik paling sulit bagi siswa
              </p>
              <p className="text-sm text-red-700">
                Soal dengan tingkat kesalahan tertinggi. Pertimbangkan untuk memberikan remedial.
              </p>
            </div>
            <Link
              href="/guru/analytics"
              className="shrink-0 inline-flex items-center gap-1.5 bg-red-700 text-white px-4 py-2 rounded-full text-xs font-semibold hover:brightness-110 transition-all"
            >
              Lihat Analytics
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {data.weakTopics.map((t, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/60 rounded-xl px-4 py-2.5">
                <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-red-900 truncate">{t.pertanyaan}</p>
                  <p className="text-xs text-red-600">{t.totalJawab} siswa menjawab</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-red-700">{t.errorRate}% salah</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick action cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_CURVE, delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
      >
        {QUICK_ACTIONS.map((qa) => (
          <Link
            key={qa.label}
            href={qa.href}
            className="bg-glass border border-border-precision rounded-2xl p-4 shadow-glass hover:shadow-glass-lg transition-all duration-300 group"
          >
            <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5 group-hover:bg-primary/20 transition-colors">
              <qa.icon className="w-4 h-4" />
            </span>
            <p className="font-heading font-semibold text-sm text-on-surface">{qa.label}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">{qa.desc}</p>
          </Link>
        ))}
      </motion.div>

      <h2 className="font-heading font-semibold text-lg text-on-surface mb-4">Kursus Terbaru</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.kursusList.map((k) => {
          const badge = STATUS_BADGE[k.statusPublikasi] || STATUS_BADGE.DRAFT;
          return (
            <Link
              key={k.id}
              href={`/guru/kursus/${k.id}`}
              className="bg-glass border border-border-precision rounded-2xl sm:rounded-[32px] p-6 shadow-glass hover:shadow-glass-lg transition-all duration-300 block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-full h-1 bg-primary rounded-full flex-1 mr-3" />
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-on-surface mb-1.5">{k.judul}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-2">
                {k.deskripsi || "Tanpa deskripsi"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
