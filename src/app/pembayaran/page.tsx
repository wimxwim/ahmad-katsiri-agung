"use client";

import { useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { QrCode, Upload, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PembayaranPage() {
  const session = useSession();
  const [amount, setAmount] = useState("100000");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Silakan upload bukti pembayaran");
      return;
    }
    setError("");
    setUploading(true);

    try {
      // Upload bukti ke ImageKit via API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("amount", amount);
      formData.append("notes", notes);

      const res = await fetch("/api/v1/payment/qris", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Upload gagal");
      }

      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">Silakan masuk untuk melakukan pembayaran.</p>
          <Link href="/masuk?redirect=/pembayaran" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-semibold text-sm">
            Masuk <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_CURVE }}
        >
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl sm:text-4xl text-on-surface font-bold tracking-tight mb-3">
              Pembayaran
            </h1>
            <p className="text-on-surface-variant max-w-md mx-auto">
              Dukung platform ini melalui donasi. Pembayaran diverifikasi manual oleh tim kami dalam 1×24 jam.
            </p>
          </div>

          {success ? (
            <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-[32px] p-8 sm:p-12 shadow-glass text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-on-surface mb-2">
                Bukti Terkirim!
              </h2>
              <p className="text-on-surface-variant mb-6">
                Tim kami akan memverifikasi pembayaran Anda dalam 1×24 jam.
                Status dapat dipantau di halaman profil.
              </p>
              <Link
                href="/profil"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-110 transition-all"
              >
                Lihat Status <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-glass backdrop-blur-2xl border border-border-precision rounded-[32px] p-6 sm:p-10 shadow-glass">
              {/* QRIS GoPay */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-48 h-48 bg-white rounded-2xl border border-border-precision p-4 mb-4">
                  <QrCode className="w-32 h-32 text-primary" />
                </div>
                <p className="text-sm text-on-surface-variant">
                  Scan QRIS via GoPay / ShopeePay / DANA / Mobile Banking
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Jumlah Transfer (Rp)
                  </label>
                  <select
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-border-precision text-on-surface text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="50000">Rp50.000 — Sponsor Ringan</option>
                    <option value="100000">Rp100.000 — Sponsor Reguler</option>
                    <option value="250000">Rp250.000 — Sponsor Premium</option>
                    <option value="500000">Rp500.000 — Sponsor Platinum</option>
                    <option value="1000000">Rp1.000.000 — Sponsor Diamond</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Upload Bukti Transfer
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] || null);
                        setError("");
                      }}
                      className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:brightness-110 file:cursor-pointer"
                    />
                  </div>
                  {file && (
                    <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                      <Upload className="w-3 h-3" /> {file.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Catatan (opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nama sekolah / institusi"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-border-precision text-on-surface text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Bukti Pembayaran <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
