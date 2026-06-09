import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Amiri, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWA } from "@/components/layout/FloatingWA";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
          <main className="flex-1 pt-24" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>{children}</main>
          <Footer />
          <FloatingWA />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
