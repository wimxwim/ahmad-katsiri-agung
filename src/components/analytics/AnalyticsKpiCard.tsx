"use client";

import type { ReactNode } from "react";
import EChartsBase from "@/components/charts/EChartsBase";

type AnalyticsKpiCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: ReactNode;
  trend?: number[];
};

export default function AnalyticsKpiCard({
  label,
  value,
  sublabel,
  icon,
  trend,
}: AnalyticsKpiCardProps) {
  const hasTrend = Array.isArray(trend) && trend.length > 1;

  return (
    <div className="bg-white/60 backdrop-blur-2xl border border-border-precision shadow-glass rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase truncate">
            {label}
          </p>
          <p className="font-heading text-2xl font-bold tracking-tight text-foreground leading-none mt-1.5">
            {value}
          </p>
          {sublabel ? (
            <p className="text-xs text-muted-foreground mt-1 truncate">{sublabel}</p>
          ) : null}
        </div>
        <div className="shrink-0 w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-[#005231]">
          {icon}
        </div>
      </div>
      {hasTrend ? (
        <div className="pt-1">
          <EChartsBase
            height={32}
            option={{
              aria: { enabled: true, decal: { show: false } },
              grid: { left: 0, right: 0, top: 4, bottom: 0, containLabel: false },
              xAxis: {
                type: "category",
                show: false,
                boundaryGap: false,
                data: trend!.map((_, i) => String(i)),
              },
              yAxis: { type: "value", show: false, min: 0 },
              tooltip: { show: false },
              series: [
                {
                  type: "line",
                  data: trend,
                  smooth: true,
                  symbol: "none",
                  lineStyle: { color: "#005231", width: 1.5 },
                  areaStyle: { color: "rgba(0,82,49,0.1)" },
                },
              ],
              animation: true,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export { AnalyticsKpiCard };
