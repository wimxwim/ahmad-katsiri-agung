"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  isPublic: boolean;
  createdAt: string;
}

export default function KursusListPage() {
  const [kursus, setKursus] = useState<KursusItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/kursus", { credentials: "include" });
        if (!res.ok) throw new Error("Gagal memuat kursus");
        const { data } = await res.json();
        setKursus(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat kursus");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = kursus.filter(
    (k) =>
      k.judul.toLowerCase().includes(search.toLowerCase()) ||
      (k.deskripsi || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <SkeletonList />;
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Kursus Saya</h1>
        <Link
          href="/guru/buat"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" />
          Kursus Baru
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kursus..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        kursus.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada kursus"
            description="Buat kursus pertama untuk mulai mengatur kelas dan materi."
            action={{ label: "Buat Kursus", href: "/guru/buat" }}
          />
        ) : (
          <div className="text-center py-12 bg-glass rounded-2xl border border-border-precision">
            <BookOpen className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-on-surface-variant mb-4">Tidak ada kursus yang cocok</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((k) => (
            <div
              key={k.id}
              className="bg-glass border border-border-precision rounded-2xl sm:rounded-[32px] p-6 shadow-glass"
            >
              <div className="w-full h-1 bg-primary rounded-full mb-4" />
              <h3 className="font-heading font-semibold text-on-surface mb-1.5">{k.judul}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
                {k.deskripsi || "Tanpa deskripsi"}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={`/guru/kursus/${k.id}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Detail
                </Link>
                <span className="text-on-surface-variant/20">|</span>
                <Link
                  href={`/guru/kursus/${k.id}/nilai`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Nilai
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
