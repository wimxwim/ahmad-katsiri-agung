"use client";

import { useBeforeInstallPrompt } from "@/hooks/useBeforeInstallPrompt";
import { Download } from "lucide-react";

export function InstallPWAButton({ className = "" }: { className?: string }) {
  const { isInstallable, promptInstall } = useBeforeInstallPrompt();

  if (!isInstallable) return null;

  return (
    <button
      onClick={() => promptInstall()}
      className={`inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glass hover:brightness-110 active:scale-[0.98] transition-all ${className}`}
      aria-label="Install aplikasi"
    >
      <Download className="h-4 w-4" />
      Install Aplikasi
    </button>
  );
}
