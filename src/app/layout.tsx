import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Amiri, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWA } from "@/components/layout/FloatingWA";
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
  metadataBase: new URL("https://ahmad-katsiri-agung.vercel.app"),
  title: {
    template: "%s | Aggung Learning",
    default: "Aggung Learning — Deep Learning Akidah Akhlak",
  },
  description:
    "Platform Deep Learning untuk materi Akidah Akhlak tingkat SMP/MTs Kelas 7-9. Pembelajaran sadar, bermakna, dan menyenangkan berbasis Kurikulum Merdeka.",
  keywords: ["Akidah Akhlak", "Deep Learning", "PAI", "SMP", "MTs", "Kurikulum Merdeka", "aggung learning", "agung", "katsiri"],
  manifest: "/manifest.json",
  authors: [{ name: "Ahmad Katsiri Aggung, S.Pd." }],
  creator: "Ahmad Katsiri Aggung, S.Pd.",
  publisher: "Ahmad Katsiri Aggung",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Aggung Learning",
    title: "Aggung Learning — Deep Learning Akidah Akhlak",
    description:
      "Platform Deep Learning untuk materi Akidah Akhlak tingkat SMP/MTs Kelas 7-9. Pembelajaran sadar, bermakna, dan menyenangkan berbasis Kurikulum Merdeka.",
    url: "https://ahmad-katsiri-agung.vercel.app",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Aggung Learning — Deep Learning Akidah Akhlak",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aggung Learning — Deep Learning Akidah Akhlak",
    description:
      "Platform Deep Learning untuk materi Akidah Akhlak tingkat SMP/MTs Kelas 7-9.",
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
    "apple-mobile-web-app-title": "Aggung Learning",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#005231",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${bricolageGrotesque.variable} ${inter.variable} ${amiri.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <Script
          id="schema-web"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Aggung Learning",
              url: "https://ahmad-katsiri-agung.vercel.app",
              description:
                "Platform Deep Learning untuk materi Akidah Akhlak tingkat SMP/MTs Kelas 7-9.",
              inLanguage: "id-ID",
              educationalLevel: "SMP/MTs",
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
              name: "Deep Learning Akidah Akhlak",
              description:
                "Model Pembelajaran Berbasis Deep Learning pada Materi Akidah Akhlak tingkat SMP/MTs — Mindful, Meaningful, Joyful.",
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
        <Providers>
          <Navbar />
          <BottomTabBar />
          <main className="flex-1 pt-24 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 overflow-x-hidden">{children}</main>
          <Footer />
          <FloatingWA />
        </Providers>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-FKHV466K10" />
      </body>
    </html>
  );
}
