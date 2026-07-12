"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App as AntApp } from "antd";
import { MotionConfig } from "motion/react";
import { QueryProvider } from "./QueryProvider";
import { CmsProvider, type CmsData } from "./CmsProvider";
import { SessionProvider } from "./SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";
import { antdTheme } from "@/lib/antd-theme";

export function Providers({
  children,
  cmsData = {},
}: {
  children: React.ReactNode;
  cmsData?: CmsData;
}) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={antdTheme}>
        <AntApp>
          <MotionConfig reducedMotion="user">
            <QueryProvider>
              <ToastProvider>
                <CmsProvider data={cmsData}>
                  <SessionProvider>
                    <ServiceWorkerRegister />
                    {children}
                  </SessionProvider>
                </CmsProvider>
              </ToastProvider>
            </QueryProvider>
          </MotionConfig>
        </AntApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}