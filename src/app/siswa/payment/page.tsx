"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Coins,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  History,
  Wallet,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

interface TokenInfo {
  balance: number;
  totalUsed: number;
  totalPurchased: number;
  lastTransaction: string | null;
}

export default function SiswaPaymentPage() {
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/siswa/payment/balance", {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 404) {
          setToken({ balance: 0, totalUsed: 0, totalPurchased: 0, lastTransaction: null });
          setLoading(false);
          return;
        }
        throw new Error("Gagal memuat data");
      }
      const { data } = await res.json();
      setToken(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div>
        <SkeletonList />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_CURVE }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="font-heading font-bold text-xl text-on-surface mb-2">
          Gagal Memuat
        </h2>
        <p className="text-sm text-on-surface-variant mb-6 text-center max-w-sm">
          {error}
        </p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </motion.div>
    );
  }

  const balance = token?.balance ?? 0;

  return (
    <div>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE }}
        className="flex items-center gap-3 mb-5"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tertiary to-tertiary/70 flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg text-on-surface">
            Token & Pembayaran
          </h1>
          <p className="text-xs text-on-surface-variant">
            Kelola token dan riwayat transaksi
          </p>
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.03 }}
        className="bg-gradient-to-br from-primary to-[#003d24] text-white rounded-2xl p-5 sm:p-6 shadow-glass-lg mb-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-[#eec055]" />
          <span className="text-xs font-bold tracking-wider text-white/60 uppercase">
            Saldo Token
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-heading text-4xl sm:text-5xl font-bold tabular-nums">
            {balance.toLocaleString("id-ID")}
          </span>
          <span className="text-white/70 text-sm font-medium">token</span>
        </div>
        <p className="text-white/60 text-sm">
          Digunakan untuk generate AI dan fitur premium
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Link
            href="https://wa.me/6285158795502?text=Halo%2C%20saya%20mau%20isi%20token%20AKAL%20Center"
            className="inline-flex items-center gap-2 bg-[#eec055] text-[#003d24] px-5 py-2.5 rounded-full text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Isi Token
          </Link>
          <p className="text-xs text-white/50">
            Mulai dari Rp 10.000
          </p>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.06 }}
        className="grid grid-cols-3 gap-2.5 mb-5"
      >
        {[
          { label: "Total Dibeli", value: token?.totalPurchased ?? 0, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Total Digunakan", value: token?.totalUsed ?? 0, color: "text-tertiary", bg: "bg-tertiary/10" },
          { label: "Tersisa", value: balance, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-glass border border-border-precision rounded-2xl p-3 shadow-glass"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              {stat.label}
            </p>
            <p className={cn("font-heading font-bold text-lg tabular-nums leading-none", stat.color)}>
              {stat.value.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.09 }}
        className="bg-glass border border-border-precision rounded-2xl p-5 shadow-glass"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-on-surface-variant" />
            <h2 className="font-heading font-semibold text-sm text-on-surface">
              Riwayat Transaksi
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant/60">
            Hubungi admin untuk top-up
          </span>
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-3">
            <History className="w-6 h-6 text-primary/30" />
          </div>
          <p className="text-sm text-on-surface-variant mb-1">
            Belum ada transaksi
          </p>
          <p className="text-xs text-on-surface-variant/60">
            Riwayat pembelian token akan muncul di sini
          </p>
        </div>
      </motion.div>

      {/* Help */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_CURVE, delay: 0.12 }}
        className="mt-5"
      >
        <Link
          href="https://wa.me/6285158795502"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-glass border border-border-precision rounded-2xl p-4 hover:bg-white/80 hover:border-primary/25 active:scale-[0.99] transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ExternalLink className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-on-surface">
              Butuh bantuan?
            </p>
            <p className="text-xs text-on-surface-variant">
              Hubungi kami via WhatsApp
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-on-surface-variant/30 shrink-0" />
        </Link>
      </motion.div>
    </div>
  );
}