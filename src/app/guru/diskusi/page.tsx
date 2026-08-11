"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  User,
} from "lucide-react";
import { csrfHeaders } from "@/lib/csrf";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GuruDiskusiPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<DiskusiItem[]>([]);
  const [belumDijawab, setBelumDijawab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/v1/guru/diskusi", { credentials: "include" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(j.error?.message || j.error || "Gagal memuat pertanyaan");
      }
      setItems(j.data || []);
      setBelumDijawab(j.belumDijawab || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pertanyaan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReply(item: DiskusiItem) {
    const jawaban = (drafts[item.id] || "").trim();
    if (!jawaban || submitting) return;
    setSubmitting(item.id);
    try {
      const r = await fetch(`/api/v1/guru/materi/${item.materiId}/diskusi`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify({ diskusiId: item.id, jawaban }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(j.error?.message || j.error || "Gagal mengirim jawaban");
      }
      setDrafts((prev) => ({ ...prev, [item.id]: "" }));
      toast("success", "Jawaban terkirim");
      await load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Gagal mengirim jawaban");
    } finally {
      setSubmitting(null);
    }
  }

  const unanswered = items.filter((i) => !i.jawaban);
  const answered = items.filter((i) => i.jawaban);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading font-bold text-2xl text-on-surface">
              Pertanyaan Siswa
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Balas pertanyaan siswa tentang materi yang sudah Anda terbitkan.
            </p>
          </div>
          {belumDijawab > 0 && (
            <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-sm font-bold">
              <MessageCircle className="w-4 h-4" />
              {belumDijawab} belum dijawab
            </span>
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
          <h2 className="font-heading text-xl text-on-surface mb-2">
            Gagal Memuat Pertanyaan
          </h2>
          <p className="text-on-surface-variant mb-6 max-w-md">{error}</p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Semua pertanyaan sudah dijawab 🎉"
          description="Siswa yang bertanya akan muncul di sini."
        />
      ) : (
        <div className="space-y-3">
          {unanswered.length > 0 && (
            <>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Perlu Dibalas ({unanswered.length})
              </p>
              <div className="space-y-3">
                {unanswered.map((item) => (
                  <DiskusiCard
                    key={item.id}
                    item={item}
                    draft={drafts[item.id] || ""}
                    onDraftChange={(v) =>
                      setDrafts((prev) => ({ ...prev, [item.id]: v }))
                    }
                    submitting={submitting === item.id}
                    disabled={submitting !== null}
                    onReply={() => handleReply(item)}
                  />
                ))}
              </div>
            </>
          )}

          {answered.length > 0 && (
            <>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Sudah Dijawab ({answered.length})
              </p>
              <div className="space-y-3">
                {answered.map((item) => (
                  <DiskusiCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DiskusiCard({
  item,
  draft,
  onDraftChange,
  submitting,
  disabled,
  onReply,
}: {
  item: DiskusiItem;
  draft?: string;
  onDraftChange?: (value: string) => void;
  submitting?: boolean;
  disabled?: boolean;
  onReply?: () => void;
}) {
  const isUnanswered = !item.jawaban;

  return (
    <div className="bg-glass border border-border-precision rounded-2xl p-4 sm:p-5 shadow-glass">
      <div className="flex items-center gap-2.5 mb-2">
        <span className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
          <User className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">
            {item.userName}
          </p>
          <p className="text-[11px] text-on-surface-variant/70">
            {formatDate(item.createdAt)}
          </p>
        </div>
        {isUnanswered ? (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
            Belum dijawab
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
            Sudah dijawab
          </span>
        )}
      </div>

      <Link
        href={`/guru/drafts/${item.aiGenerationId}/published`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
      >
        <BookOpen className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{item.judulMateri}</span>
      </Link>

      <p className="text-sm text-on-surface whitespace-pre-wrap break-words">
        {item.pertanyaan}
      </p>

      {item.jawaban && (
        <div className="mt-3 bg-primary/[0.04] border border-primary/15 rounded-2xl p-3.5">
          <p className="text-xs font-bold text-primary mb-1.5">Jawaban Guru</p>
          <p className="text-sm text-on-surface whitespace-pre-wrap break-words">
            {item.jawaban}
          </p>
        </div>
      )}

      {isUnanswered && onReply && onDraftChange && (
        <div className="mt-3">
          <label
            htmlFor={`diskusi-jawaban-${item.id}`}
            className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2"
          >
            Jawaban Anda
          </label>
          <textarea
            id={`diskusi-jawaban-${item.id}`}
            value={draft || ""}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Tulis jawaban untuk pertanyaan ini..."
            rows={3}
            maxLength={2000}
            className="w-full bg-white border border-border-precision rounded-2xl p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-y"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={onReply}
              disabled={disabled || !(draft || "").trim()}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Kirim Balasan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}