"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, FileText, CheckCircle2, XCircle, RefreshCw, Clock, AlertCircle, Loader2 } from "lucide-react";

interface DraftItem {
  id: string;
  sourceFileName: string;
  status: string;
  materiJudul: string | null;
  createdAt: string;
  tokenInput: number | null;
  tokenOutput: number | null;
  errorMessage: string | null;
}

const STATUS_META: Record<string, { label: string; color: string; icon: typeof Sparkles }> = {
  queued: { label: "Antrian", color: "bg-blue-50 text-blue-700", icon: Clock },
  extracting: { label: "Ekstraksi...", color: "bg-amber-50 text-amber-700", icon: RefreshCw },
  extracted: { label: "Terekstrak", color: "bg-amber-50 text-amber-700", icon: FileText },
  generating: { label: "AI bekerja...", color: "bg-amber-50 text-amber-700", icon: Sparkles },
  ready: { label: "Draft siap direview", color: "bg-emerald-50 text-emerald-700", icon: Sparkles },
  approved: { label: "Disetujui", color: "bg-emerald-50 text-emerald-800", icon: CheckCircle2 },
  rejected: { label: "Ditolak", color: "bg-red-50 text-red-700", icon: XCircle },
  failed: { label: "Gagal", color: "bg-red-50 text-red-700", icon: AlertCircle },
};

export default function GuruDraftsPage() {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/v1/guru/drafts", { credentials: "include" });
      if (!res.ok) {
        setDrafts([]);
        setLoading(false);
        return;
      }
      const { data } = await res.json();
      setDrafts(data || []);
      setLoading(false);
    } catch (error) {
      console.error("[guru/drafts] load failed:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      if (drafts.some((d) => ["queued", "extracting", "generating"].includes(d.status))) {
        load();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [drafts]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Draft AI</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Hasil AI yang menunggu review dan approval Anda. Tidak ada yang auto-publish ke siswa.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-glass rounded-2xl p-5 h-20 animate-pulse" />
          ))}
        </div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12 bg-glass rounded-2xl border border-border-precision">
          <Sparkles className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant mb-4">Belum ada draft</p>
          <Link
            href="/guru/upload"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all"
          >
            Upload Dokumen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => {
            const meta = STATUS_META[d.status] || STATUS_META.queued;
            const Icon = meta.icon;
            const isProcessing = ["queued", "extracting", "generating"].includes(d.status);
            return (
              <div
                key={d.id}
                className="bg-glass border border-border-precision rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface truncate">
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
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${meta.color}`}>
                  {meta.label}
                </span>
                {d.status === "ready" && (
                  <Link
                    href={`/guru/drafts/${d.id}`}
                    className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                  >
                    Review →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
