"use client";

import { useEffect, useState } from "react";
import { FormMasukLeftPanel } from "./_components/FormMasukLeftPanel";
import { FormMasukPortalPicker } from "./_components/FormMasukPortalPicker";
import { FormLoginSiswa } from "./_components/FormLoginSiswa";
import { FormDaftarSiswa } from "./_components/FormDaftarSiswa";
import { FormLoginGuru } from "./_components/FormLoginGuru";
import { ERROR_MESSAGES, type Mode, type TabMurid } from "./_components/shared";

type FormMasukProps = {
  redirectTo?: string;
  initialPortal?: "guru" | "siswa";
  initialTab?: TabMurid;
  errorCode?: string;
};

export function FormMasuk({
  redirectTo,
  initialPortal,
  initialTab = "masuk",
  errorCode,
}: FormMasukProps) {
  const [mode, setMode] = useState<Mode>(
    initialPortal === "guru" ? "guru" : initialPortal === "siswa" ? "murid" : "pilih"
  );
  const [tabMurid, setTabMurid] = useState<TabMurid>(initialTab);
  const [error, setError] = useState(
    () => (errorCode ? ERROR_MESSAGES[errorCode] || `Error: ${errorCode}` : "")
  );
  const [loading, setLoading] = useState(false);
  const [noPassword, setNoPassword] = useState(false);

  useEffect(() => {
    setMode(initialPortal === "guru" ? "guru" : initialPortal === "siswa" ? "murid" : "pilih");
    setTabMurid(initialTab);
    setError(errorCode ? ERROR_MESSAGES[errorCode] || `Error: ${errorCode}` : "");
    setNoPassword(false);
  }, [initialPortal, initialTab, errorCode]);

  useEffect(() => {
    setNoPassword(false);
  }, [mode, tabMurid]);

  function selectMode(m: Mode) {
    setMode(m);
    setError("");
    if (m === "murid") setTabMurid("masuk");
  }

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
        body: JSON.stringify({ email, password, redirectTo, portalIntent: mode === "guru" ? "guru" : "siswa" }),
      });
      const result = await res.json();
      if (result.error) {
        const err = typeof result.error === "string" ? { message: result.error } : result.error;
        if (err.code === "INTENT_MISMATCH") {
          const params = new URLSearchParams(err.details || {});
          window.location.href = `/masuk/role-mismatch?${params.toString()}`;
          return;
        }
        if (err.code === "NO_PASSWORD_SET") {
          setNoPassword(true);
          setError(err.message || "Akun ini belum punya kata sandi. Masuk lewat Google dulu.");
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
      setError("Gagal: " + (err instanceof Error ? err.message : "Terjadi kesalahan"));
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
      setError("Gagal: " + (err instanceof Error ? err.message : "Terjadi kesalahan"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-0 sm:p-6">
      <div className="w-full max-w-6xl bg-white rounded-none md:rounded-[32px] overflow-hidden shadow-glass-lg flex flex-col md:grid md:grid-cols-[1.1fr_0.9fr] min-h-screen md:min-h-[640px]">
        <FormMasukLeftPanel />

        <main className="px-6 py-6 md:px-11 md:py-12 flex flex-col justify-center">
          {mode === "pilih" && (
            <FormMasukPortalPicker onSelect={selectMode} />
          )}

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
                  onClick={() => { setTabMurid("masuk"); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    tabMurid === "masuk" ? "bg-white text-on-surface shadow-glass" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Masuk
                </button>
                <button
                  onClick={() => { setTabMurid("daftar"); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    tabMurid === "daftar" ? "bg-white text-on-surface shadow-glass" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Daftar
                </button>
              </div>

              {tabMurid === "masuk" ? (
                <FormLoginSiswa
                  redirectTo={redirectTo}
                  onSubmit={handleLogin}
                  onBack={() => selectMode("pilih")}
                  error={error}
                  loading={loading}
                  noPassword={noPassword}
                />
              ) : (
                <FormDaftarSiswa
                  onSubmit={handleRegister}
                  onBack={() => selectMode("pilih")}
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
              <h2 className="font-heading text-2xl text-on-surface mb-1">Masuk sebagai Guru</h2>
              <p className="text-sm text-on-surface-variant mb-6">
                Gunakan email dan kata sandi yang sudah didaftarkan.
              </p>
              <FormLoginGuru
                redirectTo={redirectTo}
                onSubmit={handleLogin}
                onBack={() => selectMode("pilih")}
                error={error}
                loading={loading}
                noPassword={noPassword}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
