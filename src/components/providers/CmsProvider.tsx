"use client";

import React, { createContext, useContext } from "react";
import type {
  CmsNavigation,
  CmsGame,
  CmsHadits,
  CmsSiteConfig,
  CmsMateriListItem,
  CmsMateriFull,
  CmsSoalMeta,
  CmsSoalData,
  CmsAbout,
  CmsPendidikPage,
  CmsPerangkatAjar,
  CmsData,
} from "@/lib/cms-types";

export type {
  CmsNavigation,
  CmsGame,
  CmsHadits,
  CmsSiteConfig,
  CmsMateriListItem,
  CmsMateriFull,
  CmsSoalMeta,
  CmsSoalData,
  CmsAbout,
  CmsPendidikPage,
  CmsPerangkatAjar,
  CmsData,
};

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
