import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Amiri, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWA } from "@/components/layout/FloatingWA";
import type { CmsData } from "@/components/providers/CmsProvider";
import {
  getNavigationFromCms,
  getSiteConfigFromCms,
  getGamesFromCms,
  getHaditsFromCms,
  getMateriFromCms,
  getSoalMetaFromCms,
  getSoalFromCms,
  getAboutFromCms,
  getPendidikPageFromCms,
  getPerangkatAjarFromCms,
} from "@/lib/cms";
import { CMS_ENABLED } from "@/lib/cms-config";
import type { CmsMateriListItem, CmsMateriFull } from "@/components/providers/CmsProvider";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akalcenter.my.id"),
  alternates: {
    canonical: "https://akalcenter.my.id",
  },
  title: {
    template: "%s | AKAL Center",
    default: "AKAL Center — Deep Learning Akidah Akhlak",
  },
  description:
    "Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning untuk SMP Kelas 7-9. Pembelajaran sadar, bermakna, dan menyenangkan berdasarkan Kurikulum Merdeka.",
  keywords: ["Akidah Akhlak", "Aqidah Akhlaq", "Deep Learning", "PAI", "SMP", "Kurikulum Merdeka", "AKAL Center", "agung", "katsiri"],
  manifest: "/manifest.json",
  authors: [{ name: "Ahmad Katsiri Aggung, S.Pd." }],
  creator: "Ahmad Katsiri Aggung, S.Pd.",
  publisher: "Ahmad Katsiri Aggung",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "AKAL Center",
    title: "AKAL Center — Deep Learning Akidah Akhlak",
    description:
      "Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning untuk SMP Kelas 7-9. Pembelajaran sadar, bermakna, dan menyenangkan berdasarkan Kurikulum Merdeka.",
    url: "https://akalcenter.my.id",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "AKAL Center — Deep Learning Akidah Akhlak",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AKAL Center — Deep Learning Akidah Akhlak",
    description:
      "Model Pembelajaran Aqidah Akhlaq berbasis Deep Learning untuk SMP Kelas 7-9.",
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

async function loadCmsData(): Promise<CmsData> {
  if (!CMS_ENABLED) return {};
  try {
    const [nav, siteConfig, games, hadits, rawMateri, soalMeta, rawSoal, about, pendidikPage, perangkatAjar] = await Promise.all([
      getNavigationFromCms(),
      getSiteConfigFromCms(),
      getGamesFromCms(),
      getHaditsFromCms(),
      getMateriFromCms(),
      getSoalMetaFromCms(),
      getSoalFromCms(),
      getAboutFromCms(),
      getPendidikPageFromCms(),
      getPerangkatAjarFromCms(),
    ]);

    let materiList: CmsMateriListItem[] | undefined;
    let materiDetail: Record<string, CmsMateriFull> | undefined;
    if (rawMateri) {
      const slugs = Object.keys(rawMateri);
      materiList = slugs.map((slug) => {
        const m = rawMateri[slug];
        return {
          slug: m.slug,
          title: m.title,
          kelas: m.kelas,
          bab: m.bab,
          ringkasan: m.ringkasan,
          subTopik: m.subTopik,
          icon: m.icon,
        };
      });
      materiDetail = slugs.reduce(
        (acc, slug) => {
          const m = rawMateri[slug];
          acc[slug] = {
            slug: m.slug,
            title: m.title,
            kelas: m.kelas,
            bab: m.bab,
            babLabel: m.babLabel,
            ringkasan: m.ringkasan,
            subTopik: m.subTopik,
            waktuBaca: m.waktuBaca,
            icon: m.icon,
            videoUrl: m.videoUrl,
            pdfUrl: m.pdfUrl,
            pptUrl: m.pptUrl,
            soalUrl: m.soalUrl,
            gameUrl: m.gameUrl,
            pendahuluan: m.pendahuluan,
            konten: m.konten,
            dalil: m.dalil,
            dimensi: m.dimensi,
            poinPenting: m.poinPenting,
            prevSlug: m.prevSlug,
            prevTitle: m.prevTitle,
            nextSlug: m.nextSlug,
            nextTitle: m.nextTitle,
          };
          return acc;
        },
        {} as Record<string, CmsMateriFull>,
      );
    }

    return {
      navigation: nav ?? undefined,
      siteConfig: siteConfig ?? undefined,
      games: games ?? undefined,
      hadits: hadits ?? undefined,
      materiList,
      materiDetail,
      soalMeta: soalMeta ?? undefined,
      soalData: rawSoal ?? undefined,
      about: about ?? undefined,
      pendidikPage: pendidikPage ?? undefined,
      perangkatAjar: perangkatAjar ?? undefined,
    };
  } catch {
    return {};
  }
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600..800&display=swap"
          as="style"
        />
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
                name: "Ahmad Katsiri Aggung, S.Pd.",
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
                name: "Ahmad Katsiri Aggung, S.Pd.",
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
        <Providers cmsData={cmsData}>
          <Navbar />
          <BottomTabBar />
          <main className="flex-1 pt-24 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 overflow-x-hidden">{children}</main>
          <Footer navigation={cmsData.navigation} />
          <FloatingWA waNumber={cmsData.navigation?.waNumber} />
        </Providers>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId={cmsData.siteConfig?.googleAnalyticsId || "G-FKHV466K10"} />
      </body>
    </html>
  );
}
