"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle2, BarChart3, AlertCircle, ChevronRight, Search } from "lucide-react";

interface SiswaProgres {
  siswaId: string;
  nama: string;
  kelas: string | null;
  noAbsen: string | null;
  totalAttempt: number;
  totalSelesai: number;
  rataNilai: number | null;
  tuntas: boolean;
  latestAttempt: string | null;
}

interface ProgresResponse {
  kursus: { id: string; judul: string };
  totalSiswa: number;
  totalQuiz: number;
  totalAttempt: number;
  siswaProgres: SiswaProgres[];
}

export default function KursusProgresPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<ProgresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/guru/kursus/${id}/progres`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setData(j.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, [id]);

  const filtered = data?.siswaProgres.filter((s) => {
    const q = search.toLowerCase();
    return s.nama.toLowerCase().includes(q);
  }) ?? [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-primary/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-glass rounded-2xl p-5 h-20 animate-pulse" />
          ))}
        </div>
        <div className="bg-glass rounded-2xl p-5 h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 mb-2">{error}</p>
        <Link href="/guru/kursus" className="text-sm text-primary hover:underline">Kembali ke daftar kursus</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="font-heading text-xl text-on-surface mb-2">Data Tidak Ditemukan</h2>
        <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
          Data progres untuk kursus ini tidak tersedia.
        </p>
        <Link href="/guru/kursus" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Kursus
        </Link>
      </div>
    );
  }

  const tuntasCount = data.siswaProgres.filter((s) => s.tuntas).length;
  const belumTuntasCount = data.siswaProgres.filter((s) => !s.tuntas && s.totalAttempt > 0).length;
  const belumMulaiCount = data.siswaProgres.filter((s) => s.totalAttempt === 0).length;

  return (
    <div>
      <Link
        href={`/guru/kursus/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {data.kursus.judul}
      </Link>

      <h1 className="font-heading font-bold text-2xl text-on-surface mb-1">Progres Siswa</h1>
      <p className="text-sm text-on-surface-variant mb-6">
        {data.kursus.judul}
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">SISWA</p>
          <p className="font-heading text-2xl font-bold text-on-surface mt-1">{data.totalSiswa}</p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">QUIZ</p>
          <p className="font-heading text-2xl font-bold text-on-surface mt-1">{data.totalQuiz}</p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">ATTEMPT</p>
          <p className="font-heading text-2xl font-bold text-on-surface mt-1">{data.totalAttempt}</p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">TUNTAS</p>
          <p className="font-heading text-2xl font-bold text-emerald-700 mt-1">{tuntasCount}</p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">REMEDIAL</p>
          <p className="font-heading text-2xl font-bold text-red-600 mt-1">{belumTuntasCount}</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari siswa..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-glass border border-border-precision rounded-2xl p-6 text-center">
          <BarChart3 className="w-8 h-8 text-on-surface-variant/30 mx-auto mb-2" />
          <p className="text-sm text-on-surface-variant">
            {search ? "Tidak ada siswa yang cocok" : "Belum ada siswa terdaftar"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-precision overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-precision bg-surface/50">
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Siswa</th>
                <th className="text-center px-3 py-3 font-medium text-on-surface-variant">Attempt</th>
                <th className="text-center px-3 py-3 font-medium text-on-surface-variant">Nilai</th>
                <th className="text-center px-3 py-3 font-medium text-on-surface-variant">Status</th>
                <th className="text-right px-4 py-3 font-medium text-on-surface-variant"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.siswaId} className="border-b border-border-precision/50 last:border-0 hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-on-surface">{s.nama}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {[s.kelas, s.noAbsen ? `No. ${s.noAbsen}` : ""].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-on-surface font-medium">{s.totalAttempt}</span>
                    <span className="text-xs text-on-surface-variant ml-1">
                      / {s.totalSelesai} selesai
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {s.rataNilai !== null ? (
                      <span className={`font-heading font-bold ${
                        s.rataNilai >= 80 ? "text-emerald-700"
                          : s.rataNilai >= 60 ? "text-amber-700"
                            : "text-red-600"
                      }`}>
                        {s.rataNilai}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/60">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {s.totalAttempt === 0 ? (
                      <span className="text-xs font-bold tracking-wider text-on-surface-variant/50 bg-surface px-2 py-0.5 rounded-full">
                        BARU
                      </span>
                    ) : s.tuntas ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        TUNTAS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        REMEDIAL
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/guru/siswa/${s.siswaId}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Detail
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {belumMulaiCount > 0 && (
        <div className="mt-4 bg-surface border border-border-precision rounded-2xl p-4 flex items-start gap-3">
          <Users className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">{belumMulaiCount} siswa</span> belum mulai mengerjakan quiz apapun.
          </p>
        </div>
      )}
    </div>
  );
}
