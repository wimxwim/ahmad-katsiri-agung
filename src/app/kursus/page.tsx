"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { mockKursus } from "@/data/mock";
import { Search, BookOpen, Users, FileText, ArrowRight } from "lucide-react";
import { useState } from "react";

const KELAS_FILTER = ["Semua", "7", "8", "9"];

export default function KatalogKursusPage() {
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua");

  const filtered = mockKursus.filter((k) => {
    const matchSearch =
      k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.deskripsi.toLowerCase().includes(search.toLowerCase());
    const matchKelas = kelasFilter === "Semua" || k.kelas === kelasFilter;
    return matchSearch && matchKelas;
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

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-on-surface-variant/40" />
            <input
              type="text"
              placeholder="Cari kursus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10.5 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-hidden focus:border-primary/40"
            />
          </div>
          <div className="flex gap-2">
            {KELAS_FILTER.map((k) => (
              <button
                key={k}
                onClick={() => setKelasFilter(k)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  kelasFilter === k
                    ? "bg-primary text-white"
                    : "bg-white border border-border-precision text-on-surface-variant hover:bg-surface"
                }`}
              >
                {k === "Semua" ? "Semua" : `Kls ${k}`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: EASE_CURVE }}
            >
              <Link
                href={`/kursus/${k.id}`}
                className="block bg-white rounded-2xl border border-border-precision p-6 hover:shadow-glass-lg transition-all group h-full"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${k.coverColor}15` }}>
                  <BookOpen className="w-6 h-6" style={{ color: k.coverColor }} />
                </div>
                <h3 className="font-heading font-bold text-on-surface group-hover:text-primary transition-colors mb-2">
                  {k.nama}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                  {k.deskripsi}
                </p>
                <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {k.jumlahSiswa} siswa
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {k.jumlahMateri} materi
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border-precision">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                    Kelas {k.kelas}
                  </span>
                  <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Lihat <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-3" />
            <p className="text-on-surface-variant">Tidak ada kursus ditemukan</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
