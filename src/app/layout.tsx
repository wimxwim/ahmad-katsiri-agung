import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Amiri, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWA } from "@/components/layout/FloatingWA";
import type { CmsData } from "@/lib/cms-types";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  display: "optional",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "fallback",
  preload: true,
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akalcenter.my.id"),
  alternates: {
    canonical: "https://akalcenter.my.id",
  },
  title: {
    template: "%s | AKAL Center",
    default: "AKAL Center — Platform Guru-Siswa + AI Document Generator",
  },
  description:
    "Platform pembelajaran multi-guru untuk mengubah PDF/DOCX menjadi draft materi, quiz, dan soal yang ditinjau guru sebelum diterbitkan ke siswa.",
  keywords: ["AKAL Center", "platform guru siswa", "AI document generator", "LMS Indonesia", "materi digital", "quiz", "soal", "Supabase", "ImageKit"],
  manifest: "/manifest.json",
  authors: [{ name: "Ahmad Katsiri Agung, S.Pd." }],
  creator: "Ahmad Katsiri Agung, S.Pd.",
  publisher: "Ahmad Katsiri Agung",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "AKAL Center",
    title: "AKAL Center — Platform Guru-Siswa + AI Document Generator",
    description:
      "Ubah PDF/DOCX menjadi draft materi, quiz, dan soal. AI membantu, guru meninjau, siswa belajar di ruang yang tepat.",
    url: "https://akalcenter.my.id",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "AKAL Center — Platform Guru-Siswa + AI Document Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AKAL Center — Platform Guru-Siswa + AI Document Generator",
    description:
      "Platform multi-guru dengan AI document generator untuk draft materi, quiz, dan soal yang ditinjau guru.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "AKAL Center",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#005231",
  width: "device-width",
  initialScale: 1,
};

// Keystatic FROZEN per D-011 (9 Juli 2026) — CMS reader dihapus total, selalu return {}.
// Semua konsumer (Navbar, Footer, /tentang, /game) punya fallback hardcoded sendiri.
async function loadCmsData(): Promise<CmsData> {
  return {};
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cmsData = await loadCmsData();

  return (
      <html
        lang="id"
        className={`${bricolageGrotesque.variable} ${inter.variable} ${amiri.variable} ${jetbrainsMono.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col font-body">
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <Script
          id="schema-web"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AKAL Center",
    url: "https://akalcenter.my.id",
              description:
                "Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning untuk SMP Kelas 7-9.",
              inLanguage: "id-ID",
              educationalLevel: "SMP",
              author: {
                "@type": "Person",
                name: "Ahmad Katsiri Agung, S.Pd.",
              },
            }),
          }}
        />
        <Script
          id="schema-learning-resource"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LearningResource",
              name: "AKAL Center",
              description:
                "Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning untuk SMP Kelas 7-9 — Mindful, Meaningful, Joyful.",
              educationalLevel: ["Grade 7", "Grade 8", "Grade 9"],
              educationalAlignment: {
                "@type": "AlignmentObject",
                alignmentType: "educationalSubject",
                targetName: "Kurikulum Merdeka",
              },
              provider: {
                "@type": "Person",
                name: "Ahmad Katsiri Agung, S.Pd.",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IDR",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-semibold"
        >
          Lewati ke konten
        </a>
        <Providers cmsData={cmsData}>
          <Navbar />
          <BottomTabBar />
          <main id="main" className="flex-1 pt-24 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 overflow-x-hidden">{children}</main>
          <Footer navigation={cmsData.navigation} pendiriNama={cmsData.about?.pendiriNama} />
          <FloatingWA waNumber={cmsData.navigation?.waNumber} />
          <Toaster />
        </Providers>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId={cmsData.siteConfig?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}
