import type { Easing } from "motion/react";

export const EASE_CURVE = [0.16, 1, 0.3, 1] as const satisfies Easing;

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6285158795502";

export const KKM = 70;

export const GRADIENT_SLUGS = new Set([
  "beriman-kepada-malaikat",
  "membiasakan-tabayyun-menjauhi-ghibah",
  "salat-mencegah-perbuatan-keji-dan-mungkar",
  "melestarikan-alam-cerminan-orang-beriman",
  "amanah-dan-jujur",
  "beriman-kepada-kitab-allah",
  "beriman-kepada-nabi-dan-rasul",
  "membangun-toleransi",
  "moderasi-beragama",
  "adab-dalam-islam",
  "beriman-kepada-hari-akhir",
  "beriman-kepada-qada-dan-qadar",
  "semangat-mencari-ilmu",
  "manusia-khalifah-di-muka-bumi",
]);
