"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, FileText, CheckCircle2, XCircle, RefreshCw, Clock, AlertCircle, Loader2, Search, Filter, Zap, Wallet, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { csrfHeaders } from "@/lib/csrf";
import { useToast } from "@/components/ui/Toast";

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
}

const STATUS_META: Record<string, { label: string; color: string; icon: typeof Sparkles }> = {
  queued: { label: "Antrian", color: "bg-blue-50 text-blue-700", icon: Clock },
  extracting: { label: "Membaca dokumen...", color: "bg-amber-50 text-amber-700", icon: RefreshCw },
  extracted: { label: "Dokumen sudah dibaca", color: "bg-amber-50 text-amber-700", icon: FileText },
  generating: { label: "Sedang menyiapkan...", color: "bg-amber-50 text-amber-700", icon: Sparkles },
  ready: { label: "Siap diperiksa", color: "bg-emerald-50 text-emerald-700", icon: Sparkles },
  approved: { label: "Disetujui", color: "bg-emerald-50 text-emerald-800", icon: CheckCircle2 },
  rejected: { label: "Ditolak", color: "bg-red-50 text-red-700", icon: XCircle },
  failed: { label: "Gagal", color: "bg-red-50 text-red-700", icon: AlertCircle },
};

export default function GuruDraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [generateError, setGenerateError] = useState("");
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const loadingRef = useRef(false);

  useEffect(() => {
    fetch("/api/v1/token/balance", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d?.balance != null) setTokenBalance(d.balance); })
      .catch(() => {});
  }, []);

  async function handleGenerate(draftId: string) {
    setGenerateError("");
    setGeneratingIds((prev) => new Set(prev).add(draftId));
    try {
      const res = await fetch(`/api/v1/guru/drafts/${draftId}/generate`, {
        method: "POST",
        headers: csrfHeaders(),
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (res.status === 402 && j?.locked) {
          setGenerateError("Fitur generate AI terkunci. Silakan top-up minimal Rp10.000 untuk membuka akses.");
          const timer = setTimeout(() => router.push("/guru/topup"), 2000);
          if (typeof window !== "undefined") {
            const cleanup = () => { clearTimeout(timer); window.removeEventListener("beforeunload", cleanup); };
            window.addEventListener("beforeunload", cleanup);
          }
        } else {
          setGenerateError(j?.error?.message || j?.error || "Gagal memulai generate");
        }
      } else {
        await load();
        fetch("/api/v1/token/balance", { credentials: "include" })
          .then((r) => r.json())
          .then((d) => { if (d?.balance != null) setTokenBalance(d.balance); })
          .catch(() => {});
      }
    } catch {
      setGenerateError("Gagal menghubungi server");
    } finally {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(draftId);
        return next;
      });
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

  async function load() {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setError("");
      const res = await fetch("/api/v1/guru/drafts", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 429) {
          setError("Terlalu banyak request. Tunggu beberapa detik lalu coba lagi.");
        } else {
          setError("Gagal memuat draft. Coba lagi.");
        }
        setDrafts([]);
        return;
      }
      const { data } = await res.json();
      setDrafts(data || []);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.error("[guru/drafts] load failed:", error);
      setError("Terjadi kesalahan saat memuat draft.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return drafts.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (d.materiJudul || "").toLowerCase().includes(q) ||
        d.sourceFileName.toLowerCase().includes(q);
      const matchStatus = !statusFilter || d.status === statusFilter;
      const matchKategori = !kategoriFilter || d.kategori === kategoriFilter;
      return matchSearch && matchStatus && matchKategori;
    });
  }, [drafts, search, statusFilter, kategoriFilter]);

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
  }, []);

  useEffect(() => {
    const hasProcessing = drafts.some((d) => ["queued", "extracting", "generating"].includes(d.status));
    if (!hasProcessing) return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [drafts]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading font-bold text-2xl text-on-surface">Hasil AI untuk Ditinjau</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Hasil AI yang menunggu tinjauan Anda. Tidak ada yang otomatis tampil ke siswa sebelum Anda setujui.
            </p>
          </div>
          {tokenBalance != null && (
            <Link
              href="/guru/topup"
              className="inline-flex items-center gap-2 bg-white border border-border-precision rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
            >
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-on-surface">
                Rp{tokenBalance.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-on-surface-variant/50">saldo</span>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center px-4">
          <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-heading text-xl text-on-surface mb-2">Gagal Memuat Draft</h2>
          <p className="text-on-surface-variant mb-6 max-w-md">{error}</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer"
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
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {generateError}
              <button onClick={() => setGenerateError("")} className="ml-auto text-red-400 hover:text-red-600">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari draft..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 text-sm"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 appearance-none cursor-pointer min-w-[140px]"
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
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
                <select
                  value={kategoriFilter}
                  onChange={(e) => setKategoriFilter(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="">Semua Kategori</option>
                  {uniqueKategoris.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-glass rounded-2xl border border-border-precision">
              <FileText className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
              <p className="text-on-surface-variant">Tidak ada draft yang cocok</p>
            </div>
          ) : filtered.map((d) => {
            const meta = STATUS_META[d.status] || STATUS_META.queued;
            const Icon = meta.icon;
            const isProcessing = ["queued", "extracting", "generating"].includes(d.status);
            return (
              <div
                key={d.id}
                className="bg-glass border border-border-precision rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              >
                <div className="flex items-center gap-3 sm:gap-0">
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
                <div className="flex items-center gap-2 sm:gap-0">
                  {d.status === "ready" && (
                    <Link
                      href={`/guru/drafts/${d.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 active:scale-[0.98] transition-all whitespace-nowrap"
                    >
                      Tinjau
                    </Link>
                  )}
                  {(d.status === "extracted" || d.status === "failed" || d.status === "queued") && (
                    <button
                      onClick={() => handleGenerate(d.id)}
                      disabled={generatingIds.has(d.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={deletingId === d.id}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-on-surface-variant/50 hover:text-red-600 hover:bg-red-50 active:scale-[0.95] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Hapus draft"
                  >
                    {deletingId === d.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}
