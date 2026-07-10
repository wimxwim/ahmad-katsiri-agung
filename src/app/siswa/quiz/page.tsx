"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Clock, CheckCircle2, AlertCircle, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

interface QuizItem {
  id: string;
  judul: string;
  modeEvaluasi: string;
  durasiMenit: number;
  totalSoal: number;
  sudahDikerjakan: boolean;
  nilaiTerbaik: number | null;
  publishedAt: string;
}

export default function SiswaQuizListPage() {
  const [data, setData] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/siswa/quiz", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.error || "Gagal memuat");
        }
        return r.json();
      })
      .then((j) => {
        setData(j.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Gagal memuat");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <SkeletonList />;
  }

  if (error) {
    return (
      <div className="bg-glass border border-border-precision rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Kuis</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Uji pemahamanmu dari materi yang sudah kamu pelajari.
        </p>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada quiz"
          description="Gurumu belum menerbitkan quiz. Kerjakan materi terlebih dahulu ya."
          action={{ label: "Lihat Materi", href: "/siswa/materi" }}
        />
      ) : (
        <div className="space-y-3">
          {data.map((q) => (
            <Link
              key={q.id}
              href={`/siswa/cbt/${q.id}`}
              className="block bg-glass border border-border-precision rounded-2xl p-5 hover:border-primary/30 hover:shadow-glass-lg transition-all"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
                    q.sudahDikerjakan ? "bg-emerald-50 text-emerald-700" : "bg-tertiary/10 text-tertiary"
                  }`}
                >
                  {q.sudahDikerjakan ? <CheckCircle2 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface">{q.judul}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs font-bold tracking-wider">
                    {q.modeEvaluasi === "CBT" && (
                      <span className="text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full">CBT</span>
                    )}
                    {q.modeEvaluasi === "ULANGAN" && (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">ULANGAN</span>
                    )}
                    {q.modeEvaluasi === "BELAJAR" && (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">BELAJAR</span>
                    )}
                    <span className="text-on-surface-variant flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {q.durasiMenit} menit
                    </span>
                    <span className="text-on-surface-variant">{q.totalSoal} soal</span>
                  </div>
                  {q.sudahDikerjakan && q.nilaiTerbaik != null && (
                    <p className="mt-2 text-sm font-semibold text-emerald-700">
                      Nilai terbaik: {q.nilaiTerbaik}
                    </p>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant">Mulai →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
