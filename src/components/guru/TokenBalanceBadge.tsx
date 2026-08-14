"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { MIN_GENERATE_CHARGE } from "@/lib/token-constants";

interface BalanceResponse {
  balance: number;
}

export function TokenBalanceBadge() {
  const pathname = usePathname();
  const [balance, setBalance] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [tokenUsed, setTokenUsed] = useState<number | null>(null);
  const [tokenLimit, setTokenLimit] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/v1/guru/token/balance", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`balance: ${res.status}`);
        return res.json() as Promise<BalanceResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        if (typeof data?.balance !== "number") throw new Error("payload tanpa balance");
        setBalance(data.balance);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled && balance === null) setFailed(true);
      });

    // F13-4 quota bar AI used/limit — fetch dashboard for aiQuota
    fetch("/api/v1/guru/dashboard", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((j) => {
        if (cancelled) return;
        const d = j?.data ?? j;
        if (d && typeof d.aiQuotaUsed === "number" && typeof d.aiQuotaLimit === "number") {
          setTokenUsed(d.aiQuotaUsed);
          setTokenLimit(d.aiQuotaLimit);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (failed) return null;

  const isLowBalance = balance !== null && balance < MIN_GENERATE_CHARGE;
  const showQuota = tokenUsed !== null && tokenLimit !== null && tokenLimit > 0;
  const usagePct = showQuota ? (tokenUsed! / tokenLimit!) * 100 : 0;

  return (
    <div className="flex justify-end mb-3">
      <div className="flex items-center gap-2">
        {showQuota && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border-precision text-xs font-medium text-on-surface">
            <span
              className={cn(
                "w-2 h-2 rounded-full shrink-0",
                usagePct > 80 ? "bg-red-500" : usagePct > 50 ? "bg-amber-500" : "bg-emerald-500"
              )}
            />
            AI {tokenUsed}/{tokenLimit}
          </div>
        )}
        {balance === null ? (
          <div className="h-6 w-28 rounded-full bg-primary/5 animate-pulse" aria-hidden />
        ) : (
          <span
            role="status"
            aria-live="polite"
            title={`Saldo token: Rp ${balance.toLocaleString("id-ID")}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              isLowBalance
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-white/60 text-primary border-border-precision"
            )}
          >
            <Wallet
              className={cn("w-3.5 h-3.5 shrink-0", isLowBalance && "text-amber-600")}
              strokeWidth={2}
            />
            {isLowBalance
              ? `Saldo rendah: Rp ${balance.toLocaleString("id-ID")}`
              : `Rp ${balance.toLocaleString("id-ID")}`}
          </span>
        )}
      </div>
    </div>
  );
}
