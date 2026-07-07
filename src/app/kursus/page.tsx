"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  isPublic: boolean;
  createdAt: string;
}

export default function KatalogKursusPage() {
  const [search, setSearch] = useState("");
  const [kursus, setKursus] = useState<KursusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchKursus() {
      try {
        const res = await fetch("/api/v1/kursus");
        if (!res.ok) throw new Error("Gagal memuat data");
        const { data } = await res.json();
        setKursus((data || []).filter((k: KursusItem) => k.isPublic));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }
    fetchKursus();
  }, []);

  const filtered = kursus.filter((k) => {
    const q = search.toLowerCase();
    return k.judul.toLowerCase().includes(q) || (k.deskripsi || "").toLowerCase().includes(q);
  });

  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 pt-24 sm:pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-on-surface mb-3">
            Katalog Kursus
          </h1>
          <p className="text-on-surface-variant max-w-lg mx-auto">
            Jelajahi kursus Akidah Akhlak untuk SMP/MTs. Belajar dengan model Deep Learning yang mindful, meaningful, dan joyful.
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-on-surface-variant/40" />
          <input
            type="text"
            placeholder="Cari kursus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10.5 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40"
          />
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-border-precision p-6 h-48 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-2">{error}</p>
            <button onClick={() => window.location.reload()} className="text-sm text-primary hover:underline">Coba lagi</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-3" />
            <p className="text-on-surface-variant">
              {search ? "Tidak ada kursus yang cocok" : "Belum ada kursus tersedia"}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((k, i) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: EASE_CURVE }}
              >
                <Link
                  href={`/kursus/${k.slug}`}
                  className="block bg-white rounded-2xl border border-border-precision p-6 hover:shadow-glass-lg transition-all group h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-on-surface group-hover:text-primary transition-colors mb-2">
                    {k.judul}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                    {k.deskripsi || ""}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border-precision">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      k.isPublic ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {k.isPublic ? "Publik" : "Privat"}
                    </span>
                    <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Lihat <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
