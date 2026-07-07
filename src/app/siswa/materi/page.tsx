"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Circle, ArrowRight } from "lucide-react";

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
  const [data, setData] = useState<MateriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/siswa/materi", { credentials: "include" })
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
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-5 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-primary hover:underline">Coba lagi</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-on-surface mb-6">Materi Belajar</h1>

      {data.length === 0 ? (
        <div className="text-center py-12 bg-glass rounded-2xl border border-border-precision">
          <BookOpen className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant">Belum ada materi untuk kursus Anda</p>
        </div>
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
                    <div className="mt-2 ml-6">
                      <div className="w-full bg-border-precision rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${m.progressPersen}%` }}
                        />
                      </div>
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
