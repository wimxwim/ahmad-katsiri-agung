"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, TrendingUp, Award } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

interface AnalyticsResponse {
  totalKursus: number;
  totalSiswa: number;
  totalDraft: number;
  totalKuisAktif: number;
  trend: { minggu: string; total: number }[];
}

export default function GuruAnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/guru/analytics", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        setData(j?.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-glass rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Analytics</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Gambaran singkat progres mengajar Anda. Lebih dalam menyusul.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Kursus" value={data?.totalKursus ?? 0} icon={BookOpen} color="#005231" />
        <StatCard label="Siswa Terdaftar" value={data?.totalSiswa ?? 0} icon={Users} color="#005231" />
        <StatCard label="Draft Menunggu" value={data?.totalDraft ?? 0} icon={Award} color="#5a4200" />
        <StatCard label="Kuis Aktif" value={data?.totalKuisAktif ?? 0} icon={TrendingUp} color="#005231" />
      </div>

      <div className="bg-glass border border-border-precision rounded-2xl p-6 shadow-glass">
        <h2 className="font-heading font-semibold text-on-surface mb-3">Aktivitas 4 minggu terakhir</h2>
        {data?.trend && data.trend.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {data.trend.map((t) => (
              <div key={t.minggu} className="text-center">
                <div className="bg-white rounded-xl border border-border-precision p-3 mb-2">
                  <p className="font-heading text-2xl font-bold text-primary">{t.total}</p>
                </div>
                <p className="text-[11px] text-on-surface-variant">{t.minggu}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">Belum ada aktivitas tercatat.</p>
        )}
      </div>
    </div>
  );
}
