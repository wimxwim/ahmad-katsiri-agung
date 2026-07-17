import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["unpdf"],
  images: {
    qualities: [75],
  },
  experimental: {
    viewTransition: true,
    optimizePackageImports: ["lucide-react"],
  },
  env: {
    BUILD_TIMESTAMP: new Date().toISOString(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://*.google-analytics.com https://va.vercel-scripts.com https://static.cloudflareinsights.com https://performance.radar.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://router.bynara.id https://*.supabase.co https://api.telegram.org https://equran.id https://*.vercel.app https://*.vercel-insights.com https://*.googleapis.com https://*.google-analytics.com https://*.youtube.com https://*.googlevideo.com https://api.github.com https://*.githubusercontent.com https://static.cloudflareinsights.com https://performance.radar.cloudflare.com https://www.googletagmanager.com https://www.google.com; media-src 'self' https://cdn.equran.id https://*.youtube.com https://*.googlevideo.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; report-uri /api/csp-report" },
        ],
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
