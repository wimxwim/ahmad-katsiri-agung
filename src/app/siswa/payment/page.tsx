"use client";

import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function PaymentPage() {
  return (
    <div>
      <h1 className="font-heading font-bold text-2xl text-on-surface mb-2">Pembayaran</h1>
      <p className="text-on-surface-variant text-sm mb-8">Kelola pembayaran kursus berbayar</p>

      <div className="flex flex-col items-center justify-center py-16 bg-glass rounded-[32px] border border-border-precision shadow-glass">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-heading font-bold text-lg text-on-surface mb-2">Segera Hadir</h2>
        <p className="text-on-surface-variant text-sm text-center max-w-sm mb-6">
          Pembayaran kursus berbayar akan tersedia di sini. Saat ini semua kursus masih gratis.
        </p>
        <Link
          href="/siswa"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
