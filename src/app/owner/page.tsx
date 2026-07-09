"use client";

import { ShieldCheck, School, Users, Sparkles, AlertTriangle, CheckCircle, Info, Activity } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface KomponenTRI {
  materi: number;
  responsivitas: number;
  gradingSpeed: number;
  variasi: number;
  efektivitas: number;
  konsistensi: number;
}

interface TRIResult {
  guruId: string;
  nama: string;
  email: string;
  triScore: number;
  label: string;
  komponen: KomponenTRI;
}

const KOMPONEN_LABELS: Record<keyof KomponenTRI, string> = {
  materi: "Materi",
  responsivitas: "Responsivitas",
  gradingSpeed: "Kecepatan Grading",
  variasi: "Variasi Konten",
  efektivitas: "Efektivitas",
  konsistensi: "Konsistensi",
};

function TRILabelBadge({ label }: { label: string }) {
  const config: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
    expert: { bg: "bg-emerald-500/15", text: "text-emerald-700", icon: CheckCircle },
    baik: { bg: "bg-blue-500/15", text: "text-blue-700", icon: CheckCircle },
    perlu_perhatian: { bg: "bg-amber-500/15", text: "text-amber-700", icon: AlertTriangle },
    butuh_dukungan: { bg: "bg-red-500/15", text: "text-red-700", icon: AlertTriangle },
  };
  const c = config[label] ?? config.butuh_dukungan;
  const Icon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide", c.bg, c.text)}>
      <Icon className="w-3 h-3" />
      {label === "expert" ? "Expert"
        : label === "baik" ? "Baik"
        : label === "perlu_perhatian" ? "Perlu Perhatian"
        : "Butuh Dukungan"}
    </span>
  );
}

function MiniBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  let barColor = "bg-primary";
  if (pct < 30) barColor = "bg-red-400";
  else if (pct < 60) barColor = "bg-amber-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-mono text-on-surface-variant w-7 text-right">{pct}%</span>
    </div>
  );
}

export default function OwnerIndex() {
  const [triData, setTriData] = useState<TRIResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/owner/tri")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setTriData(d.data);
      })
      .catch(() => setError("Gagal mengambil data TRI"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-tertiary">
          <ShieldCheck className="w-3 h-3" />
          OWNER CONSOLE
        </span>
        <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">
          Pusat kendali AKAL Center
        </h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
          Pantau sekolah, pengguna, readiness guru, dan biaya AI dari satu tempat.
        </p>
      </div>

      {/* placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <School className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">Manajemen Sekolah</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Onboarding sekolah, paket langganan, dan konfigurasi subdomain.
          </p>
          <span className="inline-flex items-center mt-4 text-[10px] font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>

        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">Pengguna & Role</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Lihat semua pengguna, ubah role, dan audit aktivitas mencurigakan.
          </p>
          <span className="inline-flex items-center mt-4 text-[10px] font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>

        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface">AI Cost & Quota</h3>
          </div>
          <p className="text-sm text-on-surface-variant">
            Pantau penggunaan token per sekolah dan setel rate limit global.
          </p>
          <span className="inline-flex items-center mt-4 text-[10px] font-bold tracking-wider text-tertiary bg-tertiary/10 px-2 py-1 rounded-full">
            SEGERA
          </span>
        </div>
      </div>

      {/* TRI Section */}
      <div className="bg-glass border border-border-precision rounded-[32px] p-6 sm:p-8 shadow-glass-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-on-surface">Teacher Readiness Index</h2>
            <p className="text-xs text-on-surface-variant">Skor kesiapan mengajar semua guru — berdasarkan data aktivitas 90 hari terakhir</p>
          </div>
        </div>

        {loading && (
          <div className="mt-6 py-12 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-on-surface-variant">Memuat data TRI...</span>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && triData?.length === 0 && (
          <div className="mt-6 p-6 rounded-xl bg-primary/5 border border-primary/10 text-sm text-on-surface-variant text-center">
            Belum ada guru terdaftar di sistem.
          </div>
        )}

        {!loading && triData && triData.length > 0 && (
          <div className="mt-6 space-y-4">
            {triData.map((guru) => (
              <div
                key={guru.guruId}
                className="rounded-[20px] border border-border-precision bg-white/40 p-5 transition-all hover:shadow-glass"
              >
                {/* header guru */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {guru.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-sm text-on-surface">{guru.nama}</p>
                      <p className="text-[11px] text-on-surface-variant">{guru.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={cn(
                        "font-heading font-bold text-lg tabular-nums",
                        guru.triScore >= 0.7 ? "text-emerald-600"
                          : guru.triScore >= 0.4 ? "text-amber-600"
                          : "text-red-600"
                      )}>
                        {Math.round(guru.triScore * 100)}
                      </span>
                      <span className="text-xs text-on-surface-variant ml-0.5">/100</span>
                    </div>
                    <TRILabelBadge label={guru.label} />
                  </div>
                </div>

                {/* komponen bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                  {(Object.keys(KOMPONEN_LABELS) as (keyof KomponenTRI)[]).map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="text-[11px] text-on-surface-variant w-28 shrink-0">{KOMPONEN_LABELS[k]}</span>
                      <MiniBar value={guru.komponen[k]} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* note */}
      <div className="mt-6 p-4 rounded-[16px] border border-primary/15 bg-primary/5">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-on-surface-variant">
            <b>Teacher Readiness Index</b> adalah skor 0-100 yang mengukur kesiapan mengajar berdasarkan
            6 dimensi: materi, responsivitas, kecepatan grading, variasi konten, efektivitas, dan konsistensi.
            Data diperbarui setiap kali halaman ini dimuat. Kembali ke{" "}
            <Link href="/" className="text-primary font-semibold hover:underline">beranda</Link>{" "}
            atau{" "}
            <Link href="/guru/beranda" className="text-primary font-semibold hover:underline">ruang guru</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
