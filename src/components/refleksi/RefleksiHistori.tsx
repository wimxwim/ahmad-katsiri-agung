"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { History, RefreshCw } from "lucide-react";
import { EASE_CURVE } from "@/lib/constants";

type RefleksiItem = {
  id: string;
  nama: string;
  pelajaran: string;
  akhlakBaik: string;
  perluDiperbaiki: string;
  waktu: string;
};

export function RefleksiHistori() {
  const [data, setData] = useState<RefleksiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchRefleksi() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/refleksi");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.refleksi ?? []);
    } catch {
      setError("Gagal memuat histori refleksi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRefleksi();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_CURVE, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-lg sm:text-xl font-semibold text-on-surface flex items-center gap-2">
          <History className="w-5 h-5 text-primary" aria-hidden="true" />
          Histori Refleksi
        </h3>
        <button
          onClick={fetchRefleksi}
          disabled={loading}
          className="p-2 rounded-full hover:bg-primary/5 transition-colors disabled:opacity-50"
          aria-label="Muat ulang"
        >
          <RefreshCw
            className={`w-4 h-4 text-primary ${loading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-on-surface-variant">Memuat...</p>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm text-center py-8">{error}</p>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-on-surface-variant text-sm text-center py-12">
          Belum ada refleksi. Jadilah yang pertama!
        </p>
      )}

      <div className="space-y-4">
        {data.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-primary">
                {item.nama}
              </span>
              <span className="text-xs text-on-surface-variant">
                {item.waktu}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-on-surface">📖 Dipelajari:</span>
                <p className="text-on-surface-variant mt-0.5">
                  {item.pelajaran}
                </p>
              </div>
              <div>
                <span className="font-medium text-on-surface">💚 Akhlak Baik:</span>
                <p className="text-on-surface-variant mt-0.5">
                  {item.akhlakBaik}
                </p>
              </div>
              <div>
                <span className="font-medium text-on-surface">🔄 Perlu Diperbaiki:</span>
                <p className="text-on-surface-variant mt-0.5">
                  {item.perluDiperbaiki}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
