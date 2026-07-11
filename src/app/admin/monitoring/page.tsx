"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Users,
  CreditCard,
  Zap,
  RefreshCw,
  Shield,
} from "lucide-react";

interface MonitoringData {
  suspiciousQuizzes: Array<{
    id: string;
    siswaId: string;
    quizPublishedId: string;
    nilai: number;
    durasiDetik: number;
    waktuMulai: string;
    status: string;
    namaSiswa: string;
    email: string;
  }>;
  multipleSessions: Array<{
    userId: string;
    sessionCount: number;
    nama: string;
    email: string;
    role: string;
  }>;
  failedTransactions: Array<{
    id: string;
    siswaId: string;
    kursusId: string;
    jumlah: number;
    status: string;
    createdAt: string;
    namaSiswa: string;
    email: string;
  }>;
  recentErrors: Array<{
    userId: string;
    soalId: string;
    jawabanSiswa: string;
    isBenar: boolean;
    waktuJawabDetik: number;
    createdAt: string;
    nama: string;
    email: string;
  }>;
  userStats: Array<{
    role: string;
    totalUsers: number;
  }>;
  timestamp: string;
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    fetchRef.current = fetchData;
  });

  useEffect(() => {
    let alive = true;
    async function poll() {
      if (!alive) return;
      await fetchRef.current();
    }
    poll();
    const interval = setInterval(poll, 30000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/monitoring");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setError(null);
      } else {
        setError(json.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-on-surface-variant">Memuat data monitoring...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="bg-glass border border-border-precision rounded-xl p-8 shadow-glass max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl text-on-surface mb-2">
            Error Memuat Data
          </h2>
          <p className="text-on-surface-variant mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="font-heading font-bold text-3xl text-on-surface">
            Monitoring Dashboard
          </h1>
        </div>
        <p className="text-on-surface-variant">
          Pantau aktivitas mencurigakan dan anomali sistem secara real-time
        </p>
        <p className="text-xs text-on-surface-variant mt-2">
          Terakhir update: {new Date(data.timestamp).toLocaleString("id-ID")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          label="Quiz Mencurigakan"
          value={data.suspiciousQuizzes.length}
          color="red"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Multi Session"
          value={data.multipleSessions.length}
          color="orange"
        />
        <StatCard
          icon={<CreditCard className="w-6 h-6" />}
          label="Transaksi Gagal"
          value={data.failedTransactions.length}
          color="yellow"
        />
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          label="Jawaban Cepat"
          value={data.recentErrors.length}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Quiz Selesai < 60 Detik"
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          count={data.suspiciousQuizzes.length}
        >
          {data.suspiciousQuizzes.length === 0 ? (
            <EmptyState message="Tidak ada quiz mencurigakan" />
          ) : (
            <div className="space-y-3">
              {data.suspiciousQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="border border-border-precision rounded-lg p-3 bg-surface/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-on-surface text-sm">
                        {quiz.namaSiswa}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {quiz.email}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                      {quiz.durasiDetik}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Nilai: {quiz.nilai}</span>
                    <span>
                      {new Date(quiz.waktuMulai).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="User dengan >3 Session Aktif"
          icon={<Users className="w-5 h-5 text-orange-500" />}
          count={data.multipleSessions.length}
        >
          {data.multipleSessions.length === 0 ? (
            <EmptyState message="Tidak ada user multi-session" />
          ) : (
            <div className="space-y-3">
              {data.multipleSessions.map((session) => (
                <div
                  key={session.userId}
                  className="border border-border-precision rounded-lg p-3 bg-surface/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-on-surface text-sm">
                        {session.nama}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {session.email}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                      {session.sessionCount} session
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Role: {session.role}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Transaksi Gagal (24 Jam)"
          icon={<CreditCard className="w-5 h-5 text-yellow-500" />}
          count={data.failedTransactions.length}
        >
          {data.failedTransactions.length === 0 ? (
            <EmptyState message="Tidak ada transaksi gagal" />
          ) : (
            <div className="space-y-3">
              {data.failedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="border border-border-precision rounded-lg p-3 bg-surface/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-on-surface text-sm">
                        {tx.namaSiswa}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {tx.email}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Rp {tx.jumlah.toLocaleString("id-ID")}</span>
                    <span>
                      {new Date(tx.createdAt).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Jawaban < 3 Detik"
          icon={<Zap className="w-5 h-5 text-blue-500" />}
          count={data.recentErrors.length}
        >
          {data.recentErrors.length === 0 ? (
            <EmptyState message="Tidak ada jawaban cepat" />
          ) : (
            <div className="space-y-3">
              {data.recentErrors.slice(0, 10).map((err, idx) => (
                <div
                  key={idx}
                  className="border border-border-precision rounded-lg p-3 bg-surface/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-on-surface text-sm">
                        {err.nama}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {err.email}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                      {err.waktuJawabDetik}s
                    </span>
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    <p>
                      Jawaban:{" "}
                      <span className={err.isBenar ? "text-green-600" : "text-red-600"}>
                        {err.isBenar ? "Benar" : "Salah"}
                      </span>
                    </p>
                    <p>{new Date(err.createdAt).toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-8 bg-glass border border-border-precision rounded-xl p-6 shadow-glass">
        <h2 className="font-heading font-bold text-xl text-on-surface mb-4">
          Statistik User
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data.userStats.map((stat) => (
            <div
              key={stat.role}
              className="text-center p-4 bg-surface/50 rounded-lg border border-border-precision"
            >
              <p className="text-2xl font-bold text-primary">{stat.totalUsers}</p>
              <p className="text-xs text-on-surface-variant mt-1 uppercase">
                {stat.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses = {
    red: "bg-red-100 text-red-700 border-red-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <div
      className={`bg-glass border border-border-precision rounded-xl p-6 shadow-glass ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-heading font-bold text-lg text-on-surface">
            {title}
          </h2>
        </div>
        <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-on-surface-variant">
      <p className="text-sm">{message}</p>
    </div>
  );
}
