"use client";

import { ShieldCheck, School, Users, Sparkles, AlertTriangle, CheckCircle, Info, Activity, CreditCard, Check, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

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
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide", c.bg, c.text)}>
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
      <span className="text-xs font-mono text-on-surface-variant w-7 text-right">{pct}%</span>
    </div>
  );
}

interface PaymentItem {
  id: string;
  amount: number;
  paymentType: string;
  status: string;
  proofImageUrl: string | null;
  notes: string | null;
  verifiedAt: string | null;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

interface OwnerMetrics {
  totalGuru: number;
  totalSiswa: number;
  totalKursus: number;
  aiTokensToday: number;
  aiTokensMonth: number;
  aiRequestsToday: number;
  activeGurus7d: number;
}

export default function OwnerIndex() {
  const [triData, setTriData] = useState<TRIResult[] | null>(null);
  const [metrics, setMetrics] = useState<OwnerMetrics | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(() => {
    setPaymentsLoading(true);
    fetch("/api/v1/owner/payments?status=pending")
      .then((r) => r.json())
      .then((d) => setPayments(d.data || []))
      .catch(() => {})
      .finally(() => setPaymentsLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/owner/tri")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setTriData(d.data);
          setMetrics(d.metrics ?? null);
        }
      })
      .catch(() => setError("Gagal mengambil data TRI"))
      .finally(() => setLoading(false));
    fetchPayments();
  }, [fetchPayments]);

  async function handleVerify(paymentId: string, action: "confirm" | "reject") {
    await fetch("/api/v1/owner/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, action }),
    });
    fetchPayments();
  }

  return (
    <div>
      {/* header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-3 py-1 text-xs font-bold tracking-[0.18em] text-tertiary">
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

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface text-sm">Guru Aktif</h3>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface tabular-nums">
            {metrics ? metrics.totalGuru : "—"}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            {metrics ? `${metrics.activeGurus7d} aktif 7 hari terakhir` : "Memuat..."}
          </p>
        </div>

        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <School className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface text-sm">Siswa & Kursus</h3>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface tabular-nums">
            {metrics ? metrics.totalSiswa : "—"}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            {metrics ? `${metrics.totalKursus} kursus` : "Memuat..."}
          </p>
        </div>

        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface text-sm">AI Hari Ini</h3>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface tabular-nums">
            {metrics ? metrics.aiRequestsToday : "—"}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            {metrics ? `${(metrics.aiTokensToday / 1000).toFixed(1)}K token` : "Memuat..."}
          </p>
        </div>

        <div className="bg-glass border border-border-precision rounded-[24px] p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-heading font-semibold text-on-surface text-sm">AI Bulan Ini</h3>
          </div>
          <p className="font-heading font-bold text-3xl text-on-surface tabular-nums">
            {metrics ? `${(metrics.aiTokensMonth / 1000).toFixed(0)}K` : "—"}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">total token</p>
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
          <div className="mt-6">
            <EmptyState
              icon={Users}
              title="Belum ada guru terdaftar"
              description="Sistem siap menerima guru pertama. Guru dapat mendaftar melalui halaman /daftar."
            />
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
                      <p className="text-xs text-on-surface-variant">{guru.email}</p>
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
                      <span className="text-xs text-on-surface-variant w-28 shrink-0">{KOMPONEN_LABELS[k]}</span>
                      <MiniBar value={guru.komponen[k]} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payments Verification */}
      <div className="mt-8 bg-glass border border-border-precision rounded-[32px] p-6 sm:p-8 shadow-glass-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-on-surface">Verifikasi Pembayaran</h2>
            <p className="text-xs text-on-surface-variant">Konfirmasi atau tolak bukti pembayaran siswa</p>
          </div>
        </div>

        {paymentsLoading ? (
          <div className="mt-6 py-8 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon={CreditCard} title="Tidak ada pembayaran pending" description="Semua pembayaran sudah diverifikasi." />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="rounded-[20px] border border-border-precision bg-white/40 p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-on-surface">{p.userName || "—"}</span>
                    <span className="text-xs text-on-surface-variant">{p.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <span>Rp {p.amount.toLocaleString("id-ID")}</span>
                    <span>•</span>
                    <span>{p.notes || "—"}</span>
                    <span>•</span>
                    <span>{new Date(p.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.proofImageUrl && (
                    <a href={p.proofImageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mr-2">
                      Lihat Bukti
                    </a>
                  )}
                  <button
                    onClick={() => handleVerify(p.id, "confirm")}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:brightness-110 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Konfirmasi
                  </button>
                  <button
                    onClick={() => handleVerify(p.id, "reject")}
                    className="inline-flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:brightness-110 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Tolak
                  </button>
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
