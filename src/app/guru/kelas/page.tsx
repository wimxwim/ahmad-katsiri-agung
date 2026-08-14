"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { Plus, Trash2, Users, Loader2, Edit3, GraduationCap, X, Check, Share2, Copy, AlertCircle } from "lucide-react";
import LinkNext from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { apiFetch } from "@/lib/api-helpers";

interface KelasItem {
  id: string;
  nama: string;
  tingkat: number;
  kursusId: string | null;
  createdAt: string;
}

interface KursusItem {
  id: string;
  judul: string;
}

function clampTingkat(v: number): number {
  if (Number.isNaN(v)) return 1;
  return Math.min(20, Math.max(1, Math.trunc(v)));
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

function KelasContent() {
  const [showForm, setShowForm] = useState(false);
  const [nama, setNama] = useState("");
  const [tingkat, setTingkat] = useState(7);
  const [kursusId, setKursusId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<KelasItem | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editTingkat, setEditTingkat] = useState(7);
  const [editKursusId, setEditKursusId] = useState("");
  const [inviteKode, setInviteKode] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionStatus, setActionStatus] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<string | null>(null);
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
      const saved = localStorage.getItem("akal-draft-kelas");
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.nama === "string") setNama(p.nama);
        if (typeof p.tingkat === "number") setTingkat(clampTingkat(p.tingkat));
        if (typeof p.kursusId === "string") setKursusId(p.kursusId);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("akal-draft-kelas", JSON.stringify({ nama, tingkat, kursusId })); } catch {}
  }, [nama, tingkat, kursusId]);

  const {
    data: itemsData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<KelasItem[]>({
    queryKey: ["guru", "kelas"],
    queryFn: async () => {
      const result = await apiFetch<KelasItem[]>("/api/v1/guru/kelas");
      if (!result.ok) throw Object.assign(new Error(result.error || "Gagal memuat kelas"), { status: result.status, retryAfter: result.retryAfter });
      return result.data ?? [];
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });

  const { data: kursusListData } = useQuery<KursusItem[]>({
    queryKey: ["guru", "kursus-list"],
    queryFn: async () => {
      const result = await apiFetch<KursusItem[]>("/api/v1/guru/kursus");
      if (!result.ok) throw new Error(result.error);
      return result.data ?? [];
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });

  const items = itemsData ?? [];
  const kursusList = kursusListData ?? [];
  const loading = isLoading;
  const queryErr = queryError as unknown as { message: string; status?: number; retryAfter?: string | null } | null;
  const errorStatus = queryErr?.status ?? actionStatus;
  const errorRetryAfter = queryErr?.retryAfter ?? retryAfter;
  const error = queryErr ? queryErr.message : actionError;

  // F11-4 pagination 20 per page + TODO virtual
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);
  useEffect(() => { setPage(1); }, [items.length]);

  async function generateInvite(kelasId: string) {
    const result = await apiFetch<{ kode: string }>(`/api/v1/guru/kelas/${kelasId}/invite`, { method: "POST" });
    if (result.ok && result.data) {
      setInviteKode((prev) => ({ ...prev, [kelasId]: (result.data as { kode: string }).kode }));
    } else {
      setActionError(result.error || "Gagal membuat kode undangan");
      setActionStatus(result.status);
      setRetryAfter(result.retryAfter ?? null);
    }
  }

  async function copyInvite(kelasId: string, kode: string) {
    const link = `${window.location.origin}/masuk?portal=siswa&kode=${kode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(kelasId);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!isOnline) { setActionError("Kamu offline — beberapa fitur tidak tersedia"); setActionStatus(0); return; }
    const clamped = clampTingkat(tingkat);
    setTingkat(clamped);
    if (!nama.trim()) { setActionError("Nama kelas wajib diisi"); return; }
    if (nama.trim().length > 50) { setActionError("Nama kelas maksimal 50 karakter"); return; }
    setSubmitting(true);
    setActionError("");
    setActionStatus(null);
    const body: { nama: string; tingkat: number; kursusId?: string } = { nama: nama.trim(), tingkat: clamped };
    if (kursusId) body.kursusId = kursusId;
    const result = await apiFetch<KelasItem>("/api/v1/guru/kelas", { method: "POST", body: JSON.stringify(body) });
    if (!result.ok) {
      if (result.status === 409) {
        setActionError("Nama kelas sudah ada");
      } else if (result.status === 429) {
        setActionError(`Terlalu banyak permintaan, coba lagi dalam ${result.retryAfter || 30} detik`);
      } else if (result.status === 402) {
        setActionError("Saldo tidak cukup — Topup Rp10.000");
      } else if (result.status === 403) {
        setActionError("Sesi habis, muat ulang halaman");
      } else {
        setActionError(result.error);
      }
      setActionStatus(result.status);
      setRetryAfter(result.retryAfter ?? null);
    } else {
      setNama("");
      setTingkat(7);
      setKursusId("");
      setShowForm(false);
      try { localStorage.removeItem("akal-draft-kelas"); } catch {}
      await refetch();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kelas ini? Siswa di dalamnya tidak akan terhapus, hanya relasi yang diputus.")) return;
    setActionError("");
    setActionStatus(null);
    setDeletingId(id);
    try {
      const result = await apiFetch(`/api/v1/guru/kelas/${id}`, { method: "DELETE" });
      if (!result.ok) {
        if (result.status === 429) setActionError(`Terlalu banyak permintaan, coba lagi dalam ${result.retryAfter || 30} detik`);
        else setActionError(result.error);
        setActionStatus(result.status);
        setRetryAfter(result.retryAfter ?? null);
      } else {
        await refetch();
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpdate(id: string) {
    setActionError("");
    setActionStatus(null);
    setEditError("");
    const clamped = clampTingkat(editTingkat);
    setEditTingkat(clamped);
    if (editNama.trim().length === 0) { setEditError("Nama kelas tidak boleh kosong"); return; }
    if (editNama.trim().length > 50) { setEditError("Nama kelas maksimal 50 karakter"); return; }
    const body: { nama: string; tingkat: number; kursusId: string | null } = { nama: editNama.trim(), tingkat: clamped, kursusId: editKursusId || null };
    const result = await apiFetch<KelasItem>(`/api/v1/guru/kelas/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    if (!result.ok) {
      if (result.status === 409) {
        setEditError("Nama kelas sudah ada");
        setActionError("Nama kelas sudah ada");
      } else if (result.status === 429) {
        setActionError(`Terlalu banyak permintaan, coba lagi dalam ${result.retryAfter || 30} detik`);
      } else {
        setActionError(result.error);
      }
      setActionStatus(result.status);
      setRetryAfter(result.retryAfter ?? null);
    } else {
      setEditing(null);
      await refetch();
    }
  }

  return (
    <div className="isolate">
      <div className="flex items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="font-heading font-bold text-2xl text-on-surface">Kelas</h1>
          <p className="text-sm text-on-surface-variant mt-1">Kelola kelas yang Anda ajar. Satu kelas bisa berisi banyak siswa.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all min-h-11 min-w-11">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Tutup" : "Kelas Baru"}
        </button>
      </div>

      {!isOnline && (
        <div role="status" aria-live="polite" className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> Kamu offline — beberapa fitur tidak tersedia
        </div>
      )}

      {error && errorStatus !== 404 && (
        <div role="alert" aria-live="assertive" className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 mb-2">{error} {errorStatus === 429 && errorRetryAfter && <Countdown seconds={parseInt(errorRetryAfter, 10) || 30} onDone={() => refetch()} />}</p>
          {errorStatus === 402 && <LinkNext href="/guru/topup" className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Topup Rp10.000</LinkNext>}
          {errorStatus === 403 && <p className="text-xs text-red-600">Sesi habis, muat ulang halaman untuk login kembali.</p>}
          <button onClick={() => refetch()} className="mt-2 text-sm font-semibold text-red-700 hover:underline min-h-11 min-w-11 px-3 py-2.5 inline-flex items-center justify-center">Coba lagi</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-5 rounded-[32px] border border-border-precision bg-glass shadow-glass hover:shadow-glass-lg transition-shadow duration-300">
          <h2 className="font-heading font-semibold text-on-surface mb-4">Kelas Baru</h2>
          <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
            <div>
              <label htmlFor="kelas-nama" className="block text-sm font-semibold text-on-surface mb-1.5">Nama kelas</label>
              <input id="kelas-nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="mis. VII-A atau 9B" required minLength={1} maxLength={50} className="w-full min-h-11 px-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10" />
            </div>
            <div>
              <label htmlFor="kelas-tingkat" className="block text-sm font-semibold text-on-surface mb-1.5">Tingkat (1-20)</label>
              <input id="kelas-tingkat" type="number" value={tingkat} onChange={(e) => setTingkat(clampTingkat(Number(e.target.value)))} min={1} max={20} required className="w-full min-h-11 px-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10" />
              <p className="text-xs text-on-surface-variant/60 mt-1">Clamp otomatis 1-20</p>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="kelas-kursus" className="block text-sm font-semibold text-on-surface mb-1.5">Kursus (opsional)</label>
            <select id="kelas-kursus" value={kursusId} onChange={(e) => setKursusId(e.target.value)} className="w-full min-h-11 px-4 py-2.5 rounded-xl border border-border-precision bg-white text-sm outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10">
              <option value="">-- Tanpa kursus --</option>
              {kursusList.map((k) => (<option key={k.id} value={k.id}>{k.judul}</option>))}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={submitting || !isOnline} className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 bg-primary text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Simpan
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="min-h-11 min-w-11 px-4 py-2.5 rounded-full text-sm font-semibold border border-border-precision hover:bg-surface transition-colors inline-flex items-center justify-center">Batal</button>
          </div>
        </form>
      )}

      {loading ? (
        <div aria-busy="true" role="status" aria-label="Memuat daftar kelas"><SkeletonList /></div>
      ) : errorStatus === 404 ? (
        <EmptyState icon={GraduationCap} title="Data tidak ditemukan" description="Belum ada kelas untuk ditampilkan." />
      ) : error && items.length === 0 ? null : items.length === 0 ? (
        <div className="text-center py-12">
          <EmptyState icon={GraduationCap} title="Belum ada kelas" description="Buat kelas pertama untuk mengelola siswa dan materi" />
          <button onClick={() => setShowForm(true)} className="mt-4 inline-flex items-center justify-center gap-2 min-h-11 min-w-11 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all">
            <Plus className="w-4 h-4" /> Buat Kelas Pertama
          </button>
        </div>
      ) : (
        <div className="@container">
          <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
            {pagedItems.map((k) => (
            <motion.div key={k.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }} className="bento-card @container bg-glass border border-border-precision rounded-[32px] p-5 shadow-glass isolate">
              {editing?.id === k.id ? (
                <div>
                  <label htmlFor={`edit-nama-${k.id}`} className="sr-only">Nama kelas</label>
                  <input id={`edit-nama-${k.id}`} value={editNama} onChange={(e) => setEditNama(e.target.value)} className="w-full mb-2 min-h-11 px-3 py-2.5 rounded-lg border border-border-precision text-sm" />
                  <label htmlFor={`edit-tingkat-${k.id}`} className="sr-only">Tingkat</label>
                  <input id={`edit-tingkat-${k.id}`} type="number" value={editTingkat} onChange={(e) => setEditTingkat(clampTingkat(Number(e.target.value)))} min={1} max={20} className="w-full mb-2 min-h-11 px-3 py-2.5 rounded-lg border border-border-precision text-sm" />
                  <label htmlFor={`edit-kursus-${k.id}`} className="sr-only">Kursus</label>
                  <select id={`edit-kursus-${k.id}`} value={editKursusId} onChange={(e) => setEditKursusId(e.target.value)} className="w-full mb-3 min-h-11 px-3 py-2.5 rounded-lg border border-border-precision text-sm">
                    <option value="">-- Tanpa kursus --</option>
                    {kursusList.map((ku) => (<option key={ku.id} value={ku.id}>{ku.judul}</option>))}
                  </select>
                  {editError && <p role="alert" aria-live="assertive" className="text-xs text-red-600 mb-2">{editError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(k.id)} disabled={!isOnline} className="inline-flex items-center justify-center gap-1 min-h-11 min-w-11 px-3 py-2.5 text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50">
                      <Check className="w-3 h-3" /> Simpan
                    </button>
                    <button onClick={() => setEditing(null)} className="min-h-11 min-w-11 px-3 py-2.5 text-xs text-on-surface-variant hover:underline inline-flex items-center justify-center">Batal</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Users className="w-4 h-4" /></span>
                    <div>
                      <p className="font-heading font-semibold text-on-surface">{k.nama}</p>
                      <p className="text-xs text-on-surface-variant">Tingkat {k.tingkat}</p>
                      {k.kursusId && (<p className="text-xs text-on-surface-variant/70">{kursusList.find((ku) => ku.id === k.kursusId)?.judul ?? "Kursus"}</p>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button onClick={() => { setEditing(k); setEditNama(k.nama); setEditTingkat(k.tingkat); setEditKursusId(k.kursusId ?? ""); setEditError(""); }} className="inline-flex items-center justify-center gap-1 min-h-11 min-w-11 px-3 py-2.5 font-semibold text-primary hover:underline"><Edit3 className="w-3 h-3" /> Edit</button>
                    <button onClick={() => generateInvite(k.id)} className="inline-flex items-center justify-center gap-1 min-h-11 min-w-11 px-3 py-2.5 font-semibold text-primary hover:underline"><Share2 className="w-3 h-3" /> Undang</button>
                    <button onClick={() => handleDelete(k.id)} disabled={deletingId === k.id} className="inline-flex items-center justify-center gap-1 min-h-11 min-w-11 px-3 py-2.5 font-semibold text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                      {deletingId === k.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}{deletingId === k.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                  {inviteKode[k.id] && (
                    <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-xs font-semibold text-primary mb-1">Kode Undangan</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-white px-2.5 py-1 rounded-lg text-sm font-bold tracking-wider text-primary border border-primary/10 min-h-11 inline-flex items-center">{inviteKode[k.id]}</code>
                        <button onClick={() => copyInvite(k.id, inviteKode[k.id])} className="inline-flex items-center justify-center gap-1 min-h-11 min-w-11 px-3 py-2.5 text-xs font-semibold text-primary hover:underline">
                          {copied === k.id ? (<><Check className="w-3 h-3" /> Tersalin</>) : (<><Copy className="w-3 h-3" /> Salin Link</>)}
                        </button>
                      </div>
                      <p className="text-xs text-on-surface-variant/60 mt-2">Siswa bisa masuk dengan kode ini di halaman <LinkNext href="/masuk?portal=siswa" className="text-primary hover:underline">Masuk Siswa</LinkNext></p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
            ))}
          </motion.div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Prev</button>
              <span className="text-xs text-on-surface-variant">Halaman {page} / {totalPages} — {items.length} kelas</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Next</button>
            </div>
          )}
          {/* TODO virtual: jika kelas >100 rows, ganti grid dengan @tanstack/react-table + @tanstack/react-virtual (virtualizer) */}
        </div>
      )}
    </div>
  );
}

export default function GuruKelasPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div aria-busy="true" role="status"><SkeletonList /></div>}>
        <KelasContent />
      </Suspense>
    </ErrorBoundary>
  );
}
