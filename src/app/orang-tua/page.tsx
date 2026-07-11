"use client";

import { Heart, BookOpen, TrendingUp, Megaphone, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OrangTuaData {
  namaAnak: string;
  kelas: string;
  totalMateri: number;
  totalSelesai: number;
  nilaiRata: number | null;
  quizTerakhir: { judul: string; nilai: number; tanggal: string } | null;
  pengumuman: { id: string; judul: string; ringkasan: string; tanggal: string }[];
}

export default function OrangTuaIndex() {
  const [data, setData] = useState<OrangTuaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/orang-tua/dashboard", { credentials: "include" });
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-8 animate-pulse">
          <div className="h-6 w-32 bg-primary/5 rounded-full" />
          <div className="h-8 w-64 bg-primary/5 rounded mt-3" />
          <div className="h-4 w-96 bg-primary/5 rounded mt-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass animate-pulse">
              <div className="h-4 w-16 bg-primary/5 rounded" />
              <div className="h-8 w-12 bg-primary/5 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-badge text-primary">
            <Heart className="w-3 h-3" />
            ORANG TUA
          </span>
          <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">Pantau progres anak Anda</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 bg-glass rounded-2xl border border-border-precision">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-on-surface-variant text-sm mb-4">{error}</p>
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-badge text-primary">
            <Heart className="w-3 h-3" />
            ORANG TUA
          </span>
          <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">Pantau progres anak Anda</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 bg-glass rounded-2xl border border-border-precision">
          <Heart className="w-10 h-10 text-on-surface-variant/30 mb-3" />
          <p className="text-on-surface-variant text-sm">Belum ada data progres tersedia.</p>
          <p className="text-on-surface-variant/70 text-xs mt-1 max-w-sm text-center">
            Hubungi guru atau admin sekolah untuk menghubungkan akun orang tua dengan akun siswa.
          </p>
        </div>
      </div>
    );
  }

  const progressPercent = data.totalMateri > 0 ? Math.round((data.totalSelesai / data.totalMateri) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-badge text-primary">
          <Heart className="w-3 h-3" />
          ORANG TUA
        </span>
        <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">
          Progres {data.namaAnak}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Kelas {data.kelas} — Pantau perkembangan belajar anak Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-glass border border-border-precision rounded-xl p-5 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-on-surface-variant">Progres Materi</span>
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">{progressPercent}%</p>
          <div className="w-full bg-primary/10 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant mt-2">{data.totalSelesai} dari {data.totalMateri} materi selesai</p>
        </div>

        <div className="bg-glass border border-border-precision rounded-xl p-5 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-on-surface-variant">Nilai Rata-rata</span>
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">
            {data.nilaiRata !== null ? data.nilaiRata : "—"}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            {data.quizTerakhir
              ? `Terakhir: ${data.quizTerakhir.judul} (${data.quizTerakhir.nilai})`
              : "Belum ada kuis dikerjakan"}
          </p>
        </div>

        <div className="bg-glass border border-border-precision rounded-xl p-5 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-on-surface-variant">Pengumuman</span>
          </div>
          <p className="font-heading font-bold text-2xl text-on-surface">{data.pengumuman.length}</p>
          <p className="text-xs text-on-surface-variant mt-2">Pemberitahuan dari guru</p>
        </div>
      </div>

      {data.pengumuman.length > 0 && (
        <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass">
          <h3 className="font-heading font-semibold text-on-surface mb-4">Pengumuman Terbaru</h3>
          <div className="space-y-3">
            {data.pengumuman.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-start gap-3 pb-3 border-b border-border-precision/50 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-on-surface">{p.judul}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{p.ringkasan}</p>
                  <p className="text-xs text-on-surface-variant/70 mt-1">{new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.quizTerakhir && (
        <div className="mt-6 bg-glass border border-border-precision rounded-xl p-6 shadow-glass">
          <h3 className="font-heading font-semibold text-on-surface mb-4">Kuis Terakhir</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-on-surface truncate max-w-[200px] sm:max-w-xs">{data.quizTerakhir.judul}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                {new Date(data.quizTerakhir.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-xl font-heading font-bold text-lg",
              data.quizTerakhir.nilai >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}>
              {data.quizTerakhir.nilai}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}