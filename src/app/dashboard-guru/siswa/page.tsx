"use client";

import { useState } from "react";
import { mockSiswa } from "@/data/mock";
import { Search, Users } from "lucide-react";

export default function SiswaListPage() {
  const [search, setSearch] = useState("");
  const filtered = mockSiswa.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase()) || s.kelas.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Siswa</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Daftar siswa yang terdaftar di kursus Anda
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-on-surface-variant/40" />
        <input
          type="text"
          placeholder="Cari siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10.5 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40"
        />
      </div>

      <div className="bg-white rounded-2xl border border-border-precision overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-precision bg-surface/50">
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">No</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">Kelas</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">No Absen</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant">NIS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-b border-border-precision/50 last:border-0 hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-on-surface-variant">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{s.nama}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{s.kelas}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{s.noAbsen}</td>
                  <td className="px-4 py-3 text-on-surface-variant font-mono text-xs">{s.nis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-3" />
          <p className="text-on-surface-variant">Tidak ada siswa ditemukan</p>
        </div>
      )}
    </div>
  );
}
