"use client";

import { motion, AnimatePresence } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api-helpers";
import {
  Sparkles,
  Zap,
  Upload,
  Users,
  BookOpen,
  BarChart3,
  Award,
  ArrowRight,
  QrCode,
  Wallet,
} from "lucide-react";

interface BalanceData {
  userId: string;
  balance: number;
  totalTopup: number;
  totalSpent: number;
  lastTopupAt: Date | null;
  isUnlocked: boolean;
  unlockedAt: Date | null;
  subscription?: {
    isUnlocked: boolean;
    uploadCount: number;
    uploadLimit: number;
    canGenerate: boolean;
    canUpload: boolean;
  };
}

const SPRING_CONFIG = { type: "spring" as const, stiffness: 100, damping: 20 };

const MULAI_FEATURES = [
  { icon: Sparkles, label: "20 generate AI/bulan" },
  { icon: Upload, label: "3 upload dokumen/bulan" },
  { icon: BookOpen, label: "1 kelas" },
  { icon: Users, label: "Unlimited siswa" },
  { icon: Zap, label: "CBT + auto-koreksi" },
] as const;

const LANJUTKAN_FEATURES = [
  { icon: Sparkles, label: "50 generate AI/bulan" },
  { icon: Upload, label: "Unlimited upload dokumen" },
  { icon: BookOpen, label: "5 kelas" },
  { icon: Users, label: "Unlimited siswa" },
  { icon: Zap, label: "CBT + auto-koreksi" },
  { icon: BarChart3, label: "Analytics dashboard" },
  { icon: Award, label: "Sertifikat" },
  { icon: Wallet, label: "WhatsApp support" },
] as const;

export default function GuruLanggananPage() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQris, setShowQris] = useState(false);
  const mountedRef = useRef(true);

  const fetchBalance = useCallback(async () => {
    const res = await apiFetch<BalanceData>("/api/v1/token/balance");
    if (!mountedRef.current) return;
    if (res.ok && res.data) setBalance(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchBalance();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchBalance]);

  const isSubscribed = balance?.isUnlocked ?? false;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-24 bg-primary/5 rounded-lg animate-pulse" />
          <div className="h-8 w-64 bg-primary/5 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-8 h-80 animate-pulse" />
          <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-8 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_CURVE }}
      >
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-1">
          Langganan
        </span>
        <h1 className="font-heading font-bold text-2xl text-on-surface">
          Pilih Paket
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Pilih paket yang sesuai dengan kebutuhan mengajar Anda
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE, delay: 0.1 }}
          className={cn(
            "bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-6 sm:p-8 flex flex-col",
            !isSubscribed && "ring-2 ring-primary/20",
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-tertiary">
                Mulai
              </p>
              <h2 className="font-heading font-bold text-2xl text-on-surface mt-0.5">
                Gratis
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Untuk memulai
              </p>
            </div>
            {!isSubscribed && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
                Paket Saat Ini
              </span>
            )}
          </div>

          <div className="space-y-3 mb-6 flex-1">
            {MULAI_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-on-surface">{label}</span>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all",
              !isSubscribed
                ? "bg-primary/10 text-primary cursor-default"
                : "bg-black/5 text-on-surface-variant/40 cursor-not-allowed",
            )}
          >
            {!isSubscribed ? "Paket Aktif" : "Tidak Tersedia"}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE, delay: 0.2 }}
          className={cn(
            "bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-6 sm:p-8 flex flex-col relative overflow-hidden",
            isSubscribed && "ring-2 ring-primary/20",
          )}
        >
          <div className="absolute top-0 right-0">
            <div className="bg-shimmer text-primary text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-[24px]">
              Paling Populer
            </div>
          </div>

          <div className="flex items-start justify-between mb-4 mt-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-tertiary">
                Lanjutkan
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <h2 className="font-heading font-bold text-2xl text-on-surface">
                  Rp10.000
                </h2>
                <span className="text-xs text-on-surface-variant">/bln</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Untuk guru profesional
              </p>
            </div>
            {isSubscribed && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
                Paket Saat Ini
              </span>
            )}
          </div>

          <div className="space-y-3 mb-6 flex-1">
            {LANJUTKAN_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-on-surface">{label}</span>
              </div>
            ))}
          </div>

          {isSubscribed ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-primary/10 text-primary cursor-default transition-all"
            >
              Paket Aktif
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowQris(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-primary text-white hover:brightness-110 transition-all shadow-glass"
            >
              Upgrade Sekarang
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showQris && !isSubscribed && (
          <motion.div
            key="qris-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ ...SPRING_CONFIG }}
            className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-[32px] p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading font-bold text-xl text-on-surface">
                  Pembayaran via QRIS
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Upgrade ke paket LANJUTKAN — Rp10.000/bulan
                </p>
              </div>
              <QrCode className="w-8 h-8 text-primary" />
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-white border border-border-precision mb-6">
              <img
                src="/qris-gopay.webp"
                alt="QRIS GoPay"
                className="w-full max-w-[280px] mx-auto p-4"
              />
            </div>

            <div className="bg-primary/5 rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-on-surface mb-2">
                Cara Upgrade:
              </p>
              <ol className="text-xs text-on-surface-variant space-y-1.5 list-decimal list-inside">
                <li>
                  Scan QRIS di atas dengan GoPay atau e-wallet untuk transfer
                  Rp10.000
                </li>
                <li>
                  Screenshot atau simpan bukti transfer yang berhasil
                </li>
                <li>
                  Upload bukti transfer di halaman top-up
                </li>
                <li>
                  Paket LANJUTKAN akan diaktifkan dalam 1x24 jam setelah
                  verifikasi admin
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/guru/topup"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-primary text-white hover:brightness-110 transition-all shadow-glass"
              >
                <Upload className="w-4 h-4" />
                Upload Bukti Transfer
              </Link>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowQris(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-black/5 text-on-surface-variant hover:bg-black/10 transition-all"
              >
                Nanti Saja
              </motion.button>
            </div>

            <p className="text-[10px] text-on-surface-variant/60 text-center mt-4">
              Bukti transfer akan dikirim ke admin via Telegram. Paket
              diaktifkan dalam 1x24 jam.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}