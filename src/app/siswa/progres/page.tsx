"use client";

import { useMemo, useEffect, useState } from "react";
import { BarChart3, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface AttemptItem {
  id: string;
  quizPublishedId: string;
  quizJudul: string;
  nilai: number | null;
  jumlahBenar: number;
  jumlahSalah: number;
  durasiDetik: number;
  waktuMulai: string;
  status: string;
  modeEvaluasi: string;
  tampilkanNilai: boolean;
  kursusId: string | null;
  kursusJudul: string | null;
}

interface ProgresResponse {
  attempts: AttemptItem[];
  totalKursus: number;
  totalAttempt: number;
  totalSelesai: number;
  rataNilai: number;
}

interface GroupedCourse {
  kursusId: string;
  kursusJudul: string;
  attempts: AttemptItem[];
  rataNilai: number;
}

export default function SiswaProgresPage() {
  const [data, setData] = useState<ProgresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/siswa/progres", { credentials: "include" })
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
  }, []);

  const groupedCourses: GroupedCourse[] = useMemo(() => {
    if (!data?.attempts.length) return [];
    const groups = new Map<string, AttemptItem[]>();
    for (const a of data.attempts) {
      const key = a.kursusId ?? "tanpa-kursus";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    }
    return Array.from(groups.entries()).map(([key, attempts]) => {
      const first = attempts[0];
      const nilaiList = attempts
        .map((a) => a.nilai)
        .filter((n): n is number => n !== null);
      const rataNilai = nilaiList.length > 0
        ? Math.round(nilaiList.reduce((s, n) => s + n, 0) / nilaiList.length)
        : 0;
      return {
        kursusId: key,
        kursusJudul: first?.kursusJudul ?? "Tanpa Kursus",
        attempts,
        rataNilai,
      };
    });
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-glass rounded-2xl p-5 h-20 animate-pulse" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-5 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <button
          onClick={() => { setError(""); setLoading(true); window.location.reload(); }}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Progres</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Riwayat kuis dan progress belajar kamu.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">KURSUS</p>
          <p className="font-heading text-2xl font-bold text-on-surface mt-1">
            {data?.totalKursus ?? 0}
          </p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">KUIS</p>
          <p className="font-heading text-2xl font-bold text-on-surface mt-1">
            {data?.totalAttempt ?? 0}
          </p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">SELESAI</p>
          <p className="font-heading text-2xl font-bold text-emerald-700 mt-1">
            {data?.totalSelesai ?? 0}
          </p>
        </div>
        <div className="bg-glass border border-border-precision rounded-2xl p-4">
          <p className="text-xs font-bold tracking-wider text-on-surface-variant">RATA-RATA</p>
          <p className="font-heading text-2xl font-bold text-primary mt-1">
            {data?.rataNilai ?? 0}
          </p>
        </div>
      </div>

      {data && data.attempts.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Belum ada riwayat kuis"
          description="Mulai kerjakan kuis untuk melihat progres belajar kamu di sini."
          action={{ label: "Lihat Kuis", href: "/siswa/quiz" }}
        />
      ) : (
        <div className="space-y-6">
          {groupedCourses.map((course) => (
            <section key={course.kursusId}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-on-surface-variant" />
                  <h2 className="font-heading font-semibold text-on-surface">
                    {course.kursusJudul}
                  </h2>
                </div>
                <span className="text-xs text-on-surface-variant tabular-nums">
                  {course.attempts.length} kuis
                  {course.attempts.some((a) => a.nilai !== null) && (
                    <span className="ml-2 font-semibold text-primary">
                      · Rata-rata: {course.rataNilai}
                    </span>
                  )}
                </span>
              </div>
              <div className="space-y-2">
                {course.attempts.map((a) => {
                  const nilai = a.nilai ?? 0;
                  const dapatNilai = a.tampilkanNilai !== false && a.nilai !== null;
                  const color =
                    !dapatNilai
                      ? "text-on-surface-variant"
                      : nilai >= 80
                        ? "text-emerald-700"
                        : nilai >= 60
                          ? "text-amber-700"
                          : "text-red-600";
                  const bgColor =
                    !dapatNilai
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
                          {dapatNilai ? nilai : "—"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-on-surface truncate">{a.quizJudul}</p>
                        <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-0.5 flex-wrap">
                          {new Date(a.waktuMulai).toLocaleString("id-ID")}
                          {dapatNilai && (
                            <>
                              <span>·</span>
                              <span>{a.jumlahBenar} benar / {a.jumlahSalah} salah</span>
                            </>
                          )}
                          <span>·</span>
                          <span>{Math.floor(a.durasiDetik / 60)}m {a.durasiDetik % 60}s</span>
                          {a.modeEvaluasi !== "BELAJAR" && (
                            <span className="text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded text-xs font-bold">
                              {a.modeEvaluasi}
                            </span>
                          )}
                        </p>
                      </div>
                      {a.status === "SELESAI" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
