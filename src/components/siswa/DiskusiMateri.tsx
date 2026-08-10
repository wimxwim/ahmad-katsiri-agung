"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  GraduationCap,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  User,
} from "lucide-react";
import { csrfHeaders } from "@/lib/csrf";

interface DiskusiItem {
  id: string;
  materiId: string;
  userId: string;
  userName: string;
  role: "SISWA" | "GURU";
  pertanyaan: string;
  jawaban: string | null;
  createdAt: string;
}

interface DiskusiMateriProps {
  materiId: string;
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

export default function DiskusiMateri({ materiId }: DiskusiMateriProps) {
  const [items, setItems] = useState<DiskusiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pertanyaan, setPertanyaan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchDiskusi = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/v1/siswa/materi/${materiId}/diskusi`, {
        credentials: "include",
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(j.error?.message || j.error || "Gagal memuat diskusi");
      }
      setItems(j.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat diskusi");
    } finally {
      setLoading(false);
    }
  }, [materiId]);

  useEffect(() => {
    fetchDiskusi();
  }, [fetchDiskusi]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = pertanyaan.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const r = await fetch(`/api/v1/siswa/materi/${materiId}/diskusi`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify({ pertanyaan: text }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(j.error?.message || j.error || "Gagal mengirim pertanyaan");
      }
      setPertanyaan("");
      await fetchDiskusi();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Gagal mengirim pertanyaan",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-label="Diskusi Materi"
      className="mt-8 bg-glass border border-border-precision rounded-2xl p-6 sm:p-8 shadow-glass"
    >
      <div className="flex items-start gap-3 mb-5">
        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <MessageCircle className="w-5 h-5" />
        </span>
        <div>
          <h2 className="font-heading font-bold text-lg text-on-surface">
            Diskusi
          </h2>
          <p className="text-xs text-on-surface-variant">
            Tanya jawab dengan guru tentang materi ini
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-5 bg-red-50/50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            onClick={fetchDiskusi}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-surface/60 rounded-2xl p-4 animate-pulse"
            >
              <div className="h-3 w-1/3 bg-border-precision rounded-full mb-3" />
              <div className="h-3 w-full bg-border-precision/60 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-8">
          <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-3">
            <MessageCircle className="w-6 h-6" />
          </span>
          <p className="text-sm text-on-surface-variant">
            Belum ada pertanyaan. Jadilah yang pertama bertanya!
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && items.length > 0 && (
        <ul className="flex flex-col gap-3 mb-6">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-surface/60 border border-border-precision/60 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
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
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Siswa
                </span>
              </div>
              <p className="text-sm text-on-surface whitespace-pre-wrap break-words">
                {item.pertanyaan}
              </p>

              {item.jawaban && (
                <div className="mt-3 ml-4 sm:ml-10 bg-primary/[0.04] border border-primary/15 rounded-2xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-xs font-bold text-primary">
                      Jawaban Guru
                    </p>
                  </div>
                  <p className="text-sm text-on-surface whitespace-pre-wrap break-words">
                    {item.jawaban}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Ask form */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-border-precision/40 pt-5"
      >
        <label
          htmlFor="diskusi-pertanyaan"
          className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2"
        >
          Ajukan Pertanyaan
        </label>
        <textarea
          id="diskusi-pertanyaan"
          value={pertanyaan}
          onChange={(e) => setPertanyaan(e.target.value)}
          placeholder="Tulis pertanyaanmu tentang materi ini..."
          rows={3}
          maxLength={2000}
          required
          className="w-full bg-surface border border-border-precision rounded-2xl p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-y"
        />
        {submitError && (
          <p className="mt-2 text-xs text-red-600">{submitError}</p>
        )}
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={submitting || pertanyaan.trim().length === 0}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-hidden"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Kirim Pertanyaan
          </button>
        </div>
      </form>
    </section>
  );
}