"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { mockKursus, mockNilai } from "@/data/mock";
import { Search } from "lucide-react";
import { useState } from "react";

export default function NilaiListPage() {
  const [search, setSearch] = useState("");

  const filtered = mockKursus.filter(
    (k) =>
      k.nama.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Nilai</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Gradebook semua kursus
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-on-surface-variant/40" />
        <input
          type="text"
          placeholder="Cari kursus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10.5 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((k, i) => {
          const nilaiKursus = mockNilai.filter((n) => n.kursusId === k.id);
          const enrolledIds = [...new Set(nilaiKursus.map((n) => n.siswaId))];
          const avg = nilaiKursus.length > 0
            ? Math.round(nilaiKursus.reduce((a, b) => a + b.skor, 0) / nilaiKursus.length)
            : 0;

          return (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: EASE_CURVE }}
            >
              <Link
                href={`/dashboard-guru/kursus/${k.id}/nilai`}
                className="block bg-white rounded-2xl border border-border-precision p-5 hover:shadow-glass-lg transition-shadow"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-heading font-bold text-on-surface hover:text-primary transition-colors">
                      {k.nama}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Kelas {k.kelas} · {enrolledIds.length} siswa · {nilaiKursus.length} quiz selesai
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-on-surface-variant">Rata-rata</p>
                      <p className={`font-bold font-heading ${avg >= 70 ? "text-emerald-600" : "text-red-600"}`}>
                        {avg}%
                      </p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30" />
                    <div className="text-right">
                      <p className="text-xs text-on-surface-variant">Siswa</p>
                      <p className="font-bold text-on-surface">{enrolledIds.length}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
