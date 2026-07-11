"use client";

import { Building2, BookOpen, Sparkles, Users, GraduationCap, AlertCircle, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

interface AdminData {
  totalGuru: number;
  totalKursus: number;
  totalSiswa: number;
  aiQuotaUsed: number;
  aiQuotaLimit: number;
  guruList: { id: string; nama: string; email: string; totalKursus: number; totalSiswa: number }[];
}

export default function AdminSekolahIndex() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<"nama" | "totalKursus" | "totalSiswa">("totalKursus");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin-sekolah/dashboard", { credentials: "include" });
      if (!res.ok) throw new Error("Gagal memuat data");
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-8 animate-pulse">
          <div className="h-6 w-32 bg-primary/5 rounded-full" />
          <div className="h-8 w-64 bg-primary/5 rounded mt-3" />
          <div className="h-4 w-96 bg-primary/5 rounded mt-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass animate-pulse">
              <div className="h-4 w-16 bg-primary/5 rounded" />
              <div className="h-8 w-12 bg-primary/5 rounded mt-2" />
            </div>
          ))}
        </div>
        <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass animate-pulse">
          <div className="h-5 w-32 bg-primary/5 rounded mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-primary/5 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-badge text-primary">
            <Building2 className="w-3 h-3" />
            ADMIN SEKOLAH
          </span>
          <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">Kelola sekolah Anda</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 bg-glass rounded-2xl border border-border-precision">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-on-surface-variant text-sm mb-4">{error}</p>
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.guruList.filter(
      (g) => g.nama.toLowerCase().includes(q) || g.email.toLowerCase().includes(q)
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  const stats = data ? [
    { label: "Guru", value: data.totalGuru, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Kursus", value: data.totalKursus, icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
    { label: "Siswa", value: data.totalSiswa, icon: GraduationCap, color: "bg-amber-50 text-amber-600" },
    { label: "Kuota AI", value: `${data.aiQuotaUsed}/${data.aiQuotaLimit}`, icon: Sparkles, color: "bg-purple-50 text-purple-600" },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-badge text-primary">
          <Building2 className="w-3 h-3" />
          ADMIN SEKOLAH
        </span>
        <h1 className="font-heading font-bold text-2xl text-on-surface mt-3">Kelola sekolah Anda</h1>
        <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
          Pantau guru, kursus, dan progres siswa di sekolah Anda dari satu tempat.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-glass border border-border-precision rounded-xl p-5 shadow-glass">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-on-surface-variant">{stat.label}</span>
              </div>
              <p className="font-heading font-bold text-2xl text-on-surface">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {data && data.guruList.length > 0 ? (
        <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="font-heading font-semibold text-on-surface">Daftar Guru</h3>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-precision text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-precision text-left">
                  <th className="pb-3 font-semibold text-on-surface-variant cursor-pointer hover:text-primary select-none" onClick={() => toggleSort("nama")}>
                    Nama {sortKey === "nama" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="pb-3 font-semibold text-on-surface-variant">Email</th>
                  <th className="pb-3 font-semibold text-on-surface-variant text-center cursor-pointer hover:text-primary select-none" onClick={() => toggleSort("totalKursus")}>
                    Kursus {sortKey === "totalKursus" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="pb-3 font-semibold text-on-surface-variant text-center cursor-pointer hover:text-primary select-none" onClick={() => toggleSort("totalSiswa")}>
                    Siswa {sortKey === "totalSiswa" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-on-surface-variant text-sm">
                      Tidak ada guru ditemukan
                    </td>
                  </tr>
                ) : (
                  paginated.map((guru) => (
                    <tr key={guru.id} className="border-b border-border-precision/50 last:border-0">
                      <td className="py-3 font-medium text-on-surface">{guru.nama}</td>
                      <td className="py-3 text-on-surface-variant truncate max-w-[120px] sm:max-w-none">{guru.email}</td>
                      <td className="py-3 text-center text-on-surface-variant">{guru.totalKursus}</td>
                      <td className="py-3 text-center text-on-surface-variant">{guru.totalSiswa}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-precision/50">
              <p className="text-xs text-on-surface-variant">
                {sorted.length} guru · Halaman {page + 1} dari {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                  const p = start + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                        p === page ? "bg-primary text-white" : "hover:bg-surface text-on-surface-variant"
                      )}
                    >
                      {p + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-glass border border-border-precision rounded-xl p-6 shadow-glass text-center">
          <Users className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant text-sm">Belum ada guru terdaftar di sekolah ini.</p>
          <p className="text-on-surface-variant/70 text-xs mt-1">
            Guru akan mendaftar dengan kode sekolah yang diberikan admin.
          </p>
        </div>
      )}
    </div>
  );
}