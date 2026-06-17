"use client";

import React, { createContext, useContext } from "react";

export interface CmsNavigation {
  navbarItems: { href: string; label: string }[];
  bottomTabs: { href: string; label: string; icon: string }[];
  footerLinks: { href: string; label: string }[];
  waNumber: string;
  igHandle: string;
  tiktokHandle: string;
  youtubeChannel: string;
}

export interface CmsGame {
  judul: string;
  desc: string;
  url: string;
  badge: "EKSTERNAL" | "INTERNAL";
  image: string;
}

export interface CmsHadits {
  teks: string;
  sumber: string;
}

export interface CmsSiteConfig {
  siteTitle: string;
  tagline: string;
  description: string;
  keywords: string;
  googleAnalyticsId: string;
}

export interface CmsMateriListItem {
  slug: string;
  title: string;
  kelas: number;
  bab: number;
  ringkasan: string;
  subTopik: number;
  icon: string;
}

export interface CmsMateriFull {
  slug: string;
  title: string;
  kelas: number;
  bab: number;
  babLabel: string;
  ringkasan: string;
  subTopik: number;
  waktuBaca: string;
  icon: string;
  videoUrl?: string;
  pendahuluan: string;
  konten: { judul: string; isi: string }[];
  dalil?: { surah: string; arab: string; arti: string };
  dimensi?: { nomor: number; judul: string; deskripsi: string }[];
  poinPenting: string[];
  prevSlug?: string;
  prevTitle?: string;
  nextSlug?: string;
  nextTitle?: string;
}

export interface CmsSoalMeta {
  slug: string;
  title: string;
  kelas: number;
  jumlahSoal: number;
}

export interface CmsAbout {
  filosofi: string;
  pendiriNama: string;
  pendiriFoto: string;
  visi: string;
  misi: string[];
  verifikator: { nama: string; peran: string }[];
}

export interface CmsPendidikFeatureCard {
  badge: string;
  title: string;
  desc: string;
}

export interface CmsPendidikStats {
  value: string;
  label: string;
}

export interface CmsPendidikPage {
  featureCards: CmsPendidikFeatureCard[];
  stats: CmsPendidikStats[];
}

export interface CmsPerangkatItem {
  kelas: string;
  label: string;
  file: string;
  tersedia: boolean;
}

export interface CmsPerangkatAjar {
  items: CmsPerangkatItem[];
}

export interface CmsSoalData {
  slug: string;
  title: string;
  kelas: number;
  bab: number;
  soal: {
    nomor: number;
    pertanyaan: string;
    opsi: Record<string, string>;
    jawaban: string;
  }[];
}

export interface CmsData {
  navigation?: CmsNavigation;
  siteConfig?: CmsSiteConfig;
  games?: CmsGame[];
  hadits?: CmsHadits[];
  materiList?: CmsMateriListItem[];
  materiDetail?: Record<string, CmsMateriFull>;
  soalMeta?: CmsSoalMeta[];
  soalData?: Record<string, CmsSoalData>;
  about?: CmsAbout;
  pendidikPage?: CmsPendidikPage;
  perangkatAjar?: CmsPerangkatAjar;
}

const CmsContext = createContext<CmsData>({});

export function useCmsData() {
  return useContext(CmsContext);
}

export function CmsProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: CmsData;
}) {
  return <CmsContext.Provider value={data}>{children}</CmsContext.Provider>;
}
