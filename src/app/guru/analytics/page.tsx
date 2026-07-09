"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Users, TrendingUp, Award, AlertTriangle, Send, ChevronRight, BarChart3, XCircle, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

interface KursusBreakdown {
  kursusId: string;
  judul: string;
  totalSiswa: number;
  totalAttempt: number;
  rataNilai: number;
  siswaTuntas: number;
  siswaBelumTuntas: number;
}

interface WeakTopic {
  soalId: string;
  pertanyaan: string;
  tipe: string;
  totalJawab: number;
  totalBenar: number;
  totalSalah: number;
  errorRate: number;
}

interface RemedialItem {
  siswaId: string;
  nama: string;
  rataNilai: number;
  totalAttempt: number;
  kursus: string[];
}

interface AnalyticsResponse {
  totalKursus: number;
  totalSiswa: number;
  totalDraft: number;
  totalKuisAktif: number;
  totalAttempt: number;
  totalSiswaTuntas: number;
  totalSiswaBelumTuntas: number;
  rataNilaiKeseluruhan: number;
  trend: { minggu: string; total: number }[];
  kursusBreakdown: KursusBreakdown[];
  remedialList: RemedialItem[];
  weakTopics: WeakTopic[];
}

export default function GuruAnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/guru/analytics", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j?.data) {
          setError("Gagal memuat data analytics");
        } else {
          setData(j.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Terjadi kesalahan saat memuat data. Coba lagi.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-glass rounded-2xl p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="bg-glass rounded-2xl p-6 h-48 animate-pulse" />
        <div className="bg-glass rounded-2xl p-6 h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-heading text-xl text-on-surface mb-2">Gagal Memuat Analytics</h2>
        <p className="text-on-surface-variant mb-6 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  const noData = !data || data.totalKursus === 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Analytics</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Ringkasan progres belajar siswa
        </p>
      </div>

      {noData ? (
        <div className="bg-glass border border-border-precision rounded-[32px] p-6 sm:p-10 shadow-glass text-center">
          <BarChart3 className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold text-on-surface mb-2">
            Belum ada data analytics
          </h3>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Mulai dengan menambahkan kursus dan siswa. Data analytics akan muncul setelah siswa mulai mengerjakan quiz.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Kursus" value={data.totalKursus} icon={BookOpen} color="#005231" />
            <StatCard label="Siswa Terdaftar" value={data.totalSiswa} icon={Users} color="#005231" />
            <StatCard
              label="Siswa Belum Tuntas"
              value={data.totalSiswaBelumTuntas}
              icon={AlertTriangle}
              color={data.totalSiswaBelumTuntas > 0 ? "#b45309" : "#005231"}
            />
            <StatCard
              label="Rata-rata Nilai"
              value={data.rataNilaiKeseluruhan}
              icon={Award}
              color={data.rataNilaiKeseluruhan >= 70 ? "#005231" : "#b45309"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-glass border border-border-precision rounded-2xl p-5 shadow-glass">
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-1">
                ATTEMPT QUIZ
              </p>
              <p className="font-heading text-2xl font-bold text-on-surface">{data.totalAttempt}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Total pengerjaan quiz oleh siswa
              </p>
            </div>
            <div className="bg-glass border border-border-precision rounded-2xl p-5 shadow-glass">
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-1">
                SISWA TUNTAS
              </p>
              <p className="font-heading text-2xl font-bold text-emerald-700">{data.totalSiswaTuntas}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Siswa dengan rata-rata nilai &ge; 70
              </p>
            </div>
            <div className="bg-glass border border-border-precision rounded-2xl p-5 shadow-glass">
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-1">
                DRAFT MENUNGGU
              </p>
              <p className="font-heading text-2xl font-bold text-tertiary">{data.totalDraft}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                {data.totalDraft > 0
                  ? `${data.totalDraft} draft AI siap di-review`
                  : "Tidak ada draft tertunda"}
              </p>
            </div>
          </div>

          {data.totalSiswaBelumTuntas > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-bold text-on-surface">
                    {data.totalSiswaBelumTuntas} siswa belum tuntas
                    {data.kursusBreakdown.length > 0
                      ? ` dari ${data.kursusBreakdown.length} kursus`
                      : ""}
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {data.totalSiswaBelumTuntas > 3
                      ? "Beberapa siswa perlu perhatian khusus. Cek rekomendasi remedial di bawah."
                      : "Siswa dengan nilai di bawah KKM membutuhkan bimbingan tambahan."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {data.weakTopics.length > 0 && (
            <div className="bg-glass border border-border-precision rounded-2xl p-5 sm:p-6 shadow-glass mb-6">
              <h2 className="font-heading font-semibold text-on-surface mb-4 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Topik Paling Lemah
              </h2>
              <div className="space-y-3">
                {data.weakTopics.map((t) => (
                  <div key={t.soalId}>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-sm text-on-surface font-medium line-clamp-1 flex-1">
                        {t.pertanyaan}
                      </p>
                      <span className="text-xs font-bold text-red-600 tabular-nums shrink-0">
                        {t.errorRate}%
                      </span>
                    </div>
                    <div className="w-full bg-red-50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full transition-all"
                        style={{ width: `${t.errorRate}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {t.totalSalah} salah dari {t.totalJawab} jawaban
                      <span className="ml-2 text-emerald-600">{t.totalBenar} benar</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.remedialList.length > 0 && (
            <div className="bg-glass border border-border-precision rounded-2xl p-5 sm:p-6 shadow-glass mb-6">
              <h2 className="font-heading font-semibold text-on-surface mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Rekomendasi Remedial
              </h2>
              <p className="text-sm text-on-surface-variant mb-4">
                {data.remedialList.length} siswa dengan rata-rata nilai di bawah KKM (70).
                Pertimbangkan untuk memberikan bimbingan tambahan.
              </p>
              <div className="space-y-2">
                {data.remedialList.slice(0, 10).map((r) => (
                  <div
                    key={r.siswaId}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border-precision"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 grid place-items-center font-heading font-bold text-sm shrink-0">
                      {r.rataNilai}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface text-sm truncate">
                        <Link href={`/guru/siswa/${r.siswaId}`} className="hover:underline">
                          {r.nama}
                        </Link>
                      </p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {r.totalAttempt} attempt · {r.kursus.join(", ")}
                      </p>
                    </div>
                    <Link
                      href={`/guru/siswa/${r.siswaId}`}
                      className="text-[10px] font-bold tracking-wider text-primary hover:underline shrink-0 flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Detail
                    </Link>
                  </div>
                ))}
              </div>
              {data.remedialList.length > 10 && (
                <p className="text-xs text-on-surface-variant text-center mt-3">
                  +{data.remedialList.length - 10} siswa lainnya
                </p>
              )}
            </div>
          )}

          {data.kursusBreakdown.length > 0 && (
            <div className="bg-glass border border-border-precision rounded-2xl p-5 sm:p-6 shadow-glass mb-6">
              <h2 className="font-heading font-semibold text-on-surface mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-on-surface-variant" />
                Progres per Kursus
              </h2>
              <div className="space-y-2">
                {data.kursusBreakdown.map((k) => (
                  <div key={k.kursusId}>
                    <Link
                      href={`/guru/kursus/${k.kursusId}/nilai`}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-border-precision hover:border-primary/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface text-sm truncate">{k.judul}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                          {k.totalSiswa} siswa · {k.totalAttempt} attempt
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className={`font-heading font-bold text-sm ${k.rataNilai >= 70 ? "text-emerald-700" : "text-red-600"}`}>
                          {k.rataNilai}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">rata-rata</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-on-surface-variant/40 ml-2 shrink-0" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-glass border border-border-precision rounded-2xl p-5 sm:p-6 shadow-glass">
            <h2 className="font-heading font-semibold text-on-surface mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-on-surface-variant" />
              Aktivitas 4 minggu terakhir
            </h2>
            {data.trend && data.trend.length > 0 ? (
              <>
                <div className="flex items-end gap-2 h-24 mb-2">
                   {data.trend.map((t) => {
                    const maxVal = Math.max(...data.trend.map((x) => x.total), 1);
                    const height = Math.max((t.total / maxVal) * 100, 6);
                    return (
                      <div key={t.minggu} className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-primary tabular-nums mb-1">
                          {t.total}
                        </span>
                        <div
                          className="w-full bg-primary/20 rounded-t-md transition-all"
                          style={{ height: `${height}%`, minHeight: "8px" }}
                        >
                          <div
                            className="w-full h-full bg-primary rounded-t-md"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {data.trend.map((t) => (
                    <p key={t.minggu} className="text-[11px] text-on-surface-variant">{t.minggu}</p>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant">Belum ada aktivitas tercatat.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
