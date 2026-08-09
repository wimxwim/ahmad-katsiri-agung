"use client";

import { cn } from "@/lib/utils";
import { EASE_CURVE, WA_NUMBER } from "@/lib/constants";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  BookOpen,
  Send,
  GraduationCap,
  MessageSquare,
  LogOut,
  ArrowRight,
  Clock,
  RefreshCw,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";

const PIPELINE_STEPS = [
  { key: "uploading", icon: Upload, label: "Upload" },
  { key: "extracting", icon: FileText, label: "Ekstraksi" },
  { key: "ready", icon: CheckCircle2, label: "Siap" },
] as const;

interface UploadProgressProps {
  status: "uploading" | "extracting" | "ready" | "failed";
  progress?: number;
  message?: string;
  fileName?: string;
}

function UploadProgress({ status, message, fileName }: UploadProgressProps) {
  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.key === status);
  const isFailed = status === "failed";

  return (
    <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-8 shadow-glass">
      {fileName && (
        <p className="text-sm font-medium text-on-surface mb-4 truncate max-w-full">
          {fileName}
        </p>
      )}

      <div className="flex items-center justify-between mb-6">
        {PIPELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx && !isFailed;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                  isCompleted && "bg-emerald-100 text-emerald-700",
                  isCurrent && !isFailed && "bg-primary/10 text-primary ring-2 ring-primary/30",
                  isPending && "bg-gray-100 text-gray-300",
                  isFailed && "bg-red-50 text-red-500"
                )}
                style={{ transitionTimingFunction: `cubic-bezier(${EASE_CURVE.join(",")})` }}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent && !isFailed ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold whitespace-nowrap",
                  isCompleted && "text-emerald-700",
                  isCurrent && !isFailed && "text-primary",
                  isPending && "text-gray-300",
                  isFailed && "text-red-600"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Gagal memproses</p>
            {message && (
              <p className="text-xs text-red-700 mt-1">{message}</p>
            )}
          </div>
        </div>
      )}

      {!isFailed && status !== "ready" && message && (
        <div className="flex items-center gap-2 justify-center">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <p className="text-sm text-on-surface-variant">{message}</p>
        </div>
      )}

      {status === "ready" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_CURVE }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">
            {message || "Draft siap direview!"}
          </p>
        </motion.div>
      )}
    </div>
  );
}

interface DashboardGuruKosongProps {
  namaGuru?: string;
}

const GURU_STEPS = [
  {
    icon: BookOpen,
    title: "Buat Kursus",
    desc: "Buat kelas atau mata pelajaran yang akan diampu",
    href: "/guru/buat",
  },
  {
    icon: Upload,
    title: "Upload Dokumen",
    desc: "Upload PDF/DOCX — AI akan buat draft materi, kuis, dan soal",
    href: "/guru/upload",
  },
  {
    icon: Send,
    title: "Review & Publish",
    desc: "Tinjau hasil AI, edit, lalu terbitkan ke siswa",
    href: "/guru/drafts",
  },
];

function DashboardGuruKosong({ namaGuru }: DashboardGuruKosongProps) {
  return (
    <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-10 shadow-glass">
      <div className="text-center mb-8">
        <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
          <GraduationCap className="w-7 h-7" />
        </span>
        <h2 className="font-heading font-bold text-xl text-on-surface mb-1">
          Selamat datang{namaGuru ? `, ${namaGuru}` : ""}!
        </h2>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          Mulai dengan tiga langkah mudah untuk membuat materi pembelajaran pertama Anda.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {GURU_STEPS.map((step, idx) => {
          return (
            <Link
              key={step.href}
              href={step.href}
              className="flex items-center gap-4 p-4 rounded-2xl bg-surface/50 hover:bg-primary/5 border border-border-precision transition-all duration-300 group"
              style={{ transitionTimingFunction: `cubic-bezier(${EASE_CURVE.join(",")})` }}
            >
              <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-on-surface text-sm group-hover:text-primary transition-colors">
                  {step.title}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">{step.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>

      <div className="text-center">
        <Link
          href="/guru/upload"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
        >
          Upload Dokumen Pertama
        </Link>
      </div>
    </div>
  );
}

function DashboardSiswaKosong() {
  return (
    <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-10 shadow-glass text-center">
      <span className="w-14 h-14 rounded-2xl bg-tertiary/10 text-tertiary grid place-items-center mx-auto mb-4">
        <FileText className="w-7 h-7" />
      </span>
      <h3 className="font-heading font-bold text-xl text-on-surface mb-2">
        Belum Ada Materi
      </h3>
      <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-4">
        Guru Anda belum menerbitkan materi atau tugas apa pun. Silakan tunggu informasi
        dari guru atau hubungi langsung jika ada pertanyaan.
      </p>
      <Link
        href={`https://wa.me/${WA_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-tertiary text-on-tertiary px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
      >
        <MessageSquare className="w-4 h-4" />
        Hubungi Guru
      </Link>
    </div>
  );
}

interface RoleMismatchErrorProps {
  currentPortal: string;
  actualRole: string;
}

const PORTAL_LABELS: Record<string, string> = {
  guru: "Portal Guru",
  siswa: "Portal Siswa",
  owner: "Portal Owner",
  "admin-sekolah": "Portal Admin Sekolah",
  "orang-tua": "Portal Orang Tua",
};

const DESTINATION_MAP: Record<string, string> = {
  guru: "/guru",
  siswa: "/siswa",
  owner: "/owner",
  "admin-sekolah": "/admin-sekolah",
  "orang-tua": "/orang-tua",
};

function RoleMismatchError({ currentPortal, actualRole }: RoleMismatchErrorProps) {
  const portalLabel = PORTAL_LABELS[currentPortal] || currentPortal;
  const roleLabel = PORTAL_LABELS[actualRole] || actualRole;
  const correctHref = DESTINATION_MAP[actualRole] || "/";

  return (
    <div className="bg-glass border border-border-precision rounded-2xl p-6 sm:p-10 shadow-glass max-w-md mx-auto text-center">
      <span className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 grid place-items-center mx-auto mb-4">
        <ShieldAlert className="w-7 h-7" />
      </span>
      <h2 className="font-heading font-bold text-xl text-on-surface mb-2">Akses Ditolak</h2>
      <p className="text-sm text-on-surface-variant mb-4">
        Akun ini tidak memiliki akses ke{" "}
        <span className="font-semibold text-on-surface">{portalLabel}</span>.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-left">
        <p className="text-xs font-semibold text-amber-800 mb-1">Akun Anda terdaftar sebagai:</p>
        <p className="text-sm font-bold text-amber-900">{roleLabel}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          href={correctHref}
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          Buka {roleLabel}
        </Link>
        <RoleMismatchLogoutButton />
      </div>
    </div>
  );
}

function RoleMismatchLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__Host-psrf="))
        ?.split("=")[1] || "";
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
      });
    } catch {
      // logout is best-effort
    } finally {
      router.push("/masuk");
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 text-sm text-on-surface-variant hover:text-red-600 transition-colors disabled:opacity-50"
    >
      <LogOut className="w-4 h-4" />
      {loading ? "Keluar..." : "Logout & gunakan akun lain"}
    </button>
  );
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  queued: { label: "Antrian", color: "bg-blue-50 text-blue-700", icon: Clock },
  extracting: { label: "Ekstraksi...", color: "bg-amber-50 text-amber-700", icon: RefreshCw },
  extracted: { label: "Terekstrak", color: "bg-amber-50 text-amber-700", icon: FileText },
  generating: { label: "AI bekerja...", color: "bg-amber-50 text-amber-700", icon: Sparkles },
  ready: { label: "Draft siap", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  approved: { label: "Disetujui", color: "bg-emerald-50 text-emerald-800", icon: CheckCircle2 },
  rejected: { label: "Ditolak", color: "bg-red-50 text-red-700", icon: XCircle },
  failed: { label: "Gagal", color: "bg-red-50 text-red-700", icon: AlertCircle },
};

interface ProcessingStatusBadgeProps {
  status: "queued" | "extracting" | "extracted" | "generating" | "ready" | "approved" | "rejected" | "failed";
  className?: string;
}

function ProcessingStatusBadge({ status, className }: ProcessingStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.queued;
  const Icon = cfg.icon;
  const isAnimating = ["queued", "extracting", "generating"].includes(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
        cfg.color,
        className
      )}
    >
      {isAnimating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}

export {
  UploadProgress,
  DashboardGuruKosong,
  DashboardSiswaKosong,
  RoleMismatchError,
  ProcessingStatusBadge,
};

export type {
  UploadProgressProps,
  DashboardGuruKosongProps,
  RoleMismatchErrorProps,
  ProcessingStatusBadgeProps,
};
