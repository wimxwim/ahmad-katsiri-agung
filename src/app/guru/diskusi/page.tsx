"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { AlertCircle, BookOpen, Loader2, MessageCircle, RefreshCw, Send, User } from "lucide-react";
import { csrfHeaders } from "@/lib/csrf";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { apiFetch } from "@/lib/api-helpers";

interface DiskusiItem {
  id: string;
  materiId: string;
  aiGenerationId: string;
  userName: string;
  role: "SISWA" | "GURU";
  pertanyaan: string;
  jawaban: string | null;
  createdAt: string;
  judulMateri: string;
}

interface DiskusiResponse {
  data: DiskusiItem[];
  belumDijawab: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Countdown({ seconds, onDone }: { seconds: number; onDone?: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onDone?.(); return; }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);
  if (left <= 0) return null;
  return <span className="ml-1 font-mono text-xs">{left}s</span>;
}

function DiskusiContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isOnline, setIsOnline] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // F11-2 Offline guard + localStorage autosave
  useEffect(() => {
    if (typeof navigator !== "undefined") setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("akal-draft-diskusi");
      if (saved) {
        const p = JSON.parse(saved);
        if (p && typeof p === "object") setDrafts(p as Record<string, string>);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("akal-draft-diskusi", JSON.stringify(drafts)); } catch {}
  }, [drafts]);

  const { data: queryData, isLoading: loading, error: queryError, refetch } = useQuery<DiskusiResponse>({
    queryKey: ["guru", "diskusi"],
    queryFn: async () => {
      // F11-2 timeout 15s + offline via apiFetch
      const result = await apiFetch<DiskusiItem[]>("/api/v1/guru/diskusi");
      if (!result.ok) {
        const err = Object.assign(new Error(result.error || "Gagal memuat pertanyaan"), { status: result.status, retryAfter: result.retryAfter });
        throw err;
      }
      const raw = result.raw as { belumDijawab?: number } | null;
      return { data: result.data || [], belumDijawab: raw?.belumDijawab || 0 };
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });

  const items = queryData?.data ?? [];
  const belumDijawab = queryData?.belumDijawab ?? 0;
  const qErr = queryError as unknown as { message: string; status?: number; retryAfter?: string | null } | null;
  const errorStatus = qErr?.status ?? null;
  const retryAfter = qErr?.retryAfter ?? null;
  const error = qErr ? qErr.message : "";

  const replyMutation = useMutation({
    mutationFn: async ({ item, jawaban }: { item: DiskusiItem; jawaban: string }) => {
      if (!isOnline) throw new Error("Kamu offline — beberapa fitur tidak tersedia");
      const r = await fetch(`/api/v1/guru/materi/${item.materiId}/diskusi`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify({ diskusiId: item.id, jawaban }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 429) throw Object.assign(new Error(`Terlalu banyak permintaan, coba lagi dalam ${r.headers.get("Retry-After") || 30} detik`), { status: 429 });
        if (r.status === 402) throw Object.assign(new Error("Saldo tidak cukup — Topup Rp10.000"), { status: 402 });
        if (r.status === 403) throw Object.assign(new Error("Sesi habis, muat ulang halaman"), { status: 403 });
        throw new Error(j.error?.message || j.error || "Gagal mengirim jawaban");
      }
      return j;
    },
    onSuccess: (_, { item }) => {
      setDrafts((prev) => ({ ...prev, [item.id]: "" }));
      try { localStorage.setItem("akal-draft-diskusi", JSON.stringify({ ...drafts, [item.id]: "" })); } catch {}
      toast("success", "Jawaban terkirim");
      queryClient.invalidateQueries({ queryKey: ["guru", "diskusi"] });
    },
    onError: (err: Error) => { toast("error", err.message || "Gagal mengirim jawaban"); },
  });

  async function handleReply(item: DiskusiItem) {
    const jawaban = (drafts[item.id] || "").trim();
    if (!jawaban || replyMutation.isPending) return;
    if (!isOnline) { toast("error", "Kamu offline — beberapa fitur tidak tersedia"); return; }
    replyMutation.mutate({ item, jawaban });
  }

  const unanswered = useMemo(() => items.filter((i) => !i.jawaban), [items]);
  const answered = useMemo(() => items.filter((i) => i.jawaban), [items]);
  // F11-4 pagination 20 per page
  const pagedUnanswered = useMemo(() => unanswered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [unanswered, page]);
  const totalPagesUnanswered = Math.ceil(unanswered.length / PAGE_SIZE);
  useEffect(() => { setPage(1); }, [unanswered.length]);

  return (
    <div className="isolate">
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading font-bold text-2xl text-on-surface">Pertanyaan Siswa</h1>
            <p className="text-sm text-on-surface-variant mt-1">Balas pertanyaan siswa tentang materi yang sudah Anda terbitkan.</p>
          </div>
          {belumDijawab > 0 && (
            <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-sm font-bold">
              <MessageCircle className="w-4 h-4" /> {belumDijawab} belum dijawab
            </span>
          )}
        </div>
      </div>

      {!isOnline && (
        <div role="status" aria-live="polite" className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> Kamu offline — beberapa fitur tidak tersedia
        </div>
      )}

      {loading ? (
        <div aria-busy="true" role="status" aria-label="Memuat pertanyaan"><SkeletonList /></div>
      ) : errorStatus === 404 ? (
        <EmptyState icon={MessageCircle} title="Belum ada pertanyaan" description="Siswa yang bertanya akan muncul di sini." />
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center px-4">
          <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-6"><AlertCircle className="w-8 h-8 text-red-500" /></div>
          <h2 className="font-heading text-xl text-on-surface mb-2">Gagal Memuat Pertanyaan</h2>
          <p className="text-on-surface-variant mb-2 max-w-md">{error} {errorStatus === 429 && retryAfter && <Countdown seconds={parseInt(retryAfter, 10) || 30} onDone={() => refetch()} />}</p>
          {errorStatus === 402 && <Link href="/guru/topup" className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold mb-3">Topup Rp10.000</Link>}
          {errorStatus === 403 && <p className="text-xs text-on-surface-variant mb-3">Sesi habis, muat ulang halaman untuk login kembali.</p>}
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Coba Lagi
          </button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={MessageCircle} title="Semua pertanyaan sudah dijawab 🎉" description="Siswa yang bertanya akan muncul di sini." />
      ) : (
        <div className="space-y-3 @container">
          {unanswered.length > 0 && (
            <>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Perlu Dibalas ({unanswered.length})</p>
              <motion.div className="space-y-3" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
                {pagedUnanswered.map((item) => (
                  <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}><DiskusiCard item={item} draft={drafts[item.id] || ""} onDraftChange={(v) => setDrafts((prev) => ({ ...prev, [item.id]: v }))} submitting={replyMutation.isPending && replyMutation.variables?.item.id === item.id} disabled={replyMutation.isPending || !isOnline} onReply={() => handleReply(item)} /></motion.div>
                ))}
              </motion.div>
              {totalPagesUnanswered > 1 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Prev</button>
                  <span className="text-xs text-on-surface-variant">Halaman {page} / {totalPagesUnanswered}</span>
                  <button disabled={page >= totalPagesUnanswered} onClick={() => setPage((p) => Math.min(totalPagesUnanswered, p + 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Next</button>
                </div>
              )}
              {/* TODO virtual: jika diskusi >100, gunakan @tanstack/react-table + virtualizer */}
            </>
          )}
          {answered.length > 0 && (
            <>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Sudah Dijawab ({answered.length})</p>
              <motion.div className="space-y-3" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>{answered.slice(0, PAGE_SIZE).map((item) => (<motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}><DiskusiCard item={item} /></motion.div>))}</motion.div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DiskusiCard({ item, draft, onDraftChange, submitting, disabled, onReply }: { item: DiskusiItem; draft?: string; onDraftChange?: (value: string) => void; submitting?: boolean; disabled?: boolean; onReply?: () => void; }) {
  const isUnanswered = !item.jawaban;
  return (
    <div className="bento-card @container bg-glass border border-border-precision rounded-[32px] p-4 sm:p-5 shadow-glass isolate">
      <div className="flex items-center gap-2.5 mb-2">
        <span className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0"><User className="w-4 h-4" /></span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{item.userName}</p>
          <p className="text-[11px] text-on-surface-variant/70">{formatDate(item.createdAt)}</p>
        </div>
        {isUnanswered ? (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Belum dijawab</span>
        ) : (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Sudah dijawab</span>
        )}
      </div>
      <Link href={`/guru/drafts/${item.aiGenerationId}/published`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2">
        <BookOpen className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{item.judulMateri}</span>
      </Link>
      <p className="text-sm text-on-surface whitespace-pre-wrap break-words">{item.pertanyaan}</p>
      {item.jawaban && (
        <div className="mt-3 bg-primary/[0.04] border border-primary/15 rounded-2xl p-3.5">
          <p className="text-xs font-bold text-primary mb-1.5">Jawaban Guru</p>
          <p className="text-sm text-on-surface whitespace-pre-wrap break-words">{item.jawaban}</p>
        </div>
      )}
      {isUnanswered && onReply && onDraftChange && (
        <div className="mt-3">
          <label htmlFor={`diskusi-jawaban-${item.id}`} className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Jawaban Anda</label>
          <textarea id={`diskusi-jawaban-${item.id}`} value={draft || ""} onChange={(e) => onDraftChange(e.target.value)} placeholder="Tulis jawaban untuk pertanyaan ini..." rows={3} maxLength={2000} className="w-full bg-white border border-border-precision rounded-2xl p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-y" />
          <div className="mt-2 flex justify-end">
            <button onClick={onReply} disabled={disabled || !(draft || "").trim()} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden cursor-pointer">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Kirim Balasan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuruDiskusiPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div aria-busy="true" role="status"><SkeletonList /></div>}>
        <DiskusiContent />
      </Suspense>
    </ErrorBoundary>
  );
}
