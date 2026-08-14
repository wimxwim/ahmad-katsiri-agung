"use client";

import { useEffect, useState, useMemo, useRef, useDeferredValue, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { Sparkles, FileText, CheckCircle2, XCircle, RefreshCw, Clock, AlertCircle, Loader2, Search, Filter, Zap, Wallet, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { csrfHeaders } from "@/lib/csrf";
import { useToast } from "@/components/ui/Toast";
import { MIN_TOPUP } from "@/lib/token-constants";

interface DraftItem {
  id: string;
  sourceFileName: string;
  status: string;
  materiJudul: string | null;
  createdAt: string;
  tokenInput: number | null;
  tokenOutput: number | null;
  errorMessage: string | null;
  kategori: string | null;
  leaseUntil?: string | null;
}

interface BalanceData {
  balance: number;
  isUnlocked: boolean;
  subscription?: {
    isUnlocked: boolean;
    canGenerate: boolean;
    canUpload: boolean;
    uploadCount: number;
    uploadLimit: number;
  };
}

const STATUS_META: Record<string, { label: string; color: string; icon: typeof Sparkles }> = {
  queued: { label: "Siap diproses", color: "bg-blue-50 text-blue-700", icon: Clock },
  extracting: { label: "Membaca dokumen...", color: "bg-amber-50 text-amber-700", icon: RefreshCw },
  extracted: { label: "Dokumen sudah dibaca", color: "bg-amber-50 text-amber-700", icon: FileText },
  generating: { label: "Sedang menyiapkan...", color: "bg-amber-50 text-amber-700", icon: Sparkles },
  ready: { label: "Siap diperiksa", color: "bg-emerald-50 text-emerald-700", icon: Sparkles },
  approved: { label: "Disetujui", color: "bg-emerald-50 text-emerald-800", icon: CheckCircle2 },
  rejected: { label: "Ditolak", color: "bg-red-50 text-red-700", icon: XCircle },
  failed: { label: "Gagal", color: "bg-red-50 text-red-700", icon: AlertCircle },
};

function Countdown({ seconds, onDone }: { seconds: number; onDone?: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);
  if (left <= 0) return null;
  return <span className="ml-1 font-mono text-xs">{left}s</span>;
}

function DraftsContent() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("semua");
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [generateError, setGenerateError] = useState("");
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkResult, setBulkResult] = useState("");
  const { toast } = useToast();
  const loadingRef = useRef(false);
  // F11-1 maxPoll 36x (~3 menit) counter + leaseUntil check
  const pollCountRef = useRef(0);
  const [polling, setPolling] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const deferredSearch = useDeferredValue(search);
  const deferredStatusFilter = useDeferredValue(statusFilter);
  const deferredKategoriFilter = useDeferredValue(kategoriFilter);

  const isFreeMode = process.env.NEXT_PUBLIC_FREE_GENERATE_MODE === "true";
  const canGenerate = balanceData?.subscription?.canGenerate ?? balanceData?.isUnlocked ?? false;
  const isFree = isFreeMode || canGenerate;

  useEffect(() => {
    fetch("/api/v1/token/balance", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.balance != null) setTokenBalance(d.balance);
        if (d) setBalanceData(d as BalanceData);
        if (d?.data?.balance != null) {
          setTokenBalance(d.data.balance);
          setBalanceData(d.data as BalanceData);
        }
      })
      .catch(() => {});
  }, []);

  async function handleGenerate(draftId: string) {
    setGenerateError("");
    setGeneratingIds((prev) => new Set(prev).add(draftId));
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setGenerateError("Kamu offline — beberapa fitur tidak tersedia");
        return;
      }
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`/api/v1/guru/drafts/${draftId}/generate`, {
        method: "POST",
        headers: csrfHeaders(),
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const retry = res.headers.get("Retry-After");
        if (res.status === 429) {
          const waitSec = retry ? parseInt(retry, 10) : 30;
          setGenerateError(`Terlalu banyak permintaan, coba lagi dalam ${waitSec} detik`);
        } else if (res.status === 402 && j?.locked) {
          if (isFree) {
            setGenerateError("Generate gratis aktif (Promo) — coba lagi, seharusnya tidak terkunci.");
          } else {
            setGenerateError(`Fitur generate AI terkunci. Silakan top-up minimal Rp${MIN_TOPUP.toLocaleString("id-ID")} untuk membuka akses.`);
            const timer = setTimeout(() => router.push("/guru/topup"), 2000);
            if (typeof window !== "undefined") {
              const cleanup = () => { clearTimeout(timer); window.removeEventListener("beforeunload", cleanup); };
              window.addEventListener("beforeunload", cleanup);
            }
          }
        } else if (res.status === 403) {
          setGenerateError("Sesi habis, muat ulang halaman");
        } else if (res.status === 409) {
          setGenerateError(j?.error?.message || j?.error || "Draft sedang diproses, coba lagi nanti");
        } else {
          setGenerateError(j?.error?.message || j?.error || "Gagal memulai generate");
        }
      } else {
        pollCountRef.current = 0;
        setPolling(true);
        await load();
        fetch("/api/v1/token/balance", { credentials: "include" })
          .then((r) => r.json())
          .then((d) => {
            const bal = d?.balance ?? d?.data?.balance;
            if (bal != null) setTokenBalance(bal);
            if (d) setBalanceData((d.data ?? d) as BalanceData);
          })
          .catch(() => {});
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("Failed to fetch") || (typeof navigator !== "undefined" && !navigator.onLine)) {
        setGenerateError("Kamu offline — beberapa fitur tidak tersedia");
      } else if (e instanceof DOMException && e.name === "AbortError") {
        setGenerateError("Request timeout (15 detik) — periksa koneksi lalu coba lagi");
      } else {
        setGenerateError("Gagal menghubungi server");
      }
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(draftId);
        return next;
      });
    }
  }

  const extractedDrafts = useMemo(() => drafts.filter((d) => d.status === "extracted"), [drafts]);
  const extractedCount = extractedDrafts.length;
  const bulkEstimate = extractedCount * 100;

  async function handleBulkGenerate() {
    if (extractedCount <= 1) return;
    setBulkGenerating(true);
    setBulkResult("");
    setGenerateError("");
    try {
      const results = await Promise.allSettled(
        extractedDrafts.map((d) =>
          fetch(`/api/v1/guru/drafts/${d.id}/generate`, {
            method: "POST",
            headers: csrfHeaders(),
            credentials: "include",
          }).then(async (res) => {
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              throw new Error(j?.error?.message || j?.error || `Gagal ${d.sourceFileName}`);
            }
            return d.id;
          }),
        ),
      );
      const fulfilled = results.filter((r) => r.status === "fulfilled").length;
      const rejected = results.filter((r) => r.status === "rejected").length;
      if (fulfilled > 0) {
        toast("success", `Berhasil memulai ${fulfilled} draft${rejected > 0 ? `, ${rejected} gagal` : ""}`);
        setBulkResult(`Berhasil ${fulfilled}/${extractedCount} draft — Estimasi Rp${bulkEstimate.toLocaleString("id-ID")} untuk ${extractedCount} draft`);
      } else {
        setGenerateError(`Bulk generate gagal untuk ${rejected} draft`);
      }
      await load();
      fetch("/api/v1/token/balance", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          const bal = d?.balance ?? d?.data?.balance;
          if (bal != null) setTokenBalance(bal);
          if (d) setBalanceData((d.data ?? d) as BalanceData);
        })
        .catch(() => {});
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Bulk generate gagal");
    } finally {
      setBulkGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Hapus draft ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/guru/drafts/${id}`, {
        method: "DELETE",
        headers: csrfHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast("success", "Draft berhasil dihapus");
      await load();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Gagal menghapus");
    } finally {
      setDeletingId(null);
    }
  }

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setError("");
      setErrorStatus(null);
      setRetryAfter(null);
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setError("Kamu offline — beberapa fitur tidak tersedia");
        setErrorStatus(0);
        setDrafts([]);
        return;
      }
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/v1/guru/drafts", { credentials: "include", signal: controller.signal });
      clearTimeout(t);
      if (!res.ok) {
        const retry = res.headers.get("Retry-After");
        setRetryAfter(retry);
        setErrorStatus(res.status);
        if (res.status === 429) {
          const waitSec = retry ? parseInt(retry, 10) : 30;
          setError(`Terlalu banyak permintaan, coba lagi dalam ${waitSec} detik`);
        } else if (res.status === 402) {
          setError("Saldo tidak cukup — Topup Rp10.000");
        } else if (res.status === 403) {
          setError("Sesi habis, muat ulang halaman");
        } else if (res.status === 404) {
          setError("");
          setDrafts([]);
          return;
        } else {
          setError("Gagal memuat draft. Coba lagi.");
        }
        setDrafts([]);
        return;
      }
      const { data } = await res.json();
      setDrafts(data || []);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setError("Request timeout (15 detik) — periksa koneksi lalu coba lagi");
        setErrorStatus(0);
      } else if (error instanceof Error && error.message.includes("Failed to fetch")) {
        setError("Kamu offline — beberapa fitur tidak tersedia");
        setErrorStatus(0);
      } else {
        if (process.env.NODE_ENV !== "production") console.error("[guru/drafts] load failed:", error);
        setError("Terjadi kesalahan saat memuat draft.");
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    return drafts.filter((d) => {
      const q = deferredSearch.toLowerCase();
      const matchSearch = !q ||
        (d.materiJudul || "").toLowerCase().includes(q) ||
        d.sourceFileName.toLowerCase().includes(q);
      const matchStatus = !deferredStatusFilter || d.status === deferredStatusFilter;
      const matchKategori = deferredKategoriFilter === "semua" || d.kategori === deferredKategoriFilter;
      return matchSearch && matchStatus && matchKategori;
    });
  }, [drafts, deferredSearch, deferredStatusFilter, deferredKategoriFilter]);

  // F11-4 pagination 20 per page + virtualized list comment TODO virtual
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => { setPage(1); }, [deferredSearch, deferredStatusFilter, deferredKategoriFilter]);

  const uniqueStatuses = useMemo(() => {
    const set = new Set(drafts.map((d) => d.status));
    return Array.from(set);
  }, [drafts]);

  const uniqueKategoris = useMemo(() => {
    const set = new Set(drafts.map((d) => d.kategori).filter(Boolean));
    return Array.from(set) as string[];
  }, [drafts]);

  useEffect(() => {
    load();
  }, [load]);

  // F11-1 polling stuck TTL 3 menit + leaseUntil: maxPoll 36x (~3 menit, 5s interval) + leaseUntil check
  useEffect(() => {
    const hasProcessing = drafts.some((d) => d.status === "generating" || d.status === "extracting" || d.status === "queued");
    if (!hasProcessing) {
      setPolling(false);
      pollCountRef.current = 0;
      return;
    }
    setPolling(true);
    let timer: ReturnType<typeof setTimeout>;
    let paused = document.hidden;
    const onVisibilityChange = () => {
      paused = document.hidden;
      if (!paused) {
        clearTimeout(timer);
        timer = setTimeout(poll, 5000);
      } else {
        clearTimeout(timer);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    const poll = () => {
      // F11-1 TTL 3 menit: maxPoll 36x + leaseUntil expired check
      pollCountRef.current += 1;
      const leaseExpired = drafts.some((draft) => draft.leaseUntil && new Date(draft.leaseUntil) < new Date());
      if (pollCountRef.current > 36 || leaseExpired) {
        clearTimeout(timer);
        setPolling(false);
        setGenerateError("Proses terlalu lama, coba Buat AI Ulang");
        return;
      }
      if (paused || document.hidden) {
        timer = setTimeout(poll, 15000);
        return;
      }
      load().finally(() => {
        timer = setTimeout(poll, 5000);
      });
    };
    timer = setTimeout(poll, 5000);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [drafts, load]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-heading font-bold text-2xl text-on-surface">Hasil AI untuk Ditinjau</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Hasil AI yang menunggu tinjauan Anda. Tidak ada yang otomatis tampil ke siswa sebelum Anda setujui.
            </p>
          </div>
          {isFree ? (
            <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 shadow-sm">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">Gratis — Generate Unlimited (Promo)</span>
            </span>
          ) : tokenBalance != null ? (
            <Link
              href="/guru/topup"
              className="inline-flex items-center gap-2 bg-white border border-border-precision rounded-xl px-4 py-2.5 min-h-11 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
            >
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-on-surface">
                Rp{tokenBalance.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-on-surface-variant/50">saldo</span>
            </Link>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div aria-busy="true" role="status" aria-label="Memuat draft">
          <SkeletonList />
        </div>
      ) : errorStatus === 404 ? (
        <EmptyState icon={Sparkles} title="Tidak ada draft" description="Belum ada draft AI untuk ditampilkan." action={{ label: "Upload Dokumen", href: "/guru/upload" }} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center px-4">
          <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-heading text-xl text-on-surface mb-2">Gagal Memuat Draft</h2>
          <p className="text-on-surface-variant mb-2 max-w-md">{error}</p>
          {errorStatus === 429 && retryAfter && <p className="text-xs text-on-surface-variant mb-2">Coba lagi dalam <Countdown seconds={parseInt(retryAfter, 10) || 30} onDone={() => load()} /> detik</p>}
          {errorStatus === 402 && (
            <Link href="/guru/topup" className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-2.5 min-h-11 rounded-full font-semibold hover:brightness-110 mb-3">Topup Rp10.000</Link>
          )}
          {errorStatus === 403 && <p className="text-xs text-on-surface-variant mb-3">Sesi habis, muat ulang halaman untuk login kembali.</p>}
          <button
            onClick={load}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 min-h-11 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      ) : drafts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Belum ada draft AI"
          description="Upload dokumen PDF atau DOCX untuk membuat draft materi, quiz, dan soal."
          action={{ label: "Upload Dokumen", href: "/guru/upload" }}
        />
      ) : (
        <>
          {generateError && (
            <div role="alert" aria-live="assertive" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {generateError}
              <button onClick={() => setGenerateError("")} className="ml-auto min-h-11 min-w-11 inline-flex items-center justify-center text-red-400 hover:text-red-600 rounded-full" aria-label="Tutup error">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          {polling && (
            <div role="status" aria-live="polite" className="mb-3 text-xs text-on-surface-variant flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Memproses... polling {pollCountRef.current}/36 (~3 menit TTL)
            </div>
          )}
          {extractedCount > 0 && !isFree && (
            <div className="mb-4 bg-white border border-border-precision rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-on-surface">Sisa 3 generate gratis → Upgrade</p>
                  <p className="text-xs text-on-surface-variant mt-1">Pilih paket yang sesuai kebutuhanmu</p>
                </div>
                <Link href="/guru/topup" className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full text-xs font-semibold hover:brightness-110 transition-all min-h-11">Upgrade</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl border border-border-precision bg-surface/50 p-3"><p className="font-semibold text-on-surface">Gratis 5</p><p className="text-on-surface-variant mt-1">5 generate/bulan — cukup untuk coba</p></div>
                <div className="rounded-xl border border-border-precision bg-surface/50 p-3"><p className="font-semibold text-on-surface">Sekolah via WA</p><p className="text-on-surface-variant mt-1">Paket sekolah — hubungi admin via WhatsApp</p></div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3"><p className="font-semibold text-primary">Topup</p><p className="text-on-surface-variant mt-1">Top-up saldo untuk generate tanpa batas</p></div>
              </div>
            </div>
          )}
          {extractedCount > 1 && (
            <div className="mb-4 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-on-surface">Generate Semua — {extractedCount} draft siap</p>
                <p className="text-xs text-on-surface-variant mt-1">Estimasi Rp{bulkEstimate.toLocaleString("id-ID")} untuk {extractedCount} draft (avg Rp100/draft)</p>
                {bulkResult && <p className="text-xs font-medium text-emerald-700 mt-1">{bulkResult}</p>}
              </div>
              <button
                onClick={handleBulkGenerate}
                disabled={bulkGenerating || (typeof navigator !== "undefined" && !navigator.onLine)}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-full text-sm font-bold bg-primary text-white hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {bulkGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses {extractedCount} draft...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Semua (estimasi Rp{bulkEstimate.toLocaleString("id-ID")})
                  </>
                )}
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <label htmlFor="cari-drafts" className="sr-only">Cari draft</label>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
              <input
                id="cari-drafts"
                aria-label="Cari draft"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari draft..."
                className="w-full pl-10 pr-4 py-2.5 min-h-11 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm"
              />
            </div>
            <div className="relative">
              <label htmlFor="filter-status-drafts" className="sr-only">Filter status</label>
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
              <select
                id="filter-status-drafts"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 min-h-11 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="">Semua Status</option>
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s]?.label || s}
                  </option>
                ))}
              </select>
            </div>
            {uniqueKategoris.length > 0 && (
              <div className="relative">
                <label htmlFor="filter-kategori-drafts" className="sr-only">Filter kategori</label>
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
                <select
                  id="filter-kategori-drafts"
                  value={kategoriFilter}
                  onChange={(e) => setKategoriFilter(e.target.value)}
                  className="pl-10 pr-4 py-2.5 min-h-11 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="semua">Semua Kategori</option>
                  <option value="materi">📄 Materi</option>
                  <option value="ppt">📊 PPT</option>
                  <option value="soal">📝 Soal</option>
                  <option value="docs">📋 Docs</option>
                  <option value="modul_ajar">📚 Modul Ajar</option>
                </select>
              </div>
            )}
          </div>
          <motion.div className="space-y-3" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-glass rounded-[32px] border border-border-precision">
              <FileText className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
              <p className="text-on-surface-variant">Tidak ada draft yang cocok</p>
            </div>
          ) : paged.map((d) => {
            const meta = STATUS_META[d.status] || STATUS_META.queued;
            const Icon = meta.icon;
            const isProcessing = ["queued", "extracting", "generating"].includes(d.status);
            const isFailedOrTimeout = d.status === "failed" || !!d.errorMessage;
            return (
              <motion.div
                key={d.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}
                className="bg-glass border border-border-precision rounded-[32px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:shadow-glass-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-2 sm:gap-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`sm:hidden px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${meta.color}`}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface break-words whitespace-normal">
                    {d.materiJudul || d.sourceFileName}
                  </p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-2 mt-1 flex-wrap">
                    <Clock className="w-3 h-3" />
                    {new Date(d.createdAt).toLocaleString("id-ID")}
                    {d.tokenInput != null && d.tokenOutput != null && (
                      <>
                        <span>·</span>
                        <span>{d.tokenInput + d.tokenOutput} token</span>
                      </>
                    )}
                    {d.errorMessage && (
                      <>
                        <span>·</span>
                        <span className="text-red-600">{d.errorMessage}</span>
                      </>
                    )}
                  </p>
                </div>
                <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${meta.color}`}>
                  {meta.label}
                </span>
                <div className="flex items-center gap-2 sm:gap-2">
                  {d.status === "ready" && (
                    <Link
                      href={`/guru/drafts/${d.id}`}
                      className="inline-flex items-center justify-center gap-1 min-h-11 min-w-11 px-4 py-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 active:scale-[0.98] transition-all whitespace-nowrap"
                    >
                      Tinjau
                    </Link>
                  )}
                  {(d.status === "extracted" || d.status === "queued" || d.status === "extracting") && (
                    <button
                      onClick={() => handleGenerate(d.id)}
                      disabled={generatingIds.has(d.id) || (typeof navigator !== "undefined" && !navigator.onLine)}
                      className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-4 py-2.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {generatingIds.has(d.id) ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Proses...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          Buat AI
                        </>
                      )}
                    </button>
                  )}
                  {isFailedOrTimeout && (
                    <button
                      onClick={() => handleGenerate(d.id)}
                      disabled={generatingIds.has(d.id)}
                      className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-4 py-2.5 rounded-full text-xs font-bold bg-amber-500 text-white hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Buat AI Ulang
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={deletingId === d.id}
                    className="inline-flex items-center justify-center min-w-11 min-h-11 px-3 py-2.5 rounded-full text-on-surface-variant/50 hover:text-red-600 hover:bg-red-50 active:scale-[0.95] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Hapus draft"
                    aria-label="Hapus draft"
                  >
                    {deletingId === d.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
          </motion.div>
          {/* F11-4 pagination 20 per page */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Prev</button>
              <span className="text-xs text-on-surface-variant">Halaman {page} / {totalPages} — {filtered.length} draft</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Next</button>
            </div>
          )}
          {/* TODO virtual: jika draft >100, ganti list dengan @tanstack/react-virtual virtualizer */}
        </>
      )}
    </div>
  );
}

export default function GuruDraftsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div aria-busy="true" role="status"><SkeletonList /></div>}>
        <DraftsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
