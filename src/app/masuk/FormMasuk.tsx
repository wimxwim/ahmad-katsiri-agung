"use client";

import { useEffect, useState } from "react";
import { FormMasukLeftPanel } from "./_components/FormMasukLeftPanel";
import { FormLoginSiswa } from "./_components/FormLoginSiswa";
import { FormDaftarSiswa } from "./_components/FormDaftarSiswa";
import { FormLoginGuru } from "./_components/FormLoginGuru";
import { ERROR_MESSAGES, type Mode, type TabMurid } from "./_components/shared";

const INVITE_STORAGE_KEY = "akal_pending_invite";

type FormMasukProps = {
  redirectTo?: string;
  initialPortal?: "guru" | "siswa";
  initialTab?: TabMurid;
  errorCode?: string;
  inviteKode?: string;
};

export function FormMasuk({
  redirectTo,
  initialPortal,
  initialTab = "masuk",
  errorCode,
  inviteKode,
}: FormMasukProps) {
  const [mode, setMode] = useState<Mode>(
    initialPortal === "guru"
      ? "guru"
      : initialPortal === "siswa"
      ? "murid"
      : "pilih"
  );
  const [tabMurid, setTabMurid] = useState<TabMurid>(initialTab);
  const [error, setError] = useState(
    () => (errorCode ? ERROR_MESSAGES[errorCode] || `Error: ${errorCode}` : "")
  );
  const [loading, setLoading] = useState(false);
  const [noPassword, setNoPassword] = useState(false);

  useEffect(() => {
    setNoPassword(false);
  }, [mode, tabMurid]);

  useEffect(() => {
    if (inviteKode && inviteKode.length >= 1) {
      try {
        localStorage.setItem(INVITE_STORAGE_KEY, inviteKode);
      } catch { /* localStorage not available */ }
    }
  }, [inviteKode]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          redirectTo,
          portalIntent: mode === "guru" ? "guru" : "siswa",
        }),
      });
      const result = await res.json();
      if (result.error) {
        const err =
          typeof result.error === "string"
            ? { message: result.error }
            : result.error;
        if (err.code === "INTENT_MISMATCH") {
          const params = new URLSearchParams(err.details || {});
          window.location.href = `/masuk/role-mismatch?${params.toString()}`;
          return;
        }
        if (err.code === "NO_PASSWORD_SET") {
          setNoPassword(true);
          setError(
            err.message ||
              "Akun ini belum punya kata sandi. Masuk lewat Google dulu."
          );
          setLoading(false);
          return;
        }
        setError(err.message || err.code || "Terjadi kesalahan");
      } else if (result.success && result.redirect) {
        window.location.href = result.redirect;
      } else {
        setError("Terjadi kesalahan");
      }
    } catch (err) {
      setError(
        "Gagal: " + (err instanceof Error ? err.message : "Terjadi kesalahan")
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: formData.get("nama"),
          email: formData.get("email"),
          password: formData.get("password"),
          kelas: formData.get("kelas") || undefined,
          noAbsen: formData.get("noAbsen") || undefined,
          portal: mode === "guru" ? "guru" : "siswa",
          role: mode === "guru" ? "GURU" : "SISWA",
          redirectTo,
        }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.redirect) {
        window.location.href = result.redirect;
      } else {
        setError("Terjadi kesalahan");
      }
    } catch (err) {
      setError(
        "Gagal: " + (err instanceof Error ? err.message : "Terjadi kesalahan")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface p-0 sm:p-6">
      <div className="w-full max-w-6xl bg-white rounded-none md:rounded-2xl overflow-hidden shadow-glass-lg flex flex-col md:grid md:grid-cols-[1.1fr_0.9fr] min-h-dvh md:min-h-[640px]">
        <FormMasukLeftPanel />

        <div className="px-5 py-8 sm:px-11 sm:py-12 flex flex-col justify-center">
          <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1">
            <button
              onClick={() => { setMode("guru"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer active:scale-[0.98] ${
                mode === "guru"
                  ? "bg-white text-on-surface shadow-glass"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Guru
            </button>
            <button
              onClick={() => { setMode("murid"); setError(""); setTabMurid("masuk"); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer active:scale-[0.98] ${
                mode === "murid"
                  ? "bg-white text-on-surface shadow-glass"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Siswa
            </button>
          </div>

          {mode === "murid" && (
            <div>
              <span className="inline-block text-xs font-bold tracking-wider text-primary bg-primary/5 px-3 py-1.5 rounded-full mb-4">
                SISWA
              </span>
              <h2 className="font-heading text-2xl text-on-surface mb-1">
                {tabMurid === "daftar" ? "Buat akun baru" : "Masuk ke akun"}
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                {tabMurid === "daftar"
                  ? "Daftar pakai email untuk menyimpan progres."
                  : "Pakai email dan kata sandi yang sudah didaftarkan."}
              </p>

              <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1">
                <button
                  onClick={() => {
                    setTabMurid("masuk");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer active:scale-[0.98] ${
                    tabMurid === "masuk"
                      ? "bg-white text-on-surface shadow-glass"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    setTabMurid("daftar");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer active:scale-[0.98] ${
                    tabMurid === "daftar"
                      ? "bg-white text-on-surface shadow-glass"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Daftar
                </button>
              </div>

              {tabMurid === "masuk" ? (
                <FormLoginSiswa
                  redirectTo={redirectTo}
                  onSubmit={handleLogin}
                  onBack={() => { setMode("guru"); }}
                  error={error}
                  loading={loading}
                  noPassword={noPassword}
                />
              ) : (
                <FormDaftarSiswa
                  onSubmit={handleRegister}
                  onBack={() => { setMode("guru"); }}
                  error={error}
                  loading={loading}
                />
              )}
            </div>
          )}

          {mode === "guru" && (
            <div>
              <span className="inline-block text-xs font-bold tracking-wider text-primary bg-primary/5 px-3 py-1.5 rounded-full mb-4">
                GURU
              </span>
              <h2 className="font-heading text-2xl text-on-surface mb-1">
                Masuk sebagai Guru
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                Gunakan email dan kata sandi yang sudah didaftarkan.
              </p>
              <FormLoginGuru
                redirectTo={redirectTo}
                onSubmit={handleLogin}
                onBack={() => { setMode("murid"); }}
                error={error}
                loading={loading}
                noPassword={noPassword}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}