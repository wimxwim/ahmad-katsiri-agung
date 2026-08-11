"use client";

import {
  Wallet,
  Upload,
  CheckCircle,
  AlertCircle,
  Coins,
  ArrowRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { useEffect, useState, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api-helpers";
import { cn } from "@/lib/utils";
import { TOPUP_PLANS, MIN_TOPUP, MAX_TOPUP } from "@/lib/token-constants";

interface PlansData {
  plans: typeof TOPUP_PLANS;
  minCustom: number;
  maxCustom: number;
  qrisImageUrl: string;
}

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

export default function GuruTopupPage() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [plans, setPlans] = useState<PlansData | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showQris, setShowQris] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    const [balRes, plansRes] = await Promise.all([
      apiFetch<BalanceData>("/api/v1/token/balance"),
      apiFetch<PlansData>("/api/v1/token/plans"),
    ]);
    if (!mountedRef.current) return;
    if (balRes.ok && balRes.data) setBalance(balRes.data);
    if (plansRes.ok && plansRes.data) setPlans(plansRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    setError("");
  };

  const handleCustomAmount = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setCustomAmount(cleaned);
    setSelectedAmount(null);
    setError("");
  };

  const formatCustomDisplay = (raw: string): string => {
    if (!raw) return "";
    return parseInt(raw, 10).toLocaleString("id-ID");
  };

  const effectiveAmount = selectedAmount ?? (customAmount ? parseInt(customAmount, 10) : null);

  const handleShowQris = () => {
    if (!effectiveAmount || effectiveAmount < MIN_TOPUP || effectiveAmount > MAX_TOPUP) {
      setError(`Nominal harus antara Rp${MIN_TOPUP.toLocaleString("id-ID")} - Rp${MAX_TOPUP.toLocaleString("id-ID")}`);
      return;
    }
    setError("");
    setShowQris(true);
    setUploaded(false);
    setSuccessMsg("");
    setNewBalance(null);
  };

  const handleUpload = async (file: File) => {
    if (!effectiveAmount) return;
    setUploading(true);
    setError("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("amount", String(effectiveAmount));

    const result = await apiFetch<{ balance: number; transactionId: string; proofUrl: string; isUnlocked: boolean }>(
      "/api/v1/token/topup/upload",
      { method: "POST", body: fd },
    );

    if (!mountedRef.current) return;

    if (!result.ok) {
      setError(result.error);
      setUploading(false);
      return;
    }

    setUploaded(true);
    setUploading(false);
    setNewBalance(result.data?.balance ?? null);
    setSuccessMsg(`Isi kuota berhasil. Kuota Anda sudah bertambah Rp${effectiveAmount.toLocaleString("id-ID")}. Akses Generate AI sudah aktif.`);

    if (balance && result.data?.balance) {
      setBalance({
        ...balance,
        balance: result.data.balance,
        isUnlocked: result.data.isUnlocked ?? balance.isUnlocked,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 bg-primary/5 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-glass rounded-card p-8 h-64 animate-pulse border border-border-precision" />
          <div className="bg-glass rounded-card p-8 h-64 animate-pulse border border-border-precision" />
        </div>
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
          Kuota
        </span>
        <h1 className="font-heading font-bold text-2xl text-on-surface">Isi Kuota</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Isi kuota untuk generate materi AI. Biaya bervariasi sesuai panjang dokumen.
        </p>
      </motion.div>

      {balance && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.1 }}
          className="bg-glass border border-border-precision rounded-card p-6 shadow-glass"
        >
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </span>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Kuota Saat Ini</p>
              <p className="font-heading text-3xl font-bold text-on-surface tabular-nums">
                Rp{newBalance !== null ? newBalance : balance.balance.toLocaleString("id-ID")}
              </p>
              {balance.totalSpent > 0 && (
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Total dipakai: Rp{balance.totalSpent.toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {balance && !balance.isUnlocked && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.12 }}
          className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4"
        >
          <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Generate AI masih terkunci
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Isi kuota minimal Rp{MIN_TOPUP.toLocaleString("id-ID")} untuk membuka akses generate AI unlimited. 
            {balance.subscription && (
              <> Upload: {balance.subscription.uploadCount}/{balance.subscription.uploadLimit === Infinity ? '∞' : balance.subscription.uploadLimit}.</>
            )}
          </p>
        </motion.div>
      )}

      {balance && balance.isUnlocked && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.12 }}
          className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4"
        >
          <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Generate AI sudah aktif — unlimited!
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            Upload dan generate tanpa batas. Terima kasih sudah isi kuota!
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!showQris ? (
          <motion.div
            key="select-amount"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ ...SPRING_CONFIG }}
            className="bg-glass border border-border-precision rounded-card p-6 shadow-glass"
          >
            <h2 className="font-heading font-semibold text-lg text-on-surface mb-4">Pilih Nominal</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {TOPUP_PLANS.map((plan, i) => (
                <motion.button
                  key={plan.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING_CONFIG, delay: 0.1 + i * 0.05 }}
                  onClick={() => handleSelectAmount(plan.amount)}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-center transition-all duration-300",
                    selectedAmount === plan.amount
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border-precision bg-white/40 text-on-surface hover:border-primary/30",
                  )}
                >
                  <p className="font-heading font-bold text-lg">{plan.label}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    ≈{Math.round(plan.amount / 100)} generate (estimasi)
                  </p>
                </motion.button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider mb-1.5 block">
                Atau nominal custom
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatCustomDisplay(customAmount)}
                  onChange={(e) => handleCustomAmount(e.target.value)}
                  placeholder={`Min Rp${MIN_TOPUP.toLocaleString("id-ID")}`}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border-precision bg-white/60 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm font-mono"
                />
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1">
                Rp{MIN_TOPUP.toLocaleString("id-ID")} – Rp{MAX_TOPUP.toLocaleString("id-ID")}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-2.5 mb-4 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleShowQris}
              disabled={!effectiveAmount}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-all",
                effectiveAmount
                  ? "bg-primary text-white hover:brightness-110 shadow-glass"
                  : "bg-black/5 text-on-surface-variant/40 cursor-not-allowed",
              )}
            >
              Lanjutkan
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="qris-upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ ...SPRING_CONFIG }}
            className="bg-glass border border-border-precision rounded-card p-6 shadow-glass"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-lg text-on-surface">
                {uploaded ? "Pembayaran Selesai" : "Scan QRIS GoPay"}
              </h2>
              {!uploaded && (
                <button
                  onClick={() => setShowQris(false)}
                  className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {uploaded ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING_CONFIG }}
                className="text-center py-6"
              >
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="font-heading font-bold text-xl text-on-surface mb-2">Terima Kasih!</p>
                <p className="text-sm text-on-surface-variant mb-4">{successMsg}</p>
                {newBalance !== null && (
                  <p className="font-heading text-2xl font-bold text-primary">
                    Rp{newBalance.toLocaleString("id-ID")}
                  </p>
                )}
                <button
                  onClick={() => {
                    setShowQris(false);
                    setUploaded(false);
                    setSelectedAmount(null);
                    setCustomAmount("");
                    setNewBalance(null);
                  }}
                  className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
                >
                  <Coins className="w-4 h-4" />
                  Isi Kuota Lagi
                </button>
              </motion.div>
            ) : (
              <>
                <div className="relative rounded-2xl overflow-hidden bg-white border border-border-precision mb-4">
                  <img
                    src={plans?.qrisImageUrl ?? "/qris-gopay.png"}
                    alt="QRIS GoPay"
                    className="w-full max-w-[280px] mx-auto p-4"
                  />
                </div>

                <div className="bg-primary/5 rounded-2xl p-4 mb-4">
                  <p className="text-sm font-semibold text-on-surface mb-2">
                    Nominal: Rp{effectiveAmount?.toLocaleString("id-ID") ?? "0"}
                  </p>
                  <ol className="text-xs text-on-surface-variant space-y-1.5 list-decimal list-inside">
                    <li>Scan QRIS di atas menggunakan GoPay/e-wallet kamu</li>
                    <li>Pastikan nominal sesuai sebelum transfer</li>
                    <li>Setelah transfer berhasil, upload bukti pembayaran di bawah</li>
                    <li>Kuota akan otomatis bertambah setelah bukti terupload</li>
                  </ol>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-2.5 mb-4 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

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
                  disabled={uploading}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold transition-all border-2 border-dashed",
                    uploading
                      ? "border-primary/20 bg-primary/5 text-primary animate-pulse"
                      : "border-border-precision bg-white/40 text-on-surface hover:border-primary hover:bg-primary/[0.02]",
                  )}
                >
                  {uploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Coins className="w-5 h-5" />
                      </motion.div>
                      Mengupload & menambah kuota...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Saya sudah membayar — Upload Bukti
                    </>
                  )}
                </motion.button>

                <p className="text-[10px] text-on-surface-variant/60 text-center mt-3">
                  JPG, PNG, WebP, PDF, maks 5 MB. Setelah bukti berhasil disimpan, kuota akan langsung bertambah. Data isi kuota dan link bukti akan dikirim ke admin melalui Telegram.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}