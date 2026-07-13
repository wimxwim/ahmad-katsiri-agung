"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle2, Circle, ArrowRight, PartyPopper, X } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

interface MateriItem {
  id: string;
  judul: string;
  ringkasan: string | null;
  urutan: number;
  sudahDibaca: boolean;
  selesai: boolean;
  progressPersen: number;
  publishedAt: string;
}

export default function SiswaMateriListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<MateriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const kursusId = searchParams.get("kursusId");
    const welcome = searchParams.get("welcome");
    if (welcome === "1") setShowWelcome(true);
    const url = new URL("/api/v1/siswa/materi", window.location.origin);
    if (kursusId) url.searchParams.set("kursusId", kursusId);
    fetch(url.toString(), { credentials: "include" })
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
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">{error}</p>
        <button onClick={() => router.refresh()} className="text-sm text-primary hover:underline">Coba lagi</button>
      </div>
    );
  }

  return (
    <div>
      {showWelcome && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <PartyPopper className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-emerald-800 text-sm">Selamat bergabung!</p>
            <p className="text-emerald-700 text-sm mt-0.5">Kamu berhasil mendaftar ke kursus ini. Selamat belajar!</p>
          </div>
          <button onClick={() => setShowWelcome(false)} className="shrink-0 text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <h1 className="font-heading font-bold text-2xl text-on-surface mb-6">Materi Belajar</h1>

      {data.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada materi"
          description="Gurumu belum menerbitkan materi untuk kursus ini. Cek kembali nanti ya."
        />
      ) : (
        <div className="space-y-3">
          {data.map((m) => (
            <Link
              key={m.id}
              href={`/siswa/materi/${m.id}`}
              className="block bg-glass rounded-2xl border border-border-precision p-5 hover:bg-white/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {m.selesai ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : m.sudahDibaca ? (
                      <Circle className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
                    )}
                    <h3 className="font-heading font-semibold text-on-surface truncate">
                      {m.judul}
                    </h3>
                  </div>
                  {m.ringkasan && (
                    <p className="text-sm text-on-surface-variant mt-1 line-clamp-2 ml-6">
                      {m.ringkasan}
                    </p>
                  )}
                  {m.sudahDibaca && !m.selesai && (
                    <div className="mt-2 ml-6 flex items-center gap-3">
                      <div className="flex-1 max-w-[200px]">
                        <div className="w-full bg-border-precision rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${m.progressPersen}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary tabular-nums">
                        {m.progressPersen}%
                      </span>
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-on-surface-variant/40 shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
