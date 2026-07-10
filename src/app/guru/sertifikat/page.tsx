"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Award, Clock, Users, ArrowRight } from "lucide-react";
import { EASE_CURVE } from "@/lib/constants";

interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
}

export default function SertifikatPage() {
  const [kursus, setKursus] = useState<KursusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/kursus", { credentials: "include" });
        if (!res.ok) throw new Error("Gagal memuat data");
        const { data } = await res.json();
        setKursus(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-6 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
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
          <p className="text-sm text-on-surface-variant">Kelola penerbitan sertifikat siswa</p>
        </div>
      </div>

      {kursus.length === 0 ? (
        <div className="text-center py-16 bg-glass rounded-2xl border border-border-precision">
          <Award className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant mb-1">Belum ada kursus</p>
          <p className="text-sm text-on-surface-variant/60">
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
              className="bg-glass border border-border-precision rounded-2xl sm:rounded-[32px] p-6 shadow-glass"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h3 className="font-heading font-semibold text-on-surface truncate">
                      {k.judul}
                    </h3>
                  </div>
                  <p className="text-sm text-on-surface-variant line-clamp-1 mb-3">
                    {k.deskripsi || "Tanpa deskripsi"}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant/60">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Sertifikat dibuat: 0
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center min-w-[120px]">
                    <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-xs text-amber-700 font-heading font-semibold">
                      Segera Hadir
                    </p>
                    <p className="text-xs text-amber-600/60">
                      Fitur dalam pengembangan
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-on-surface-variant/20 hidden sm:block" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
