"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface KursusSaya {
  kursusId: string;
  judul: string;
  status: string;
  tanggalDaftar: string;
  nama: string;
}

export default function SiswaKursusPage() {
  const router = useRouter();
  const [kursus, setKursus] = useState<KursusSaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/enroll/status", { credentials: "include" });
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
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
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
      <h1 className="font-heading font-bold text-2xl text-on-surface mb-6">Kursus Saya</h1>

      {kursus.length === 0 ? (
        <div className="text-center py-12 bg-glass rounded-2xl border border-border-precision">
          <BookOpen className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant">Belum terdaftar di kursus manapun</p>
          <Link href="/siswa/materi" className="text-primary text-sm mt-2 inline-block hover:underline">
            Jelajahi materi
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {kursus.map((k) => (
            <div
              key={k.kursusId}
              className="bg-glass rounded-2xl border border-border-precision p-5 hover:bg-white/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-heading font-semibold text-on-surface">{k.judul}</h3>
                  <p className="text-on-surface-variant text-xs mt-2">
                    Terdaftar: {new Date(k.tanggalDaftar).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`shrink-0 px-2 py-1 text-xs rounded-full font-medium ${
                  k.status === "AKTIF" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {k.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
