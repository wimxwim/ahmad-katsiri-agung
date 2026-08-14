"use client";

// TODO F4-3: migrasi ke useQuery + Table v8 virtual - contoh sudah di kelas/diskusi, kursus masih fetch manual sebagai contoh bertahap
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { EASE_CURVE } from "@/lib/constants";
import { Search, Plus, BookOpen, Globe, Lock, Loader2, Share2, Copy, Check, Pencil, Trash2, Users, Archive, MoreHorizontal, AlertCircle, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/SkeletonBlocks";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { csrfHeaders } from "@/lib/csrf";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

const STATUS_MAP = {
  DRAFT: { label: "Draft", color: "amber" },
  PUBLIK: { label: "Publik", color: "emerald" },
  PRIVAT: { label: "Privat", color: "blue" },
  KRABAT: { label: "Krabat", color: "purple" },
  ARSIP: { label: "Arsip", color: "gray" },
} as const;

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-amber-50 text-amber-700" },
  PUBLIK: { label: "Publik", color: "bg-emerald-50 text-emerald-700" },
  PRIVAT: { label: "Privat", color: "bg-blue-50 text-blue-700" },
  KRABAT: { label: "Krabat", color: "bg-purple-50 text-purple-700" },
  ARSIP: { label: "Arsip", color: "bg-surface text-on-surface-variant" },
};

const STATUS_BAR_COLOR: Record<string, string> = {
  amber: "bg-amber-200",
  emerald: "bg-emerald-300",
  blue: "bg-blue-300",
  purple: "bg-purple-300",
  gray: "bg-zinc-300",
};

interface KursusItem {
  id: string;
  judul: string;
  slug: string;
  deskripsi: string | null;
  statusPublikasi: string;
  createdAt: string;
  enrolledCount?: number | null;
  totalSiswa?: number | null;
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

function KursusContent() {
  const [kursus, setKursus] = useState<KursusItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [inviting, setInviting] = useState<string | null>(null);
  const [inviteLinks, setInviteLinks] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editJudul, setEditJudul] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");
  const [editError, setEditError] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // F11-2 Offline guard + localStorage autosave (search)
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
      const saved = localStorage.getItem("akal-draft-kursus-search");
      if (saved) setSearch(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("akal-draft-kursus-search", search); } catch {}
  }, [search]);

  async function handleInvite(id: string) {
    if (!isOnline) { setError("Kamu offline — beberapa fitur tidak tersedia"); setErrorStatus(0); return; }
    setInviting(id);
    setError("");
    setErrorStatus(null);
    setOpenMenu(null);
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`/api/v1/kursus/${id}/invite`, {
        method: "POST",
        headers: { ...csrfHeaders() },
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (res.status === 429) throw Object.assign(new Error(`Terlalu banyak permintaan, coba lagi dalam ${res.headers.get("Retry-After") || 30} detik`), { status: 429, retryAfter: res.headers.get("Retry-After") });
        if (res.status === 402) throw Object.assign(new Error("Saldo tidak cukup — Topup Rp10.000"), { status: 402 });
        if (res.status === 403) throw Object.assign(new Error("Sesi habis, muat ulang halaman"), { status: 403 });
        throw new Error(j.error || "Gagal membuat link undangan");
      }
      const { data } = await res.json();
      setInviteLinks((prev) => ({ ...prev, [id]: data.inviteLink }));
    } catch (err) {
      const e = err as unknown as { message: string; status?: number; retryAfter?: string };
      setError(e.message || "Gagal membuat link undangan");
      setErrorStatus(e.status ?? null);
      setRetryAfter(e.retryAfter ?? null);
    } finally {
      setInviting(null);
    }
  }

  async function handleDelete(id: string) {
    if (!isOnline) { setError("Kamu offline — beberapa fitur tidak tersedia"); return; }
    setDeleting(id);
    setError("");
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`/api/v1/kursus/${id}`, {
        method: "DELETE",
        headers: { ...csrfHeaders() },
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (res.status === 429) throw new Error(`Terlalu banyak permintaan, coba lagi dalam ${res.headers.get("Retry-After") || 30} detik`);
        if (res.status === 402) throw new Error("Saldo tidak cukup — Topup Rp10.000");
        if (res.status === 403) throw new Error("Sesi habis, muat ulang halaman");
        throw new Error(j.error || "Gagal menghapus kursus");
      }
      setKursus((prev) => prev.filter((k) => k.id !== id));
      setConfirmDelete(null);
      if (deleteTriggerRef.current) deleteTriggerRef.current.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus kursus");
      if (err instanceof Error && err.message.includes("Terlalu banyak")) setErrorStatus(429);
      else if (err instanceof Error && err.message.includes("Saldo")) setErrorStatus(402);
      else if (err instanceof Error && err.message.includes("Sesi habis")) setErrorStatus(403);
    } finally {
      setDeleting(null);
    }
  }

  async function handleEdit(id: string) {
    setEditing((prev) => (prev === id ? null : id));
    const k = kursus.find((c) => c.id === id);
    if (k) {
      setEditJudul(k.judul === "[object Object]" ? "" : String(k.judul ?? ""));
      setEditDeskripsi(k.deskripsi || "");
      setEditError("");
    }
    setOpenMenu(null);
  }

  async function handleSaveEdit(id: string) {
    if (!isOnline) { setEditError("Kamu offline — beberapa fitur tidak tersedia"); return; }
    if (!editJudul.trim()) { setEditError("Judul wajib diisi"); return; }
    if (editJudul.trim().length > 200) { setEditError("Judul maksimal 200 karakter"); return; }
    setError("");
    setEditError("");
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`/api/v1/kursus/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify({ judul: editJudul.trim(), deskripsi: editDeskripsi.trim() }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setEditError("Slug sudah dipakai, ganti judul");
          return;
        }
        if (res.status === 429) throw Object.assign(new Error(`Terlalu banyak permintaan, coba lagi dalam ${res.headers.get("Retry-After") || 30} detik`), { status: 429 });
        if (res.status === 402) throw new Error("Saldo tidak cukup — Topup Rp10.000");
        if (res.status === 403) throw new Error("Sesi habis, muat ulang halaman");
        throw new Error(j.error || "Gagal mengedit kursus");
      }
      const { data } = await res.json();
      setKursus((prev) => prev.map((k) => (k.id === id ? { ...k, judul: data.judul, deskripsi: data.deskripsi } : k)));
      setEditing(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengedit kursus";
      setEditError(msg);
      setError(msg);
      if (msg.includes("Terlalu banyak")) setErrorStatus(429);
    }
  }

  async function copyInviteLink(kursusId: string, link: string) {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const el = document.createElement("textarea");
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(kursusId);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handlePublish(id: string, newStatus: "PUBLIK" | "DRAFT" | "ARSIP" | "PRIVAT" | "KRABAT") {
    if (!isOnline) { setError("Kamu offline — beberapa fitur tidak tersedia"); setErrorStatus(0); return; }
    setPublishing(id);
    setError("");
    setErrorStatus(null);
    setOpenMenu(null);
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`/api/v1/kursus/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (res.status === 429) throw Object.assign(new Error(`Terlalu banyak permintaan, coba lagi dalam ${res.headers.get("Retry-After") || 30} detik`), { status: 429, retryAfter: res.headers.get("Retry-After") });
        if (res.status === 402) throw Object.assign(new Error("Saldo tidak cukup — Topup Rp10.000"), { status: 402 });
        if (res.status === 403) throw Object.assign(new Error("Sesi habis, muat ulang halaman"), { status: 403 });
        throw new Error(j.error || "Gagal mengubah status");
      }
      const { data } = await res.json();
      setKursus((prev) => prev.map((k) => (k.id === id ? { ...k, statusPublikasi: data.statusPublikasi } : k)));
    } catch (err) {
      const e = err as unknown as { message: string; status?: number; retryAfter?: string };
      setError(e.message || "Gagal mengubah status");
      setErrorStatus(e.status ?? null);
      setRetryAfter(e.retryAfter ?? null);
    } finally {
      setPublishing(null);
    }
  }

  async function fetchData() {
    try {
      setError("");
      setErrorStatus(null);
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setError("Kamu offline — beberapa fitur tidak tersedia");
        setErrorStatus(0);
        setLoading(false);
        return;
      }
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 15000);
      const res = await fetch("/api/v1/kursus", { credentials: "include", signal: controller.signal });
      clearTimeout(t);
      if (!res.ok) {
        if (res.status === 404) {
          setErrorStatus(404);
          setKursus([]);
          return;
        }
        if (res.status === 429) {
          setErrorStatus(429);
          setRetryAfter(res.headers.get("Retry-After"));
          setError(`Terlalu banyak permintaan, coba lagi dalam ${res.headers.get("Retry-After") || 30} detik`);
          return;
        }
        if (res.status === 402) { setErrorStatus(402); setError("Saldo tidak cukup — Topup Rp10.000"); return; }
        if (res.status === 403) { setErrorStatus(403); setError("Sesi habis, muat ulang halaman"); return; }
        throw new Error("Gagal memuat kursus");
      }
      const { data } = await res.json();
      setKursus(data || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timeout (15 detik) — periksa koneksi lalu coba lagi");
        setErrorStatus(0);
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat kursus");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (confirmDelete && cancelRef.current) {
      cancelRef.current.focus();
    }
  }, [confirmDelete]);

  useEffect(() => {
    if (!confirmDelete) return;
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setConfirmDelete(null);
        if (deleteTriggerRef.current) deleteTriggerRef.current.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = dialogEl!.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmDelete]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-overflow-menu]")) {
        setOpenMenu(null);
      }
    }
    if (openMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenu]);

  const filtered = useMemo(() => kursus.filter(
    (k) =>
      k.judul.toLowerCase().includes(search.toLowerCase()) ||
      (k.deskripsi || "").toLowerCase().includes(search.toLowerCase())
  ), [kursus, search]);

  // F11-4 pagination 20 per page + TODO virtual
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedFiltered = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);
  useEffect(() => { setPage(1); }, [search]);

  if (loading) {
    return (
      <div aria-busy="true" role="status" aria-label="Memuat kursus">
        <SkeletonList />
      </div>
    );
  }

  if (errorStatus === 404) {
    return <EmptyState icon={BookOpen} title="Data tidak ditemukan" description="Belum ada kursus untuk ditampilkan." action={{ label: "Buat Kursus", href: "/guru/buat" }} />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p role="alert" aria-live="assertive" className="text-red-600 mb-2">{error} {errorStatus === 429 && retryAfter && <Countdown seconds={parseInt(retryAfter, 10) || 30} onDone={() => fetchData()} />}</p>
        {errorStatus === 402 && <Link href="/guru/topup" className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 mb-3">Topup Rp10.000</Link>}
        {errorStatus === 403 && <p className="text-xs text-on-surface-variant mb-3">Sesi habis, muat ulang halaman untuk login kembali.</p>}
        <button
          onClick={() => { setError(""); setErrorStatus(null); setLoading(true); fetchData(); }}
          className="text-sm text-primary hover:underline min-h-11 min-w-11 px-4 py-2.5 inline-flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Coba lagi
        </button>
      </div>
    );
  }

  const totalKursus = kursus.length;
  const statusCounts = Object.keys(STATUS_MAP).reduce((acc, key) => {
    acc[key] = kursus.filter((k) => k.statusPublikasi === key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="isolate">
      <Breadcrumb items={[{ label: "Ringkasan", href: "/guru/beranda" }, { label: "Kursus" }]} />
      <div className="flex items-center justify-between mb-6 gap-2">
        <h1 className="font-heading font-bold text-2xl text-on-surface">Kursus Saya</h1>
        <Link
          href="/guru/buat"
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:brightness-110 transition-all min-h-11 min-w-11"
        >
          <Plus className="w-4 h-4" />
          Kursus Baru
        </Link>
      </div>

      {!isOnline && (
        <div role="status" aria-live="polite" className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> Kamu offline — beberapa fitur tidak tersedia
        </div>
      )}

      <div className="relative mb-6">
        <label htmlFor="cari-kursus" className="sr-only">Cari kursus</label>
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" aria-hidden="true" />
        <input
          id="cari-kursus"
          aria-label="Cari kursus"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kursus..."
          className="w-full pl-10 pr-4 py-2.5 min-h-11 rounded-xl bg-white border border-border-precision text-on-surface placeholder:text-on-surface-variant/70 focus:outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm"
        />
      </div>

      {totalKursus > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            {Object.entries(STATUS_MAP).map(([key, v]) => {
              const count = statusCounts[key] || 0;
              const pct = totalKursus > 0 ? (count / totalKursus) * 100 : 0;
              if (count === 0) return null;
              return (
                <div
                  key={key}
                  className={`h-2 rounded-full ${STATUS_BAR_COLOR[v.color] || "bg-zinc-200"}`}
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${v.label}: ${count}`}
                  title={`${v.label}: ${count}`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_MAP).map(([key, v]) => {
              const count = statusCounts[key] || 0;
              return (
                <span key={key} className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium border ${count > 0 ? "bg-white border-border-precision text-on-surface" : "bg-surface border-border-precision/50 text-on-surface-variant/60"}`}>
                  <span className={`w-2 h-2 rounded-full ${STATUS_BAR_COLOR[v.color] || "bg-zinc-200"}`} aria-hidden="true" />
                  {v.label}: {count}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        kursus.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada kursus"
            description="Buat kursus pertama untuk mulai mengatur kelas dan materi."
            action={{ label: "Buat Kursus", href: "/guru/buat" }}
            secondaryAction={{ label: "Lihat panduan kursus", href: "/panduan-ai" }}
          />
        ) : (
          <div className="text-center py-12 bg-glass rounded-[32px] border border-border-precision hover:shadow-glass-lg transition-shadow duration-300">
            <BookOpen className="w-10 h-10 text-on-surface-variant/30 mx-auto mb-3" aria-hidden="true" />
            <p className="text-on-surface-variant mb-4">Tidak ada kursus yang cocok</p>
          </div>
        )
      ) : (
        <div className="@container">
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
            {pagedFiltered.map((k) => (
              <motion.div
                key={k.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CURVE } } }}
                className="bento-card @container bg-glass border border-border-precision rounded-[32px] sm:rounded-[32px] p-6 shadow-glass hover:shadow-glass-lg transition-shadow duration-300 isolate"
              >
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="w-full h-1 bg-primary rounded-full flex-1 mr-3 mt-2" aria-hidden="true" />
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold tracking-wider ${STATUS_BADGE[k.statusPublikasi]?.color || STATUS_BADGE.DRAFT.color}`}>
                  {STATUS_BADGE[k.statusPublikasi]?.label || STATUS_MAP[k.statusPublikasi as keyof typeof STATUS_MAP]?.label || "Draft"}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-on-surface mb-1.5">{typeof k.judul === 'string' && k.judul !== '[object Object]' ? k.judul : 'Kursus'}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">
                {k.deskripsi || "Tanpa deskripsi"}
              </p>
              {k.enrolledCount != null && k.enrolledCount > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-on-surface-variant">Peserta</span>
                    <span className="text-xs font-semibold text-on-surface">{k.enrolledCount} siswa</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (k.enrolledCount / Math.max(k.enrolledCount, 10)) * 100)}%` }} role="progressbar" aria-valuenow={k.enrolledCount} aria-valuemin={0} aria-valuemax={100} />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/guru/kursus/${k.id}`}
                  className="inline-flex items-center justify-center min-h-11 min-w-11 px-4 py-2.5 rounded-full text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors gap-1"
                >
                  Detail
                </Link>
                {k.statusPublikasi === "DRAFT" && (
                  <button
                    onClick={() => handlePublish(k.id, "PUBLIK")}
                    disabled={publishing === k.id || !isOnline}
                    className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-4 py-2.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                  >
                    {publishing === k.id ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> : <Globe className="w-3 h-3" aria-hidden="true" />}
                    Publikasikan
                  </button>
                )}
                {k.statusPublikasi === "PUBLIK" && (
                  <button
                    onClick={() => handlePublish(k.id, "PRIVAT")}
                    disabled={publishing === k.id || !isOnline}
                    className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-4 py-2.5 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                  >
                    {publishing === k.id ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> : <Lock className="w-3 h-3" aria-hidden="true" />}
                    Privatkan
                  </button>
                )}
                {k.statusPublikasi === "PRIVAT" && (
                  <button
                    onClick={() => handlePublish(k.id, "PUBLIK")}
                    disabled={publishing === k.id || !isOnline}
                    className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-4 py-2.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                  >
                    {publishing === k.id ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> : <Globe className="w-3 h-3" aria-hidden="true" />}
                    Publikasikan
                  </button>
                )}
                {k.statusPublikasi === "KRABAT" && (
                  <button
                    onClick={() => handlePublish(k.id, "PRIVAT")}
                    disabled={publishing === k.id || !isOnline}
                    className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-4 py-2.5 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                  >
                    {publishing === k.id ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> : <Lock className="w-3 h-3" aria-hidden="true" />}
                    Privatkan
                  </button>
                )}
                {k.statusPublikasi === "ARSIP" && (
                  <button
                    onClick={() => handlePublish(k.id, "PUBLIK")}
                    disabled={publishing === k.id || !isOnline}
                    className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-4 py-2.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                  >
                    {publishing === k.id ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> : <Globe className="w-3 h-3" aria-hidden="true" />}
                    Publikasikan
                  </button>
                )}
                <div className="relative ml-auto" data-overflow-menu>
                  <button
                    type="button"
                    aria-label="Menu lainnya"
                    aria-haspopup="menu"
                    aria-expanded={openMenu === k.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === k.id ? null : k.id);
                    }}
                    className="inline-flex items-center justify-center min-h-11 min-w-11 px-3 py-2.5 rounded-full bg-white border border-border-precision text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                  </button>
                  {openMenu === k.id && (
                    <div
                      role="menu"
                      aria-label="Aksi kursus"
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-border-precision rounded-xl shadow-lg py-1 z-10 overflow-hidden"
                    >
                      <Link
                        href={`/guru/kursus/${k.id}/nilai`}
                        role="menuitem"
                        onClick={() => setOpenMenu(null)}
                        className="flex items-center gap-2 px-4 py-2.5 min-h-11 text-sm text-on-surface hover:bg-surface transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
                        Nilai
                      </Link>
                      <button
                        role="menuitem"
                        onClick={() => handleInvite(k.id)}
                        disabled={inviting === k.id || !isOnline}
                        className="w-full flex items-center gap-2 px-4 py-2.5 min-h-11 text-sm text-on-surface hover:bg-surface transition-colors disabled:opacity-50 text-left"
                      >
                        {inviting === k.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Share2 className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />}
                        Undang
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => handleEdit(k.id)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 min-h-11 text-sm text-on-surface hover:bg-surface transition-colors text-left"
                      >
                        <Pencil className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
                        Edit
                      </button>
                      {(k.statusPublikasi === "PUBLIK" || k.statusPublikasi === "PRIVAT") && (
                        <button
                          role="menuitem"
                          onClick={() => handlePublish(k.id, "KRABAT")}
                          disabled={publishing === k.id || !isOnline}
                          className="w-full flex items-center gap-2 px-4 py-2.5 min-h-11 text-sm text-on-surface hover:bg-surface transition-colors disabled:opacity-50 text-left"
                        >
                          <Users className="w-4 h-4 text-purple-600" aria-hidden="true" />
                          Krabat
                        </button>
                      )}
                      {k.statusPublikasi !== "ARSIP" ? (
                        <button
                          role="menuitem"
                          onClick={() => handlePublish(k.id, "ARSIP")}
                          disabled={publishing === k.id || !isOnline}
                          className="w-full flex items-center gap-2 px-4 py-2.5 min-h-11 text-sm text-on-surface hover:bg-surface transition-colors disabled:opacity-50 text-left"
                        >
                          <Archive className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
                          Arsip
                        </button>
                      ) : (
                        <button
                          role="menuitem"
                          onClick={() => handlePublish(k.id, "DRAFT")}
                          disabled={publishing === k.id || !isOnline}
                          className="w-full flex items-center gap-2 px-4 py-2.5 min-h-11 text-sm text-on-surface hover:bg-surface transition-colors disabled:opacity-50 text-left"
                        >
                          <Archive className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
                          Draftkan
                        </button>
                      )}
                      <button
                        role="menuitem"
                        onClick={(e) => {
                          deleteTriggerRef.current = e.currentTarget;
                          setConfirmDelete(k.id);
                          setOpenMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 min-h-11 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {editing === k.id && (
                <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-2">
                  <label htmlFor={`edit-judul-${k.id}`} className="sr-only">Judul kursus</label>
                  <input
                    id={`edit-judul-${k.id}`}
                    value={editJudul}
                    onChange={(e) => setEditJudul(e.target.value)}
                    placeholder="Judul kursus"
                    aria-invalid={!!editError}
                    aria-describedby={editError ? `err-edit-${k.id}` : undefined}
                    className="w-full min-h-11 px-3 py-2.5 rounded-lg bg-white border border-border-precision text-sm focus:outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 aria-[invalid=true]:border-red-300"
                  />
                  {editError && <p id={`err-edit-${k.id}`} role="alert" className="text-xs text-red-600">{editError}</p>}
                  <label htmlFor={`edit-deskripsi-${k.id}`} className="sr-only">Deskripsi kursus</label>
                  <textarea
                    id={`edit-deskripsi-${k.id}`}
                    value={editDeskripsi}
                    onChange={(e) => setEditDeskripsi(e.target.value)}
                    placeholder="Deskripsi"
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-border-precision text-sm focus:outline-hidden focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none min-h-11"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(k.id)}
                      disabled={!isOnline}
                      className="min-h-11 min-w-11 px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg hover:brightness-110 inline-flex items-center justify-center disabled:opacity-50"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="min-h-11 min-w-11 px-4 py-2.5 bg-white border border-border-precision text-xs font-semibold rounded-lg hover:bg-surface inline-flex items-center justify-center"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
              {inviteLinks[k.id] && (
                <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs font-semibold text-primary mb-1">Link Undangan</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-primary border border-primary/10 truncate max-w-[200px] min-h-11 inline-flex items-center">
                      {inviteLinks[k.id]}
                    </code>
                    <button
                      onClick={() => copyInviteLink(k.id, inviteLinks[k.id])}
                      className="inline-flex items-center gap-2 min-h-11 min-w-11 px-3 py-2.5 text-xs font-semibold text-primary hover:underline shrink-0"
                    >
                      {copied === k.id ? (
                        <><Check className="w-3 h-3" aria-hidden="true" /> Tersalin</>
                      ) : (
                        <><Copy className="w-3 h-3" aria-hidden="true" /> Salin</>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant/60 mt-2">
                    Bagikan link ini ke siswa via WhatsApp. Siswa yang klik akan langsung terdaftar di kursus ini.
                  </p>
                </div>
              )}
              </motion.div>
            ))}
          </motion.div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Prev</button>
              <span className="text-xs text-on-surface-variant">Halaman {page} / {totalPages} — {filtered.length} kursus</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="min-h-11 px-4 py-2 rounded-full border border-border-precision bg-white text-sm disabled:opacity-40">Next</button>
            </div>
          )}
          {/* TODO virtual: jika kursus >100, ganti grid dengan @tanstack/react-virtual virtualizer */}
        </div>
      )}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => {
            setConfirmDelete(null);
            if (deleteTriggerRef.current) deleteTriggerRef.current.focus();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-xl"
          >
            <h3 id="confirm-title" className="font-heading font-semibold text-lg text-on-surface mb-2">Hapus Kursus?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Kursus yang dihapus tidak bisa dikembalikan. Semua materi, kuis, dan data siswa di kursus ini akan tetap ada namun kursus tidak bisa diakses.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                ref={cancelRef}
                autoFocus
                onClick={() => {
                  setConfirmDelete(null);
                  if (deleteTriggerRef.current) deleteTriggerRef.current.focus();
                }}
                className="min-h-11 min-w-11 px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface rounded-xl inline-flex items-center justify-center"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting === confirmDelete}
                className="min-h-11 min-w-11 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {deleting === confirmDelete ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Trash2 className="w-4 h-4" aria-hidden="true" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KursusListPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div aria-busy="true" role="status"><SkeletonList /></div>}>
        <KursusContent />
      </Suspense>
    </ErrorBoundary>
  );
}
