import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["unpdf"],
  images: {
    qualities: [60, 75, 85],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "cdn.equran.id" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    viewTransition: true,
    optimizePackageImports: ["lucide-react", "antd", "motion", "echarts", "@tanstack/react-query"],
  },
  env: {
    BUILD_TIMESTAMP: new Date().toISOString(),
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
      {
        // source /(.*) covers all routes including /api — CSP applied via both next.config and middleware
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // TODO: nonce/hash untuk inline script — saat ini hapus 'unsafe-inline' dari script-src/style-src, keep 'unsafe-eval' karena Next.js butuh
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; default-src 'self'; script-src 'self' 'unsafe-eval' https://www.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://static.cloudflareinsights.com https://performance.radar.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com; style-src 'self' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://router.bynara.id https://*.supabase.co https://api.telegram.org https://equran.id https://*.vercel.app https://*.vercel-insights.com https://*.googleapis.com https://*.google-analytics.com https://*.youtube.com https://*.googlevideo.com https://api.github.com https://*.githubusercontent.com https://static.cloudflareinsights.com https://performance.radar.cloudflare.com https://www.googletagmanager.com https://www.google.com; media-src 'self' https://cdn.equran.id https://*.youtube.com https://*.googlevideo.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; report-uri /api/csp-report" },
        ],
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
