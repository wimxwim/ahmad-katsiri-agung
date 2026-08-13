"use client";

import { Heart, Users, BookOpen, Zap, Upload, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api-helpers";
import { cn } from "@/lib/utils";

interface StatsData {
  siswa: number;
  guru: number;
  materi: number;
}

const SPRING = { type: "spring" as const, stiffness: 100, damping: 20 };

export default function SupportPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [supported, setSupported] = useState(false);
  const [supporting, setSupporting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    apiFetch<StatsData>("/api/v1/support/stats").then((res) => {
      if (mountedRef.current && res.ok && res.data) setStats(res.data);
    });
    return () => { mountedRef.current = false; };
  }, []);

  const handleSupport = async () => {
    setSupporting(true);
    setError("");
    const result = await apiFetch("/api/v1/donation", { method: "POST" });
    if (!mountedRef.current) return;
    if (!result.ok) { setError(result.error); setSupporting(false); return; }
    setSupported(true);
    setSupporting(false);
  };

  const handleUpload = async (file: File) => {
    setSupporting(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const result = await apiFetch("/api/v1/donation/upload", { method: "POST", body: fd });
    if (!mountedRef.current) return;
    if (!result.ok) { setError(result.error); setSupporting(false); return; }
    setSupported(true);
    setSupporting(false);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-3 sm:px-5 lg:px-8 py-10 sm:py-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE }}
          className="text-center space-y-3"
        >
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-primary mb-1">
            Support
          </span>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-on-surface tracking-tight">
            Dukung AKAL Center
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Bantu kami terus berinovasi untuk pendidikan Indonesia.
            Platform ini dibuat oleh guru, untuk guru.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: Users, label: "Siswa", value: stats?.siswa, suffix: "+" },
            { icon: BookOpen, label: "Guru", value: stats?.guru, suffix: "+" },
            { icon: Zap, label: "Materi AI", value: stats?.materi, suffix: "+" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-glass border border-border-precision rounded-card p-4 text-center shadow-glass"
            >
              <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="font-heading text-xl sm:text-2xl font-bold text-on-surface tabular-nums">
                {item.value !== undefined ? item.value.toLocaleString("id-ID") : "..."}
                {item.suffix}
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                {item.label}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: 0.15 }}
          className="bg-glass border border-border-precision rounded-card p-6 sm:p-8 shadow-glass-lg text-center space-y-5"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading font-bold text-xl text-on-surface">
              Support Platform Ini
            </h2>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Scan QRIS di bawah, transfer nominal berapa pun, lalu upload bukti.
              Tidak ada jumlah minimal — setiap dukungan berarti.
            </p>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-border-precision max-w-xs mx-auto">
            <Image
              src="/qris-gopay.png"
              alt="QRIS GoPay"
              width={320}
              height={320}
              sizes="(max-width:640px) 100vw, 50vw"
              loading="lazy"
              className="w-full h-auto rounded-xl"
            />
            <p className="text-[10px] text-on-surface-variant/60 mt-2">
              Scan dengan GoPay atau e-wallet lainnya
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!supported ? (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-2.5 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSupport}
                    disabled={supporting}
                    className={cn(
                      "flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all",
                      supporting
                        ? "bg-primary/20 text-primary cursor-wait"
                        : "bg-primary text-white hover:brightness-110 shadow-glass",
                    )}
                  >
                    {supporting ? "Memproses..." : "Support"}
                  </motion.button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); if (fileRef.current) fileRef.current.value = ""; }}
                    className="hidden"
                  />

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileRef.current?.click()}
                    disabled={supporting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-glass border border-border-precision text-on-surface hover:shadow-glass-lg transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Bukti
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={SPRING}
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
                  onClick={() => { setSupported(false); setError(""); }}
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
          transition={{ ...SPRING, delay: 0.2 }}
          className="text-center"
        >
          <p className="text-xs text-on-surface-variant/50">
            Platform ini dibuat oleh guru, untuk guru. Dukung kami.
          </p>
        </motion.div>
      </div>
    </div>
  );
}