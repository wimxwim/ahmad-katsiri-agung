"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RefreshCw, XCircle, Loader2, FileText, BookOpen, ClipboardList, Edit3, Save, Check, ListChecks, Zap, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { csrfHeaders } from "@/lib/csrf";

interface GeneratedSoal {
  pertanyaan: string;
  tipe: "PG" | "ISIAN" | "ESSAY";
  opsi?: Record<string, string>;
  kunci: string;
}

interface StructuredMateri {
  ringkasan?: string;
  pendahuluan?: string;
  konten?: { judul: string; isi: string }[];
  poinPenting?: string[];
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

function parseStructuredMateri(raw: string): StructuredMateri | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && (parsed.konten || parsed.pendahuluan || parsed.poinPenting)) {
      return parsed as StructuredMateri;
    }
  } catch {
    // not JSON — old format flat text
  }
  return null;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  not_generated: { label: "Belum ada", color: "bg-surface text-on-surface-variant" },
  draft: { label: "Draft", color: "bg-amber-50 text-amber-800" },
  approved: { label: "Disetujui", color: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Ditolak", color: "bg-red-50 text-red-700" },
  edited: { label: "Diubah", color: "bg-blue-50 text-blue-700" },
};

export default function DraftReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [draft, setDraft] = useState<DraftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const loadRef = useRef<() => Promise<void>>(async () => {});
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

  loadRef.current = load;

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draft) return;
    const interval = setInterval(() => {
      if (["queued", "extracting", "generating"].includes(draft.status)) {
        loadRef.current();
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
        headers: csrfHeaders(),
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Gagal");
      }
      const json = await res.json();
      if (json.redirectTo) {
        toast("success", "Review selesai. Kursus sudah diterbitkan.");
        router.push(json.redirectTo);
        return;
      }
      toast("success", `${label} berhasil`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal");
      toast("error", e instanceof Error ? e.message : "Gagal");
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
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
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
  const structuredMateri = parseStructuredMateri(materiKonten);
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
            {(draft.materiStatus === "draft" || draft.quizStatus === "draft" || draft.soalStatus === "draft") && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                AI-Generated · Perlu Review
              </span>
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

      {draft.status === "extracted" && (
        <div className="mb-6 p-5 bg-glass rounded-2xl border border-border-precision">
          <h3 className="font-heading font-bold text-lg text-on-surface mb-3">Generate AI</h3>
          <p className="text-sm text-on-surface-variant mb-4">
            Pilih jumlah soal yang ingin digenerate. AI akan membuat materi, kuis, dan soal sekaligus.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant">PG</span>
              <input
                type="number"
                min={5}
                max={35}
                defaultValue={15}
                className="px-3 py-2 rounded-xl border border-border-precision bg-white text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant">Isian</span>
              <input
                type="number"
                min={0}
                max={15}
                defaultValue={5}
                className="px-3 py-2 rounded-xl border border-border-precision bg-white text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant">Essay</span>
              <input
                type="number"
                min={0}
                max={15}
                defaultValue={5}
                className="px-3 py-2 rounded-xl border border-border-precision bg-white text-sm"
              />
            </label>
          </div>
          <button
            onClick={() => act("/generate", "generate-all")}
            disabled={busy === "generate-all"}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] disabled:opacity-50 w-full justify-center"
          >
            {busy === "generate-all" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menghasilkan AI...</>
            ) : (
              <><Zap className="w-4 h-4" /> Generate Semua (Materi + Kuis + Soal)</>
            )}
          </button>
        </div>
      )}

      {allApproved && isReady && (
        <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-800">Semua sudah disetujui!</span>
          </div>
          <button
            onClick={() => act("/close-review", "close-review")}
            disabled={busy === "close-review"}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {busy === "close-review" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menerbitkan...</>
            ) : (
              <><Rocket className="w-4 h-4" /> Terbitkan ke Siswa</>
            )}
          </button>
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
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors active:scale-[0.98] ${
                    tab === t
                      ? "bg-white text-on-surface shadow-glass"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t === "materi" ? <BookOpen className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                  {t === "materi" ? "Materi" : t === "quiz" ? "Kuis" : "Soal"}
                  <span className={`text-xs font-bold tracking-wider px-1.5 py-0.5 rounded-full ${m.color}`}>
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
                  <label className="block text-sm font-semibold text-on-surface">Judul</label>
                  <input
                    value={editJudul}
                    onChange={(e) => setEditJudul(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border-precision text-sm"
                  />
                  <label className="block text-sm font-semibold text-on-surface">Konten</label>
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
                      className="text-xs text-on-surface-variant hover:text-on-surface active:scale-[0.98]"
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
                  {structuredMateri ? (
                    <div className="space-y-4">
                      {structuredMateri.ringkasan && (
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Ringkasan</p>
                          <p className="text-sm text-on-surface leading-relaxed">{structuredMateri.ringkasan}</p>
                        </div>
                      )}
                      {structuredMateri.pendahuluan && (
                        <div>
                          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Pendahuluan</p>
                          <p className="text-sm text-on-surface-variant leading-relaxed">{structuredMateri.pendahuluan}</p>
                        </div>
                      )}
                      {structuredMateri.konten?.map((section, i) => (
                        <div key={i}>
                          <h3 className="text-sm font-bold text-on-surface mb-1">{section.judul}</h3>
                          <p className="text-sm text-on-surface-variant leading-relaxed">{section.isi}</p>
                        </div>
                      ))}
                      {structuredMateri.poinPenting && structuredMateri.poinPenting.length > 0 && (
                        <div className="p-3 rounded-xl bg-tertiary/5 border border-tertiary/10">
                          <p className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ListChecks className="w-3.5 h-3.5" /> Poin Penting
                          </p>
                          <ul className="space-y-1">
                            {structuredMateri.poinPenting.map((poin, i) => (
                              <li key={i} className="text-sm text-on-surface-variant flex items-start gap-2">
                                <span className="text-tertiary font-bold shrink-0">{i + 1}.</span>
                                <span>{poin}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                      {materiKonten || "Belum ada materi."}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-border-precision/40 flex flex-wrap gap-2">
                    <button
                      onClick={startEditMateri}
                      className="inline-flex items-center gap-1.5 bg-white text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-primary/5 active:scale-[0.98]"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => act("/approve-materi", "approve-materi")}
                      disabled={busy === "approve-materi" || draft.materiStatus === "approved"}
                      className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve Materi
                    </button>
                    <button
                      onClick={() => act("/reject-materi", "reject-materi")}
                      disabled={busy === "reject-materi"}
                      className="inline-flex items-center gap-1.5 bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-red-50 active:scale-[0.98]"
                    >
                      <XCircle className="w-3 h-3" /> Tolak
                    </button>
                    <button
                      onClick={() => act("/regenerate-materi", "regen-materi")}
                      disabled={busy === "regen-materi"}
                      className="inline-flex items-center gap-1.5 bg-white text-on-surface border border-border-precision px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-surface active:scale-[0.98]"
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
                                {k}. {v} {s.kunci === k && <Check className="w-3 h-3 inline shrink-0" />}
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
                      className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve Quiz
                    </button>
                    <button
                      onClick={() => act("/reject-quiz", "reject-quiz")}
                      disabled={busy === "reject-quiz"}
                      className="inline-flex items-center gap-1.5 bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-red-50 active:scale-[0.98]"
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
                                {k}. {v} {s.kunci === k && <Check className="w-3 h-3 inline shrink-0" />}
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className="text-xs uppercase tracking-wider text-tertiary mt-0.5">
                          {s.tipe} · kunci: {s.kunci}
                        </p>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 pt-4 border-t border-border-precision/40 flex flex-wrap gap-2">
                    <button
                      onClick={() => act("/approve-soal", "approve-soal")}
                      disabled={busy === "approve-soal" || draft.soalStatus === "approved"}
                      className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve Soal
                    </button>
                    <button
                      onClick={() => act("/reject-soal", "reject-soal")}
                      disabled={busy === "reject-soal"}
                      className="inline-flex items-center gap-1.5 bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-red-50 active:scale-[0.98]"
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
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
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
