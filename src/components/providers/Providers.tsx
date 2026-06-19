"use client";

import { MotionConfig } from "motion/react";
import { CmsProvider, type CmsData } from "./CmsProvider";
import { SessionProvider } from "./SessionProvider";

export function Providers({
  children,
  cmsData = {},
}: {
  children: React.ReactNode;
  cmsData?: CmsData;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <CmsProvider data={cmsData}>
        <SessionProvider>{children}</SessionProvider>
      </CmsProvider>
    </MotionConfig>
  );
}
