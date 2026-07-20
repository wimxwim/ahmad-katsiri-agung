"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { PasswordInput } from "./PasswordInput";
import { ErrorAlert } from "./ErrorAlert";
import { GoogleIcon } from "./GoogleIcon";
import { startGoogleLogin } from "./shared";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Props = {
  redirectTo?: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onBack: () => void;
  error: string;
  loading: boolean;
  noPassword: boolean;
};

export function FormLoginSiswa({
  redirectTo,
  onSubmit,
  onBack,
  error,
  loading,
  noPassword,
}: Props) {
  const [redirecting, setRedirecting] = useState(false);
  const redirectingRef = useRef(false);

  function handleGoogle() {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    setRedirecting(true);
    startGoogleLogin("siswa", redirectTo);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">
          Email
        </label>
        <Input name="email" type="email" required placeholder="kamu@email.com" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">
          Kata Sandi
        </label>
        <PasswordInput />
      </div>
      <div className="text-right">
        <Link href="/lupa-password" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
          Lupa password?
        </Link>
      </div>
      <ErrorAlert message={error} />
      {noPassword && (
        <button
          type="button"
          onClick={handleGoogle}
          disabled={redirecting}
          className="w-full inline-flex items-center justify-center gap-2 py-3 border border-border-precision rounded-button text-base font-semibold text-on-surface hover:bg-surface active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
      <Button type="submit" disabled={loading}>
        {loading ? "Memproses..." : "Masuk \u2192"}
      </Button>
      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-border-precision" />
        <span className="text-xs uppercase tracking-wider text-on-surface-variant/60">
          atau
        </span>
        <div className="flex-1 h-px bg-border-precision" />
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={redirecting}
        className="w-full inline-flex items-center justify-center gap-2 py-3 border border-border-precision rounded-button text-base font-semibold text-on-surface hover:bg-surface active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
      <p className="text-center text-sm text-on-surface-variant">
        Belum punya akun siswa?{" "}
        <Link
          href="/daftar?portal=siswa&auto=siswa"
          className="font-semibold text-primary hover:underline"
        >
          Daftar di sini
        </Link>
      </p>
      <p className="text-xs text-on-surface-variant bg-surface rounded-xl px-3 py-2.5">
        Hanya akun siswa yang bisa masuk lewat alur ini. Jika akunmu guru, gunakan
        portal guru.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-on-surface-variant hover:text-primary active:scale-[0.98] transition-all duration-200 cursor-pointer"
      >
        &larr; Kembali ke pemilihan portal
      </button>
    </form>
  );
}