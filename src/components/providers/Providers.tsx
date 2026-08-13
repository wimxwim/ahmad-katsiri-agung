"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App as AntApp } from "antd";
import { MotionConfig } from "motion/react";
import { QueryProvider } from "./QueryProvider";
import { CmsProvider, type CmsData } from "./CmsProvider";
import { SessionProvider } from "./SessionProvider";
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
              <CmsProvider data={cmsData}>
                <SessionProvider>
                  {children}
                </SessionProvider>
              </CmsProvider>
            </QueryProvider>
          </MotionConfig>
        </AntApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}