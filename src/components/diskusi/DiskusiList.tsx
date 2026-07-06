"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { MessageSquare, RefreshCw } from "lucide-react";

type DiskusiItem = {
  id: string;
  nama: string;
  kategori: string;
  judul: string;
  isi: string;
  waktu: string;
  slug: string;
};

const LABEL_KATEGORI: Record<string, string> = {
  "tanya-jawab": "❓ Tanya Jawab",
  "berbagi-pengalaman": "📖 Berbagi Pengalaman",
  "studi-kasus": "🔍 Studi Kasus",
};

export function DiskusiList() {
  const [data, setData] = useState<DiskusiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDiskusi() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/diskusi");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.diskusi ?? []);
    } catch { setError("Gagal memuat diskusi"); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchDiskusi(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-lg sm:text-xl font-semibold text-on-surface flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
          Semua Diskusi
        </h3>
        <button onClick={fetchDiskusi} disabled={loading} className="p-2 rounded-full hover:bg-primary/5 transition-colors disabled:opacity-50" aria-label="Muat ulang">
          <RefreshCw className={`w-4 h-4 text-primary ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-on-surface-variant">Memuat...</p>
        </div>
      )}

      {error && <p className="text-red-600 text-sm text-center py-8">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <p className="text-on-surface-variant text-sm text-center py-12">
          Belum ada diskusi. Mulailah yang pertama!
        </p>
      )}

      <div className="space-y-4">
        {data.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          >
            <Link
              href={`/diskusi/${item.slug}`}
              className="block bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {LABEL_KATEGORI[item.kategori] || item.kategori}
                </span>
              </div>
              <h4 className="font-heading font-semibold text-on-surface group-hover:text-primary transition-colors mb-1">
                {item.judul}
              </h4>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
                {item.isi}
              </p>
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>👤 {item.nama}</span>
                <span>{item.waktu}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
