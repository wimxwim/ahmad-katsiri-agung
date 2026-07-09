"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, AlertCircle, BarChart3, GraduationCap, Search } from "lucide-react";

interface SiswaProfil {
  id: string;
  nama: string;
  email: string;
  kelas: string | null;
  noAbsen: string | null;
}

interface KursusItem {
  id: string;
  judul: string;
}

interface AttemptItem {
  id: string;
  quizJudul: string;
  kursusJudul: string | null;
  modeEvaluasi: string;
  nilai: number | null;
  jumlahBenar: number;
  jumlahSalah: number;
  durasiDetik: number;
  waktuMulai: string;
  status: string;
}

interface DetailResponse {
  siswa: SiswaProfil;
  kursus: KursusItem[];
  totalAttempt: number;
  totalSelesai: number;
  rataNilai: number | null;
  tuntas: boolean | null;
  attempts: AttemptItem[];
}

export default function GuruSiswaDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/guru/siswa/${id}`, { credentials: "include" })
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-primary/5 rounded-lg animate-pulse" />
        <div className="bg-glass rounded-2xl p-6 h-32 animate-pulse" />
        <div className="bg-glass rounded-2xl p-6 h-48 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 mb-2">{error}</p>
        <Link href="/guru/siswa" className="text-sm text-primary hover:underline">Kembali ke daftar siswa</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="font-heading text-xl text-on-surface mb-2">Siswa Tidak Ditemukan</h2>
        <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
          Data siswa tidak tersedia atau telah dihapus.
        </p>
        <Link href="/guru/siswa" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Siswa
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/guru/siswa"
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>

      <div className="bg-glass border border-border-precision rounded-2xl p-5 sm:p-6 shadow-glass mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-2xl text-on-surface truncate">
              {data.siswa.nama}
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {data.siswa.email}
              {data.siswa.kelas && <span className="ml-2">· Kelas {data.siswa.kelas}</span>}
              {data.siswa.noAbsen && <span className="ml-2">· No. {data.siswa.noAbsen}</span>}
            </p>
          </div>
          {data.tuntas !== null && (
            <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
              data.tuntas ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
              {data.tuntas ? "TUNTAS" : "BELUM TUNTAS"}
            </span>
          )}
        </div>
        {data.kursus.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {data.kursus.map((k) => (
              <Link
                key={k.id}
                href={`/guru/kursus/${k.id}/nilai`}
                className="inline-flex items-center gap-1 text-xs bg-primary/5 text-primary px-2.5 py-1 rounded-full hover:bg-primary/10 transition-colors"
              >
                <BookOpen className="w-3 h-3" />
                {k.judul}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">ATTEMPT</p>
          <p className="font-heading text-2xl font-bold text-on-surface mt-1">{data.totalAttempt}</p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">SELESAI</p>
          <p className="font-heading text-2xl font-bold text-emerald-700 mt-1">{data.totalSelesai}</p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">RATA-RATA</p>
          <p className={`font-heading text-2xl font-bold mt-1 ${
            data.rataNilai !== null
              ? data.rataNilai >= 70 ? "text-emerald-700" : "text-red-600"
              : "text-on-surface-variant"
          }`}>
            {data.rataNilai !== null ? data.rataNilai : "—"}
          </p>
        </div>
      </div>

      <h2 className="font-heading font-semibold text-lg text-on-surface mb-3">Riwayat Quiz</h2>

      {data.attempts.length === 0 ? (
        <div className="bg-glass border border-border-precision rounded-2xl p-6 text-center">
          <BarChart3 className="w-8 h-8 text-on-surface-variant/30 mx-auto mb-2" />
          <p className="text-sm text-on-surface-variant">Siswa belum mengerjakan quiz apapun.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.attempts.map((a) => {
            const nilai = a.nilai ?? 0;
            const color =
              !a.nilai
                ? "text-on-surface-variant"
                : nilai >= 80
                  ? "text-emerald-700"
                  : nilai >= 60
                    ? "text-amber-700"
                    : "text-red-600";
            const bgColor =
              !a.nilai
                ? "bg-surface"
                : nilai >= 80
                  ? "bg-emerald-50"
                  : nilai >= 60
                    ? "bg-amber-50"
                    : "bg-red-50";

            return (
              <div
                key={a.id}
                className="bg-glass border border-border-precision rounded-2xl p-4 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 ${bgColor}`}>
                  <span className={`font-heading font-bold text-lg ${color}`}>
                    {a.nilai !== null ? nilai : "—"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface truncate">{a.quizJudul}</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5 flex-wrap">
                    {a.kursusJudul && <span>{a.kursusJudul}</span>}
                    {a.nilai !== null && (
                      <><span>·</span><span>{a.jumlahBenar} benar / {a.jumlahSalah} salah</span></>
                    )}
                    <span>·</span>
                    <span>{Math.floor(a.durasiDetik / 60)}m {a.durasiDetik % 60}s</span>
                    {a.modeEvaluasi !== "BELAJAR" && (
                      <span className="text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {a.modeEvaluasi}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                    {new Date(a.waktuMulai).toLocaleString("id-ID")}
                  </p>
                </div>
                {a.status === "SELESAI" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
