"use client";

import Link from "next/link";
import { useState } from "react";
import { PasswordInput } from "./PasswordInput";
import { ErrorAlert } from "./ErrorAlert";
import { GoogleIcon } from "./GoogleIcon";
import { startGoogleLogin } from "./shared";

type Props = {
  redirectTo?: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
  error: string;
  loading: boolean;
  noPassword: boolean;
};

export function FormLoginGuru({ redirectTo, onSubmit, onBack, error, loading, noPassword }: Props) {
  const [redirecting, setRedirecting] = useState(false);

  function handleGoogle() {
    setRedirecting(true);
    startGoogleLogin("guru", redirectTo);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="email@guru.com"
          className="w-full px-4 py-[13px] border border-border-precision rounded-xl text-[16px] bg-white text-on-surface placeholder:text-on-surface-variant/70 outline-hidden focus:border-primary/40 focus:ring-3 focus:ring-primary/10 transition-all"
        />
      </div>
      <div>
        <label className="block text-[13px] font-semibold text-on-surface mb-1.5">Kata Sandi</label>
        <PasswordInput />
      </div>
      <ErrorAlert message={error} />
      {noPassword && (
        <button
          type="button"
          onClick={handleGoogle}
          disabled={redirecting}
          className="w-full inline-flex items-center justify-center gap-2 py-[13px] border border-border-precision rounded-[13px] text-[14px] font-semibold text-on-surface hover:bg-surface transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {redirecting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-on-surface-variant/30 border-t-on-surface rounded-full animate-spin" />
              Sedang mengarahkan...
            </span>
          ) : (
            <>
              <GoogleIcon />
              Lanjutkan dengan Google
            </>
          )}
        </button>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-[15px] bg-primary text-on-primary rounded-[13px] font-semibold text-[16px] cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : "Masuk (akses penuh) →"}
      </button>
      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-border-precision" />
        <span className="text-xs uppercase tracking-wider text-on-surface-variant/60">atau</span>
        <div className="flex-1 h-px bg-border-precision" />
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={redirecting}
        className="w-full inline-flex items-center justify-center gap-2 py-[13px] border border-border-precision rounded-[13px] text-[14px] font-semibold text-on-surface hover:bg-surface transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {redirecting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-on-surface-variant/30 border-t-on-surface rounded-full animate-spin" />
            Sedang mengarahkan ke Google...
          </span>
        ) : (
          <>
            <GoogleIcon />
            Masuk dengan Google
          </>
        )}
      </button>
      <p className="text-center text-[13px] text-on-surface-variant">
        Belum punya akun guru?{" "}
        <Link href="/daftar?portal=guru&auto=guru" className="font-semibold text-primary hover:underline">
          Daftar sebagai guru
        </Link>
      </p>
      <p className="text-xs text-on-surface-variant bg-surface rounded-xl px-3 py-2.5">
        Hanya akun guru, owner, atau admin sekolah yang bisa masuk lewat alur ini.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-[13px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        ← Kembali ke pemilihan portal
      </button>
    </form>
  );
}
