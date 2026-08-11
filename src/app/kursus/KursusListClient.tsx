"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { csrfHeaders } from "@/lib/csrf";
import { Search, BookOpen, ArrowRight, Library, UserPlus, Loader2, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  statusPublikasi: string;
  createdAt: string;
}

interface KursusListClientProps {
  initialKursus: KursusItem[];
  initialError: string | null;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_CURVE },
  },
};

export function KursusListClient({ initialKursus, initialError }: KursusListClientProps) {
  const [search, setSearch] = useState("");
  const [kursus, setKursus] = useState<KursusItem[]>(initialKursus);
  const [loading, setLoading] = useState(initialKursus.length === 0);
  const [error, setError] = useState(initialError || "");
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    fetchKursus();
  }, []);

  async function fetchKursus() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/kursus");
      if (!res.ok) throw new Error("Gagal memuat data");
      const { data } = await res.json();
      setKursus(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll(e: React.MouseEvent, kursusId: string, slug: string) {
    e.preventDefault();
    e.stopPropagation();
    setEnrolling(kursusId);
    try {
      const res = await fetch("/api/v1/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify({ kursusId }),
      });
      if (res.status === 401) {
        router.push(`/masuk?portal=siswa&redirect=${encodeURIComponent(`/kursus/${slug}`)}`);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 409) {
        throw new Error(data.error || "Gagal mendaftar");
      }
      setEnrolled((prev) => new Set(prev).add(kursusId));
      router.push(`/siswa/materi?kursusId=${kursusId}&welcome=1`);
    } catch (err) {
      // Silently fail — if already enrolled, redirect anyway
      router.push(`/siswa/materi?kursusId=${kursusId}&welcome=1`);
    } finally {
      setEnrolling(null);
    }
  }

  const filtered = kursus.filter((k) => {
    const q = search.toLowerCase();
    return (
      k.judul.toLowerCase().includes(q) ||
      (k.deskripsi || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-dvh max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_CURVE }}
      >
        <div className="text-left mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-on-surface mb-3">
            Katalog Kursus
          </h1>
          <p className="text-on-surface-variant max-w-lg text-sm">
            Jelajahi kursus yang tersedia. Setiap kursus dibuat dan dipublikasikan oleh guru secara mandiri.
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
          <input
            type="text"
            placeholder="Cari kursus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10.5 pr-4 py-3 rounded-xl bg-white border border-border-precision text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 transition-colors"
          />
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-border-precision p-6 h-52 animate-pulse"
              >
                <div className="w-12 h-12 rounded-xl bg-surface mb-4" />
                <div className="h-5 bg-surface rounded w-2/3 mb-3" />
                <div className="h-3 bg-surface rounded w-full mb-2" />
                <div className="h-3 bg-surface rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6">
              <Library className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchKursus()}
              className="text-sm text-primary font-semibold hover:underline cursor-pointer"
            >
              Coba lagi
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-surface flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-on-surface-variant/20" />
            </div>
            <h3 className="font-heading font-bold text-lg text-on-surface mb-2">
              {search ? "Tidak ada kursus yang cocok" : "Belum ada kursus tersedia"}
            </h3>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
              {search
                ? "Coba ubah kata kunci pencarian atau jelajahi kategori lain."
                : "Kursus akan muncul di sini setelah guru menerbitkan materi. Silakan periksa lagi nanti."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
              >
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((k) => (
              <motion.div key={k.id} variants={cardVariants}>
                <Link
                  href={`/kursus/${k.slug}`}
                  className="block bg-white rounded-2xl border border-border-precision p-5 hover:shadow-glass-lg hover:border-primary/20 transition-all duration-200 group h-full cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-on-surface group-hover:text-primary transition-colors mb-2 text-base">
                    {typeof k.judul === 'string' && k.judul !== '[object Object]' ? k.judul : 'Kursus'}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                    {k.deskripsi || "Belum ada deskripsi"}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border-precision">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        k.statusPublikasi === "PUBLIK"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {k.statusPublikasi === "PUBLIK" ? "Publik" : "Tertutup"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleEnroll(e, k.id, k.slug)}
                        disabled={enrolling === k.id}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {enrolling === k.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : enrolled.has(k.id) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <UserPlus className="w-3 h-3" />
                        )}
                        {enrolled.has(k.id) ? "Terdaftar" : "Daftar"}
                      </button>
                      <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Lihat <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
