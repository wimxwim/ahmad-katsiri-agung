import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Amiri, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWA } from "@/components/layout/FloatingWA";
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
  keywords: ["Akidah Akhlak", "Deep Learning", "PAI", "SMP", "MTs", "Kurikulum Merdeka", "aggung learning"],
  manifest: "/manifest.json",
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
  maximumScale: 3,
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
        <Providers>
          <Navbar />
          <BottomTabBar />
          <main className="flex-1 pt-24 pb-20 md:pb-0">{children}</main>
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
