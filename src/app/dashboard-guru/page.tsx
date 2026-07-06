"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { mockStats, mockKursus } from "@/data/mock";
import { BookOpen, Users, Award, TrendingUp, FileText, ArrowRight } from "lucide-react";

const STAT_CARDS = [
  { label: "Total Kursus", value: mockStats.totalKursus, icon: BookOpen, color: "text-primary" },
  { label: "Total Siswa", value: mockStats.totalSiswa, icon: Users, color: "text-blue-600" },
  { label: "Quiz Selesai", value: mockStats.totalQuizSelesai, icon: Award, color: "text-amber-600" },
  { label: "Rata-rata Skor", value: `${mockStats.rataRataSkor}%`, icon: TrendingUp, color: "text-emerald-600" },
];

export default function DashboardOverview() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Ringkasan</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Selamat datang kembali, Ahmad Katsiri Agung
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: EASE_CURVE }}
            className="bg-white rounded-2xl p-5 border border-border-precision"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-on-surface font-heading">{card.value}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-on-surface">Kursus Terbaru</h2>
        <Link
          href="/dashboard-guru/kursus"
          className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
        >
          Lihat semua <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockKursus.map((k, i) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease: EASE_CURVE }}
          >
            <Link
              href={`/dashboard-guru/kursus/${k.id}`}
              className="block bg-white rounded-2xl border border-border-precision p-5 hover:shadow-glass-lg transition-shadow group"
            >
              <div
                className="w-full h-2 rounded-full mb-4"
                style={{ backgroundColor: k.coverColor }}
              />
              <h3 className="font-heading font-bold text-on-surface group-hover:text-primary transition-colors">
                {k.nama}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                {k.deskripsi}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {k.jumlahSiswa} siswa
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {k.jumlahMateri} materi
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-border-precision flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  {k.status}
                </span>
                <span className="text-xs text-on-surface-variant/60">Kelas {k.kelas}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
