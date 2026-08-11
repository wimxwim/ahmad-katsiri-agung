"use client";

import { useEffect, useState } from "react";

interface DiskusiBadgeResponse {
  belumDijawab?: number;
}

export function GuruDiskusiBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/guru/diskusi", { credentials: "include" })
      .then((r) => r.json().catch(() => ({})))
      .then((j: DiskusiBadgeResponse) => {
        if (!cancelled) setCount(typeof j?.belumDijawab === "number" ? j.belumDijawab : 0);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span className="ml-auto shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold grid place-items-center">
      {count > 99 ? "99+" : count}
    </span>
  );
}