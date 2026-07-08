"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { BookOpen, Users, Award, TrendingUp, Sparkles, ArrowRight, Upload } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonDashboardGuru } from "@/components/ui/SkeletonBlocks";

interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  harga: number;
  isPublic: boolean;
  createdAt: string;
}

export default function GuruBerandaPage() {
  const [kursus, setKursus] = useState<KursusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/kursus", { credentials: "include" });
        if (!res.ok) throw new Error("Gagal memuat data");
        const { data } = await res.json();
        if (alive) setKursus(data || []);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchData();
    return () => {
      alive = false;
    };
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

  if (kursus.length === 0) {
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        <StatCard label="Total Kursus" value={kursus.length} icon={BookOpen} color="#005231" />
        <StatCard label="Total Siswa" value="-" icon={Users} color="#005231" trend="Segera" />
        <StatCard label="Quiz Selesai" value="-" icon={Award} color="#005231" trend="Segera" />
        <StatCard label="Rata-rata Skor" value="-" icon={TrendingUp} color="#005231" trend="Segera" />
      </motion.div>

      <h2 className="font-heading font-semibold text-lg text-on-surface mb-4">Kursus Terbaru</h2>
      {kursus.length === 0 ? (
        <div className="bg-glass border border-border-precision rounded-[32px] p-6 sm:p-10 shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-heading text-xl font-bold text-on-surface">Selamat datang di Ruang Guru!</h3>
              <p className="text-sm text-on-surface-variant">Mari mulai dengan 3 langkah pertama.</p>
            </div>
          </div>

          <ol className="space-y-3 my-6">
            <li className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-border-precision/40">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold grid place-items-center shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-semibold text-on-surface">Buat kursus pertama</p>
                <p className="text-sm text-on-surface-variant">
                  Kursus adalah wadah untuk mengelompokkan materi, kuis, dan siswa.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-border-precision/40">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold grid place-items-center shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-semibold text-on-surface">Upload dokumen PDF atau DOCX</p>
                <p className="text-sm text-on-surface-variant">
                  AI akan membuat draft materi, kuis, dan soal. Anda yang memutuskan hasilnya.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-border-precision/40">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-sm font-bold grid place-items-center shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-semibold text-on-surface">Undang siswa ke kelas</p>
                <p className="text-sm text-on-surface-variant">
                  Buat kelas dan tambahkan siswa, atau import dari CSV.
                </p>
              </div>
            </li>
          </ol>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/guru/buat"
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
            >
              Buat Kursus Pertama
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/guru/upload"
              className="inline-flex items-center gap-2 bg-white text-primary border border-primary/20 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/5 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Dokumen
            </Link>
            <Link
              href="/guru/kelas"
              className="inline-flex items-center gap-2 bg-white text-primary border border-primary/20 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/5 transition-colors"
            >
              <Users className="w-4 h-4" />
              Buat Kelas
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kursus.map((k) => (
            <Link
              key={k.id}
              href={`/guru/kursus/${k.id}`}
              className="bg-glass border border-border-precision rounded-2xl sm:rounded-[32px] p-6 shadow-glass hover:shadow-glass-lg transition-all duration-300 block"
            >
              <div className="w-full h-1 bg-primary rounded-full mb-4" />
              <h3 className="font-heading font-semibold text-on-surface mb-1.5">{k.judul}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
                {k.deskripsi || "Tanpa deskripsi"}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {k.isPublic ? "PUBLIK" : "PRIVAT"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
