import type { Easing } from "motion/react";

export const EASE_CURVE = [0.16, 1, 0.3, 1] as const satisfies Easing;

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "0851-5879-5502";

export const KKM = 70;

export const ANALYTICS_STATUS_MAP = {
  MAHIR: "Sudah Mahir",
  MENENGAH: "Sedang Belajar",
  DASAR: "Perlu Latihan",
  PEMULA: "Perlu Bimbingan",
} as const;

export type AnalyticsStatusKey = keyof typeof ANALYTICS_STATUS_MAP;
export type AnalyticsStatusLabel = (typeof ANALYTICS_STATUS_MAP)[AnalyticsStatusKey];
