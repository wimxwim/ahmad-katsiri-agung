"use client";

import { MotionConfig } from "motion/react";
import { CmsProvider, type CmsData } from "./CmsProvider";
import { SessionProvider } from "./SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";

export function Providers({
  children,
  cmsData = {},
}: {
  children: React.ReactNode;
  cmsData?: CmsData;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <CmsProvider data={cmsData}>
          <SessionProvider>{children}</SessionProvider>
        </CmsProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
