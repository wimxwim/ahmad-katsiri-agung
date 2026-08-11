"use client";

import {
  Heart,
  Wallet,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Coins,
  ChevronRight,
  LogOut,
  BookOpen,
  Users,
  FileText,
  CheckSquare,
  Crown,
  Lock,
  Sparkles,
  Key,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { MIN_TOPUP } from "@/lib/token-constants";
import { useEffect, useState, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api-helpers";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AccountData {
  id: string;
  nama: string;
  email: string;
  role: string;
  kelas?: string;
  noAbsen?: string;
  tanggalLahir?: string;
  uploadCount: number;
  lastActiveAt?: string;
  namaSekolah?: string;
  createdAt: string;
  hasGoogle: boolean;
  hasPassword: boolean;
}

interface BalanceData {
  userId: string;
  balance: number;
  totalTopup: number;
  totalSpent: number;
  lastTopupAt: Date | null;
  subscription?: {
    isUnlocked: boolean;
    uploadCount: number;
    uploadLimit: number;
    canGenerate: boolean;
    canUpload: boolean;
  };
}

interface DashboardData {
  totalKursus: number;
  totalSiswa: number;
  draftMenunggu: number;
  totalKuisDikerjakan: number;
  siswaBelumMengerjakan: number;
  totalMateriPublished: number;
  totalQuizPublished: number;
  kursusList: { id: string; judul: string; slug: string; deskripsi: string | null; statusPublikasi: string }[];
  aiQuotaUsed: number;
  aiQuotaLimit: number;
  weakTopics: { pertanyaan: string; errorRate: number; totalJawab: number }[];
  siswaBerisiko: number;
  siswaKritis: number;
}

const SPRING_CONFIG = { type: "spring" as const, stiffness: 100, damping: 20 };

export default function GuruProfilPage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [donating, setDonating] = useState(false);
  const [donated, setDonated] = useState(false);
  const [donateError, setDonateError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordDone, setPasswordDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    const [accRes, balRes, dashRes] = await Promise.all([
      apiFetch<AccountData>("/api/v1/account/me"),
      apiFetch<BalanceData>("/api/v1/token/balance"),
      apiFetch<DashboardData>("/api/v1/guru/dashboard"),
    ]);
    if (!mountedRef.current) return;
    if (accRes.ok && accRes.data) setAccount(accRes.data);
    if (balRes.ok && balRes.data) setBalance(balRes.data);
    if (dashRes.ok && dashRes.data) setDashboard(dashRes.data);
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

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("Password minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Password tidak cocok.");
      return;
    }

    setPasswordLoading(true);
    const res = await apiFetch("/api/v1/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
    setPasswordLoading(false);

    if (res.ok) {
      setPasswordDone(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordDone(false);
        setShowPasswordForm(false);
      }, 2000);
    } else {
      setPasswordError(res.error || "Gagal mengatur password.");
    }
  };

  const allFailed = !loading && !account && !balance && !dashboard;

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="h-7 w-48 bg-primary/5 rounded-lg animate-pulse" />
        <div className="bg-glass rounded-card p-6 h-28 animate-pulse border border-border-precision" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-glass rounded-card p-6 h-28 animate-pulse border border-border-precision" />
          ))}
        </div>
        <div className="bg-glass rounded-card p-6 h-28 animate-pulse border border-border-precision" />
        <div className="bg-glass rounded-card p-6 h-28 animate-pulse border border-border-precision" />
      </div>
    );
  }

  if (allFailed) {
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
      {/* Header */}
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

      {/* Profile Card */}
      {account && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.1 }}
          className="bg-glass border border-border-precision rounded-card p-6 shadow-glass"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="font-heading font-bold text-xl">{account.nama.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading font-bold text-lg text-on-surface truncate">{account.nama}</p>
              <p className="text-sm text-on-surface-variant truncate">{account.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                  {account.role}
                </span>
                {account.hasPassword && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                    Email
                  </span>
                )}
                {account.hasGoogle && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700">
                    Google
                  </span>
                )}
                {account.namaSekolah && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700">
                    {account.namaSekolah}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-on-surface-variant">
                <span>
                  Bergabung{" "}
                  {new Date(account.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
                <span>Upload {account.uploadCount}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      {dashboard && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="bg-glass border border-border-precision rounded-card p-5 shadow-glass">
            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="font-heading text-2xl font-bold text-on-surface tabular-nums">{dashboard.totalKursus}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Total Kursus</p>
          </div>
          <div className="bg-glass border border-border-precision rounded-card p-5 shadow-glass">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <p className="font-heading text-2xl font-bold text-on-surface tabular-nums">{dashboard.totalSiswa}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Total Siswa</p>
          </div>
          <div className="bg-glass border border-border-precision rounded-card p-5 shadow-glass">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <p className="font-heading text-2xl font-bold text-on-surface tabular-nums">{dashboard.totalMateriPublished}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Materi</p>
          </div>
          <div className="bg-glass border border-border-precision rounded-card p-5 shadow-glass">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckSquare className="w-5 h-5" />
            </div>
            <p className="font-heading text-2xl font-bold text-on-surface tabular-nums">{dashboard.totalQuizPublished}</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Quiz</p>
          </div>
        </motion.div>
      )}

      {/* Langganan Card */}
      {balance && balance.subscription && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.2 }}
          className="bg-glass border border-border-precision rounded-card p-6 shadow-glass"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg text-on-surface flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Langganan
            </h2>
          </div>

          {balance.subscription.isUnlocked ? (
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 mb-3">
                <CheckCircle className="w-3.5 h-3.5" />
                Aktif
              </span>
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Upload Unlimited
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Generate AI Unlimited
                </div>
              </div>
            </div>
          ) : (
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 mb-3">
                <Lock className="w-3.5 h-3.5" />
                Free Tier
              </span>
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Upload className="w-4 h-4 text-amber-500" />
                  Upload: {balance.subscription.uploadCount}/{balance.subscription.uploadLimit}
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Lock className="w-4 h-4 text-red-400" />
                  Generate AI: terkunci (top-up Rp{MIN_TOPUP.toLocaleString("id-ID")})
                </div>
              </div>
              <Link
                href="/guru/topup"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Top-Up Sekarang
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* Ganti Password Card */}
      {account && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.22 }}
          className="bg-glass border border-border-precision rounded-card p-6 shadow-glass"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg text-on-surface flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Keamanan
            </h2>
          </div>

          {!showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-on-surface">Password</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {account.hasPassword ? "••••••••" : "Belum diatur"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPasswordForm(true);
                  setPasswordDone(false);
                  setPasswordError("");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                <Key className="w-4 h-4" />
                {account.hasPassword ? "Ganti" : "Atur"}
              </button>
            </div>
          ) : passwordDone ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3"
            >
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">Password berhasil disimpan!</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-3">
              {passwordError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-2.5 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {passwordError}
                </div>
              )}
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru (min. 8 karakter)"
                  required
                  className="w-full px-4 py-2.5 pr-12 rounded-full bg-white/80 border border-border-precision text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
                required
                className="w-full px-4 py-2.5 rounded-full bg-white/80 border border-border-precision text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {passwordLoading ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError("");
                  }}
                  className="px-4 py-2.5 rounded-full text-sm font-semibold bg-white/60 border border-border-precision text-on-surface-variant hover:text-on-surface transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {/* Token Balance Card */}
      {balance && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.25 }}
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

      {/* Donation Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.3 }}
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

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_CONFIG, delay: 0.35 }}
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