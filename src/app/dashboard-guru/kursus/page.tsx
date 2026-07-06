"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { mockKursus } from "@/data/mock";
import { Users, FileText, Search, Plus, Eye } from "lucide-react";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  AKTIF: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-gray-50 text-gray-600",
  ARSIP: "bg-amber-50 text-amber-700",
};

export default function KursusListPage() {
  const [search, setSearch] = useState("");

  const filtered = mockKursus.filter(
    (k) =>
      k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.deskripsi.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-on-surface">Kursus Saya</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Kelola semua kursus yang Anda ajar
          </p>
        </div>
        <Link
          href="/dashboard-guru/buat"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors font-heading"
        >
          <Plus className="w-4 h-4" />
          Kursus Baru
        </Link>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((k, i) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: EASE_CURVE }}
            className="bg-white rounded-2xl border border-border-precision overflow-hidden hover:shadow-glass-lg transition-shadow group"
          >
            <div className="h-2" style={{ backgroundColor: k.coverColor }} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-heading font-bold text-on-surface group-hover:text-primary transition-colors">
                  {k.nama}
                </h3>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[k.status] || ""}`}>
                  {k.status}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-2 mb-4">
                {k.deskripsi}
              </p>
              <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {k.jumlahSiswa} siswa
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {k.jumlahMateri} materi
                </span>
                <span className="ml-auto">Kls {k.kelas}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard-guru/kursus/${k.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-surface text-on-surface hover:bg-border-precision/20 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Detail
                </Link>
                <Link
                  href={`/dashboard-guru/kursus/${k.id}/nilai`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                >
                  Nilai
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-on-surface-variant">Tidak ada kursus ditemukan</p>
        </div>
      )}
    </div>
  );
}
