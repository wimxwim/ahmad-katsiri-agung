"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Users, Filter } from "lucide-react";

interface SiswaItem {
  siswaId: string;
  nama: string;
  kursus: string[];
  status: string;
}

interface KursusOption {
  id: string;
  judul: string;
}

export default function SiswaListPage() {
  const router = useRouter();
  const [siswa, setSiswa] = useState<SiswaItem[]>([]);
  const [kursusOptions, setKursusOptions] = useState<KursusOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterKursus, setFilterKursus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData(kursusId?: string) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (kursusId) params.set("kursusId", kursusId);
      const url = `/api/v1/guru/siswa${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setSiswa(json.data || []);
      if (json.kursusOptions) setKursusOptions(json.kursusOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData(filterKursus);
  }, [filterKursus]);

  const filtered = siswa.filter((s) => {
    const q = search.toLowerCase();
    return s.nama.toLowerCase().includes(q) || s.kursus.some((k) => k.toLowerCase().includes(q));
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-glass rounded-2xl p-4 h-12 animate-pulse" />
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
      <h1 className="font-heading font-bold text-2xl text-on-surface mb-6">Siswa</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau kursus..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <select
            value={filterKursus}
            onChange={(e) => setFilterKursus(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="">Semua Kursus</option>
            {kursusOptions.map((k) => (
              <option key={k.id} value={k.id}>{k.judul}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-glass rounded-2xl border border-border-precision">
          <Users className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant">
            {search ? "Tidak ada siswa yang cocok" : "Belum ada siswa terdaftar"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-precision overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-precision bg-surface/50">
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">No</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Kursus</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.siswaId} className="border-b border-border-precision/50 last:border-0 hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-on-surface-variant">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">
                    <Link href={`/guru/siswa/${s.siswaId}`} className="hover:text-primary hover:underline transition-colors">
                      {s.nama}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    <div className="flex flex-wrap gap-1">
                      {s.kursus.map((k, j) => (
                        <span key={j} className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/5 text-primary">
                          {k}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                      s.status === "AKTIF" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
