"use client";

import { Building2, BookOpen, Sparkles, Users, GraduationCap, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AdminData {
  totalGuru: number;
  totalKursus: number;
  totalSiswa: number;
  aiQuotaUsed: number;
  aiQuotaLimit: number;
  guruList: { id: string; nama: string; email: string; totalKursus: number; totalSiswa: number }[];
}

export default function AdminSekolahIndex() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin-sekolah/dashboard", { credentials: "include" });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass animate-pulse">
              <div className="h-4 w-16 bg-primary/5 rounded" />
              <div className="h-8 w-12 bg-primary/5 rounded mt-2" />
            </div>
          ))}
        </div>
        <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass animate-pulse">
          <div className="h-5 w-32 bg-primary/5 rounded mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-primary/5 rounded mb-2" />
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
            <Building2 className="w-3 h-3" />
            ADMIN SEKOLAH
          </span>
          <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">Kelola sekolah Anda</h1>
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

  const stats = data ? [
    { label: "Guru", value: data.totalGuru, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Kursus", value: data.totalKursus, icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
    { label: "Siswa", value: data.totalSiswa, icon: GraduationCap, color: "bg-amber-50 text-amber-600" },
    { label: "Kuota AI", value: `${data.aiQuotaUsed}/${data.aiQuotaLimit}`, icon: Sparkles, color: "bg-purple-50 text-purple-600" },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-badge text-primary">
          <Building2 className="w-3 h-3" />
          ADMIN SEKOLAH
        </span>
        <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">Kelola sekolah Anda</h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
          Pantau guru, kursus, dan progres siswa di sekolah Anda dari satu tempat.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-glass border border-border-precision rounded-xl p-5 shadow-glass">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-on-surface-variant">{stat.label}</span>
              </div>
              <p className="font-heading font-bold text-2xl text-on-surface">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {data && data.guruList.length > 0 ? (
        <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass">
          <h3 className="font-heading font-semibold text-on-surface mb-4">Daftar Guru</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-precision text-left">
                  <th className="pb-3 font-semibold text-on-surface-variant">Nama</th>
                  <th className="pb-3 font-semibold text-on-surface-variant">Email</th>
                  <th className="pb-3 font-semibold text-on-surface-variant text-center">Kursus</th>
                  <th className="pb-3 font-semibold text-on-surface-variant text-center">Siswa</th>
                </tr>
              </thead>
              <tbody>
                {data.guruList.map((guru) => (
                  <tr key={guru.id} className="border-b border-border-precision/50 last:border-0">
                    <td className="py-3 font-medium text-on-surface">{guru.nama}</td>
                    <td className="py-3 text-on-surface-variant truncate max-w-[120px] sm:max-w-none">{guru.email}</td>
                    <td className="py-3 text-center text-on-surface-variant">{guru.totalKursus}</td>
                    <td className="py-3 text-center text-on-surface-variant">{guru.totalSiswa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass text-center">
          <Users className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant text-sm">Belum ada guru terdaftar di sekolah ini.</p>
          <p className="text-on-surface-variant/70 text-xs mt-1">
            Guru akan mendaftar dengan kode sekolah yang diberikan admin.
          </p>
        </div>
      )}
    </div>
  );
}