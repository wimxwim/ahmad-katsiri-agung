"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Award, Users, Loader2, CheckCircle2 } from "lucide-react";
import { EASE_CURVE } from "@/lib/constants";
import { apiFetch } from "@/lib/api-helpers";

interface KursusSertifikat {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  totalSertifikat: number;
  totalSiswaSelesai: number;
}

export default function SertifikatPage() {
  const [kursus, setKursus] = useState<KursusSertifikat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await apiFetch<KursusSertifikat[]>("/api/v1/guru/sertifikat/kursus");
    if (!result.ok) {
      setError(result.error);
    } else {
      setKursus(result.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerate(kursusId: string) {
    setGenerating(kursusId);
    setError("");
    const result = await apiFetch(`/api/v1/guru/sertifikat/generate`, {
      method: "POST",
      body: JSON.stringify({ kursusId }),
    });
    if (result.ok) {
      setGenerated(kursusId);
      setTimeout(() => setGenerated(null), 3000);
      await load();
    } else {
      setError(result.error);
    }
    setGenerating(null);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-glass rounded-[32px] p-6 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">{error}</p>
        <button
          onClick={() => load()}
          className="text-sm text-primary hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Award className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl text-on-surface">Sertifikat</h1>
          <p className="text-sm text-on-surface-variant">Terbitkan sertifikat untuk siswa yang telah menyelesaikan kursus</p>
        </div>
      </div>

      {kursus.length === 0 ? (
        <div className="text-center py-16 bg-glass rounded-[32px] border border-border-precision">
          <Award className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant mb-1">Belum ada kursus</p>
          <p className="text-sm text-on-surface-variant/70">
            Buat kursus terlebih dahulu untuk mulai menerbitkan sertifikat
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {kursus.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_CURVE, delay: i * 0.08 }}
              className="bg-glass border border-border-precision rounded-[32px] p-6 shadow-glass"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-on-surface truncate mb-1">
                    {k.judul}
                  </h3>
                  <p className="text-sm text-on-surface-variant line-clamp-1 mb-3">
                    {k.deskripsi || "Tanpa deskripsi"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant/70">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {k.totalSertifikat} sertifikat diterbitkan
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {k.totalSiswaSelesai} siswa eligible
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerate(k.id)}
                  disabled={generating === k.id || k.totalSiswaSelesai === 0}
                  className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {generating === k.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Menerbitkan...</>
                  ) : generated === k.id ? (
                    <><CheckCircle2 className="w-4 h-4" /> Berhasil</>
                  ) : (
                    <><Award className="w-4 h-4" /> Generate Sertifikat</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}