"use client";

import {
  User,
  Heart,
  Wallet,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Coins,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { useEffect, useState, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api-helpers";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BalanceData {
  userId: string;
  balance: number;
  totalTopup: number;
  totalSpent: number;
  lastTopupAt: Date | null;
}

interface SessionData {
  userId: string;
  nama: string;
  email: string;
  role: string;
}

const SPRING_CONFIG = { type: "spring" as const, stiffness: 100, damping: 20 };

export default function GuruProfilPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [donating, setDonating] = useState(false);
  const [donated, setDonated] = useState(false);
  const [donateError, setDonateError] = useState("");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    const [balRes, sesRes] = await Promise.all([
      apiFetch<BalanceData>("/api/v1/token/balance"),
      apiFetch<SessionData>("/api/sesi"),
    ]);
    if (!mountedRef.current) return;
    if (balRes.ok && balRes.data) setBalance(balRes.data);
    if (sesRes.ok && sesRes.data) setSession(sesRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  const handleDonate = async () => {
    setDonating(true);
    setDonateError("");

    const result = await apiFetch("/api/v1/donation", { method: "POST" });

    if (!mountedRef.current) return;

    if (!result.ok) {
      setDonateError(result.error);
      setDonating(false);
      return;
    }

    setDonated(true);
    setDonating(false);
  };

  const handleDonateWithProof = async (file: File) => {
    setDonating(true);
    setDonateError("");

    const fd = new FormData();
    fd.append("file", file);

    const result = await apiFetch("/api/v1/donation/upload", { method: "POST", body: fd });

    if (!mountedRef.current) return;

    if (!result.ok) {
      setDonateError(result.error);
      setDonating(false);
      return;
    }

    setDonated(true);
    setDonating(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleDonateWithProof(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="h-7 w-48 bg-primary/5 rounded-lg animate-pulse" />
        <div className="bg-glass rounded-card p-8 h-48 animate-pulse border border-border-precision" />
        <div className="bg-glass rounded-card p-8 h-48 animate-pulse border border-border-precision" />
      </div>
    );
  }

  if (!loading && !balance && !session) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE }}
        >
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-1">
            Profil
          </span>
          <h1 className="font-heading font-bold text-2xl text-on-surface">Profil Guru</h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-glass border border-red-200 rounded-card p-8 text-center shadow-glass"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 grid place-items-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <p className="text-red-600 font-semibold mb-2">Gagal memuat profil</p>
          <p className="text-sm text-on-surface-variant mb-4">Terjadi kesalahan saat mengambil data. Silakan coba lagi.</p>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
          >
            Coba lagi
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_CURVE }}
      >
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-1">
          Profil
        </span>
        <h1 className="font-heading font-bold text-2xl text-on-surface">Profil Guru</h1>
      </motion.div>

      {session && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.1 }}
          className="bg-glass border border-border-precision rounded-card p-6 shadow-glass"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <User className="w-7 h-7" />
            </span>
            <div>
              <p className="font-heading font-bold text-lg text-on-surface">{session.nama}</p>
              <p className="text-sm text-on-surface-variant">{session.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                {session.role}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {balance && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.15 }}
          className="bg-glass border border-border-precision rounded-card p-6 shadow-glass"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg text-on-surface flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Saldo Token
            </h2>
            <Link
              href="/guru/topup"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Top-Up
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-2xl bg-primary/5">
              <p className="font-heading text-2xl font-bold text-primary tabular-nums">
                Rp{balance.balance.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Saldo</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/40">
              <p className="font-heading text-lg font-bold text-on-surface tabular-nums">
                Rp{balance.totalTopup.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Top-Up</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-white/40">
              <p className="font-heading text-lg font-bold text-on-surface tabular-nums">
                Rp{balance.totalSpent.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Dipakai</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.2 }}
        className="bg-glass border border-border-precision rounded-card p-6 shadow-glass"
      >
        <h2 className="font-heading font-semibold text-lg text-on-surface flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-red-500" />
          Dukung AKAL Center
        </h2>

        <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
          Platform ini dibuat oleh guru, untuk guru. Dukungan Anda — sekecil apa pun —
          membantu kami terus berinovasi dan menjaga AKAL Center tetap berjalan
          untuk pendidikan Indonesia.
        </p>

        <AnimatePresence mode="wait">
          {!donated ? (
            <motion.div
              key="donate-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {donateError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-2.5 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {donateError}
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleDonate}
                  disabled={donating}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all",
                    donating
                      ? "bg-primary/20 text-primary cursor-wait"
                      : "bg-primary text-white hover:brightness-110 shadow-glass",
                  )}
                >
                  {donating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Coins className="w-4 h-4" />
                      </motion.div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Support
                    </>
                  )}
                </motion.button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={donating}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-glass border border-border-precision text-on-surface hover:shadow-glass-lg transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Support + Upload Bukti
                </motion.button>
              </div>

              <p className="text-[10px] text-on-surface-variant/60 text-center">
                Upload bukti bersifat opsional. Support tidak mengubah saldo token.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="donated"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...SPRING_CONFIG }}
              className="text-center py-6"
            >
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <p className="font-heading font-bold text-lg text-on-surface mb-2">
                Terima Kasih!
              </p>
              <p className="text-sm text-on-surface-variant mb-4">
                Dukungan Anda membantu kami terus berinovasi untuk pendidikan Indonesia.
              </p>
              <button
                onClick={() => {
                  setDonated(false);
                  setDonateError("");
                }}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
              >
                <Heart className="w-4 h-4" />
                Support Lagi
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.25 }}
        className="bg-glass border border-border-precision rounded-card shadow-glass overflow-hidden"
      >
        <button
          onClick={async () => {
            try {
              await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
            } catch {
              // proceed with redirect regardless
            }
            router.push("/masuk");
          }}
          className="flex items-center justify-between p-4 hover:bg-red-50/50 transition-colors w-full text-left"
        >
          <span className="flex items-center gap-3 text-sm font-semibold text-red-600">
            <LogOut className="w-4 h-4" />
            Keluar
          </span>
          <ChevronRight className="w-4 h-4 text-red-400" />
        </button>
      </motion.div>
    </div>
  );
}