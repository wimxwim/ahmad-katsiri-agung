"use client";

import { useEffect, useState, use } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { BalasForm } from "@/components/diskusi/BalasForm";
import { EASE_CURVE } from "@/lib/constants";

type DiskusiDetail = {
  id: string;
  nama: string;
  kategori: string;
  judul: string;
  isi: string;
  waktu: string;
  slug: string;
};
type BalasanItem = {
  id: string;
  nama: string;
  isi: string;
  waktu: string;
};

const LABEL_KATEGORI: Record<string, string> = {
  "tanya-jawab": "❓ Tanya Jawab",
  "berbagi-pengalaman": "📖 Berbagi Pengalaman",
  "studi-kasus": "🔍 Studi Kasus",
};

export default function DiskusiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [diskusi, setDiskusi] = useState<DiskusiDetail | null>(null);
  const [balasan, setBalasan] = useState<BalasanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/diskusi/${slug}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setDiskusi(json.diskusi);
        setBalasan(json.balasan ?? []);
      } catch { setError("Gagal memuat diskusi"); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-5 pt-20 pb-24">
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        </div>
      </div>
    );
  }

  if (error || !diskusi) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-5 pt-20 pb-24">
        <Link href="/diskusi" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Kembali
        </Link>
        <p className="text-center text-on-surface-variant py-12">{error || "Diskusi tidak ditemukan"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-5 lg:px-8 pt-20 sm:pt-24 pb-24 sm:pb-32">
      <Link href="/diskusi" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-6 sm:mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Kembali ke Diskusi
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_CURVE }}
        className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl sm:rounded-[32px] p-6 sm:p-8 mb-8"
      >
        <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium mb-3">
          {LABEL_KATEGORI[diskusi.kategori] || diskusi.kategori}
        </span>
        <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface leading-tight mb-3">
          {diskusi.judul}
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed whitespace-pre-wrap mb-4">
          {diskusi.isi}
        </p>
        <div className="flex items-center justify-between text-xs text-on-surface-variant border-t border-border-precision pt-4">
          <span>👤 {diskusi.nama}</span>
          <span>{diskusi.waktu}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-8"
      >
        <BalasForm slug={slug} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <h3 className="font-heading text-lg font-semibold text-on-surface flex items-center gap-2 mb-5">
          <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
          Balasan ({balasan.length})
        </h3>

        {balasan.length === 0 && (
          <p className="text-on-surface-variant text-sm text-center py-8">
            Belum ada balasan. Jadilah yang pertama!
          </p>
        )}

        <div className="space-y-4">
          {balasan.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-glass backdrop-blur-2xl border border-border-precision rounded-2xl p-5"
            >
              <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap mb-3">
                {b.isi}
              </p>
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>👤 {b.nama}</span>
                <span>{b.waktu}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
