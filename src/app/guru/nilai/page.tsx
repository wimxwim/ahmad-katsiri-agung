"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, BookOpen } from "lucide-react";
import { csrfHeaders } from "@/lib/csrf";

interface KursusItem {
  id: string;
  judul: string;
  deskripsi: string | null;
}

export default function NilaiListPage() {
  const [kursus, setKursus] = useState<KursusItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    try {
      const res = await fetch("/api/v1/kursus", { credentials: "include", headers: { ...csrfHeaders() } });
      if (!res.ok) throw new Error("Gagal memuat data");
      const { data } = await res.json();
      setKursus(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = kursus.filter(
    (k) =>
      k.judul.toLowerCase().includes(search.toLowerCase()) ||
      (k.deskripsi || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-6 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-2">{error}</p>
        <button onClick={() => { setError(""); setLoading(true); fetchData(); }} className="text-sm text-primary hover:underline">Coba lagi</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-on-surface mb-6">Daftar Kursus — Nilai</h1>

      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kursus..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-glass rounded-2xl border border-border-precision">
          <BookOpen className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant">
            {search ? "Tidak ada kursus yang cocok" : "Belum ada kursus dengan data nilai"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((k) => (
            <Link
              key={k.id}
              href={`/guru/kursus/${k.id}/nilai`}
              className="bg-glass border border-border-precision rounded-2xl sm:rounded-2xl p-6 shadow-glass hover:shadow-glass-lg transition-all duration-300 flex items-center justify-between"
            >
              <div>
                <h3 className="font-heading font-semibold text-on-surface">{k.judul}</h3>
                <p className="text-sm text-on-surface-variant">{k.deskripsi || "Tanpa deskripsi"}</p>
              </div>
              <span className="text-primary text-sm font-semibold">Lihat Nilai →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
