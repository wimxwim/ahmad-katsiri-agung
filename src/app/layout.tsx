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
  metadataBase: new URL("https://akalcenter.my.id"),
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
