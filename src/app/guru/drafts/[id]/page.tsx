"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RefreshCw, XCircle, Loader2, FileText, BookOpen, ClipboardList, Edit3, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface GeneratedSoal {
  pertanyaan: string;
  tipe: "PG" | "ISIAN" | "ESSAY";
  opsi?: Record<string, string>;
  kunci: string;
}

interface DraftDetail {
  id: string;
  sourceFileName: string;
  status: string;
  materiJudul: string | null;
  materiKonten: string | null;
  materiEditedKonten: string | null;
  materiStatus: "not_generated" | "draft" | "approved" | "rejected" | "edited";
  materiApprovedAt: string | null;
  quizJudul: string | null;
  quizSoal: GeneratedSoal[];
  quizEditedSoal: GeneratedSoal[] | null;
  quizStatus: "not_generated" | "draft" | "approved" | "rejected" | "edited";
  quizApprovedAt: string | null;
  soalItems: GeneratedSoal[];
  soalEditedItems: GeneratedSoal[] | null;
  soalStatus: "not_generated" | "draft" | "approved" | "rejected" | "edited";
  soalApprovedAt: string | null;
  publishedAt: string | null;
  tokenInput: number | null;
  tokenOutput: number | null;
  modelName: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

type TabKey = "materi" | "quiz" | "soal";

const STATUS_META: Record<string, { label: string; color: string }> = {
  not_generated: { label: "Belum ada", color: "bg-surface text-on-surface-variant" },
  draft: { label: "Draft", color: "bg-amber-50 text-amber-800" },
  approved: { label: "Disetujui", color: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Ditolak", color: "bg-red-50 text-red-700" },
  edited: { label: "Diubah", color: "bg-blue-50 text-blue-700" },
};

export default function DraftReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [tab, setTab] = useState<TabKey>("materi");
  const [editingMateri, setEditingMateri] = useState(false);
  const [editJudul, setEditJudul] = useState("");
  const [editKonten, setEditKonten] = useState("");

  async function load() {
    const { id } = await params;
    try {
      const res = await fetch(`/api/v1/guru/drafts/${id}`, { credentials: "include" });
      if (!res.ok) {
        setDraft(null);
        setLoading(false);
        return;
      }
      const { data } = await res.json();
      setDraft(data);
      setLoading(false);
    } catch (error) {
      console.error("[guru/drafts/[id]] load failed:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draft) return;
    const interval = setInterval(() => {
      if (["queued", "extracting", "generating"].includes(draft.status)) {
        load();
      }
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  async function act(path: string, label: string) {
    if (!draft) return;
    setBusy(label);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/v1/guru/drafts/${draft.id}${path}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Gagal");
      }
      const json = await res.json();
      if (json.redirectTo) {
        router.push(json.redirectTo);
        return;
      }
      setSuccessMsg(`${label} berhasil`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(null);
    }
  }

  function startEditMateri() {
    if (!draft) return;
    setEditJudul(draft.materiEditedKonten !== null ? (draft.materiJudul || "") : (draft.materiJudul || ""));
    setEditKonten(draft.materiEditedKonten ?? draft.materiKonten ?? "");
    setEditingMateri(true);
  }

  async function saveEditMateri() {
    if (!draft) return;
    setBusy("edit");
    setError("");
    try {
      const res = await fetch(`/api/v1/guru/drafts/${draft.id}/edit-materi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ judul: editJudul, konten: editKonten }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Gagal menyimpan");
      }
      setEditingMateri(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <div className="bg-glass rounded-2xl p-8 h-40 animate-pulse" />;
  }
  if (!draft) {
    return (
      <div className="text-center py-12">
        <p className="text-on-surface-variant">Draft tidak ditemukan.</p>
        <Link href="/guru/drafts" className="text-primary font-semibold hover:underline mt-2 inline-block">
          Kembali ke daftar draft
        </Link>
      </div>
    );
  }

  const isProcessing = ["queued", "extracting", "generating"].includes(draft.status);
  const isReady = draft.status === "ready";
  const allApproved =
    draft.materiStatus === "approved" &&
    draft.quizStatus === "approved" &&
    draft.soalStatus === "approved";
  const canClose = allApproved && isReady;

  const materiKonten = draft.materiEditedKonten ?? draft.materiKonten ?? "";
  const quizSoal = draft.quizEditedSoal ?? draft.quizSoal ?? [];
  const soalItems = draft.soalEditedItems ?? draft.soalItems ?? [];

  return (
    <div>
      <Link
        href="/guru/drafts"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke daftar draft
      </Link>

      <div className="mb-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-bold text-2xl text-on-surface">
            {draft.materiJudul || draft.sourceFileName}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Sumber: <code className="bg-surface px-1.5 py-0.5 rounded text-xs">{draft.sourceFileName}</code>
            {draft.modelName && <span> · Model: <b>{draft.modelName}</b></span>}
            {draft.tokenInput != null && draft.tokenOutput != null && (
              <span> · {draft.tokenInput + draft.tokenOutput} token</span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {isProcessing ? (
        <div className="text-center py-12 bg-glass rounded-2xl border border-border-precision">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-on-surface font-semibold">AI sedang membuat draft...</p>
          <p className="text-sm text-on-surface-variant mt-1">
            Halaman ini akan otomatis memperbarui. Bisa ditutup, draft akan muncul di daftar setelah selesai.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1 mb-4 bg-glass p-1 rounded-2xl border border-border-precision w-fit">
            {(["materi", "quiz", "soal"] as const).map((t) => {
              const statusKey = t === "materi" ? "materiStatus" : t === "quiz" ? "quizStatus" : "soalStatus";
              const status = draft[statusKey] as string;
              const m = STATUS_META[status] || STATUS_META.not_generated;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    tab === t
                      ? "bg-white text-on-surface shadow-glass"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t === "materi" ? <BookOpen className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                  {t === "materi" ? "Materi" : t === "quiz" ? "Kuis" : "Soal"}
                  <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full ${m.color}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {tab === "materi" && (
            <div className="bg-glass border border-border-precision rounded-2xl p-6 shadow-glass">
              {draft.materiStatus === "not_generated" ? (
                <p className="text-sm text-on-surface-variant">
                  Materi tidak dihasilkan untuk draft ini.
                </p>
              ) : editingMateri ? (
                <div className="space-y-3">
                  <label className="block text-[13px] font-semibold text-on-surface">Judul</label>
                  <input
                    value={editJudul}
                    onChange={(e) => setEditJudul(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border-precision text-sm"
                  />
                  <label className="block text-[13px] font-semibold text-on-surface">Konten</label>
                  <textarea
                    value={editKonten}
                    onChange={(e) => setEditKonten(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 rounded-lg border border-border-precision text-sm font-mono"
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={saveEditMateri}
                      disabled={busy === "edit"}
                      className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold disabled:opacity-50"
                    >
                      <Save className="w-3 h-3" /> Simpan Edit
                    </button>
                    <button
                      onClick={() => setEditingMateri(false)}
                      className="text-xs text-on-surface-variant hover:text-on-surface"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {draft.materiJudul && (
                    <h2 className="font-heading text-lg font-bold text-on-surface mb-3">
                      {draft.materiJudul}
                    </h2>
                  )}
                  <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                    {materiKonten || "Belum ada materi."}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border-precision/40 flex flex-wrap gap-2">
                    <button
                      onClick={startEditMateri}
                      className="inline-flex items-center gap-1.5 bg-white text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-primary/5"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => act("/approve-materi", "approve-materi")}
                      disabled={busy === "approve-materi" || draft.materiStatus === "approved"}
                      className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:brightness-110 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve Materi
                    </button>
                    <button
                      onClick={() => act("/reject-materi", "reject-materi")}
                      disabled={busy === "reject-materi"}
                      className="inline-flex items-center gap-1.5 bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-red-50"
                    >
                      <XCircle className="w-3 h-3" /> Tolak
                    </button>
                    <button
                      onClick={() => act("/regenerate-materi", "regen-materi")}
                      disabled={busy === "regen-materi"}
                      className="inline-flex items-center gap-1.5 bg-white text-on-surface border border-border-precision px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-surface"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "quiz" && (
            <div className="bg-glass border border-border-precision rounded-2xl p-6 shadow-glass">
              {draft.quizStatus === "not_generated" ? (
                <p className="text-sm text-on-surface-variant">Quiz tidak dihasilkan untuk draft ini.</p>
              ) : (
                <>
                  {draft.quizJudul && (
                    <h2 className="font-heading text-lg font-bold text-on-surface mb-3">
                      {draft.quizJudul}
                    </h2>
                  )}
                  <ol className="text-sm text-on-surface-variant space-y-3 list-decimal pl-4">
                    {quizSoal.map((s, i) => (
                      <li key={i}>
                        <p className="font-medium text-on-surface">{s.pertanyaan}</p>
                        {s.opsi && (
                          <ul className="text-xs mt-1 space-y-0.5 list-none pl-0">
                            {Object.entries(s.opsi).map(([k, v]) => (
                              <li key={k} className={s.kunci === k ? "font-semibold text-emerald-700" : ""}>
                                {k}. {v} {s.kunci === k && "✓"}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 pt-4 border-t border-border-precision/40 flex flex-wrap gap-2">
                    <button
                      onClick={() => act("/approve-quiz", "approve-quiz")}
                      disabled={busy === "approve-quiz" || draft.quizStatus === "approved"}
                      className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:brightness-110 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve Quiz
                    </button>
                    <button
                      onClick={() => act("/reject-quiz", "reject-quiz")}
                      disabled={busy === "reject-quiz"}
                      className="inline-flex items-center gap-1.5 bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-red-50"
                    >
                      <XCircle className="w-3 h-3" /> Tolak
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "soal" && (
            <div className="bg-glass border border-border-precision rounded-2xl p-6 shadow-glass">
              {draft.soalStatus === "not_generated" ? (
                <p className="text-sm text-on-surface-variant">Soal tidak dihasilkan untuk draft ini.</p>
              ) : (
                <>
                  <ol className="text-sm text-on-surface-variant space-y-3 list-decimal pl-4">
                    {soalItems.map((s, i) => (
                      <li key={i}>
                        <p className="font-medium text-on-surface">{s.pertanyaan}</p>
                        {s.opsi && (
                          <ul className="text-xs mt-1 space-y-0.5 list-none pl-0">
                            {Object.entries(s.opsi).map(([k, v]) => (
                              <li key={k} className={s.kunci === k ? "font-semibold text-emerald-700" : ""}>
                                {k}. {v} {s.kunci === k && "✓"}
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="text-[10px] uppercase tracking-wider text-tertiary mt-0.5">
                          {s.tipe} · kunci: {s.kunci}
                        </p>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 pt-4 border-t border-border-precision/40 flex flex-wrap gap-2">
                    <button
                      onClick={() => act("/approve-soal", "approve-soal")}
                      disabled={busy === "approve-soal" || draft.soalStatus === "approved"}
                      className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:brightness-110 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve Soal
                    </button>
                    <button
                      onClick={() => act("/reject-soal", "reject-soal")}
                      disabled={busy === "reject-soal"}
                      className="inline-flex items-center gap-1.5 bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-red-50"
                    >
                      <XCircle className="w-3 h-3" /> Tolak
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-6 p-4 rounded-2xl border border-border-precision bg-white/60">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm text-on-surface-variant">
                Status approval:{" "}
                <b className="text-on-surface">Materi {STATUS_META[draft.materiStatus]?.label}</b>,{" "}
                <b className="text-on-surface">Kuis {STATUS_META[draft.quizStatus]?.label}</b>,{" "}
                <b className="text-on-surface">Soal {STATUS_META[draft.soalStatus]?.label}</b>
              </div>
              <button
                onClick={() => act("/close-review", "close-review")}
                disabled={!canClose || busy === "close-review"}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {busy === "close-review" ? "Menyimpan..." : "Tutup Review & Teruskan"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
