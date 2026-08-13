"use client";

import { useEffect, useRef } from "react";
import { echarts } from "@/lib/echarts-core";

type EChartsBaseProps = {
  option: echarts.EChartsCoreOption;
  style?: React.CSSProperties;
  className?: string;
  height?: number | string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
};

export default function EChartsBase({
  option,
  style,
  className,
  height = 240,
  ariaLabel,
  ariaDescribedBy,
}: EChartsBaseProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    const dom = containerRef.current;
    if (!dom) return;

    const existing = echarts.getInstanceByDom(dom);
    if (existing) {
      chartRef.current = existing;
      return;
    }

    const chart = echarts.init(dom, "akalMint", { renderer: "canvas" });
    chartRef.current = chart;

    chart.setOption(option, { notMerge: false, lazyUpdate: true });

    const ro = new ResizeObserver(() => {
      chart.resize();
    });
    ro.observe(dom);

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyReducedMotion = () => {
      if (mql.matches) {
        chart.setOption({ animation: false } as echarts.EChartsCoreOption, {
          notMerge: false,
          lazyUpdate: true,
        });
      }
    };
    applyReducedMotion();
    const onMqlChange = () => applyReducedMotion();
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onMqlChange);
    } else {
      mql.addListener(onMqlChange);
    }

    return () => {
      ro.disconnect();
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", onMqlChange);
      } else {
        mql.removeListener(onMqlChange);
      }
      chart.dispose();
      chartRef.current = null;
    };
    // init only once on mount; option updates handled by second effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setOption(option, { notMerge: false, lazyUpdate: true });
  }, [option]);

  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: resolvedHeight, width: "100%", ...style }}
      role="img"
      aria-label={ariaLabel ?? "Chart"}
      aria-describedby={ariaDescribedBy}
    />
  );
}

export { EChartsBase };
