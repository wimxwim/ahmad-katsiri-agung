"use client";

import Image from "next/image";
import Link from "next/link";
import { Typography, Space } from "antd";
import type { CmsNavigation } from "@/components/providers/CmsProvider";

const FOOTER_LINKS_FALLBACK = [
  { href: "/", label: "Beranda" },
  { href: "/kursus", label: "Katalog Kursus" },
  { href: "/quran", label: "Qur'an" },
  { href: "/fitur", label: "Fitur" },
  { href: "/harga", label: "Harga" },
  { href: "/tentang", label: "Tentang Kami" },
];

const CONTACT_FALLBACK = {
  waNumber: "6285158795502",
  igHandle: "@ahmadkatsiria",
  tiktokHandle: "@sir.ahmd",
  youtubeChannel: "Ahmad Katsiri Agung",
  pendiriNama: "Ahmad Katsiri Agung, S.Pd.",
};

export function Footer({
  navigation: nav,
  pendiriNama: pendiriNamaProp,
}: {
  navigation?: CmsNavigation | null;
  pendiriNama?: string;
}) {
  const footerLinks = nav?.footerLinks ?? FOOTER_LINKS_FALLBACK;
  const contact = nav ?? CONTACT_FALLBACK;

  return (
    <footer className="w-full border-t border-border-precision bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-heading font-bold text-primary text-xl tracking-tight"
            >
              <Image src="/logo.webp" alt="Logo PAI" width={32} height={32} className="object-contain" />
              <span>AKAL Center</span>
            </Link>
            <Typography.Paragraph type="secondary" className="mt-3 !mb-0 max-w-xs">
              Platform multi-guru dengan AI Document Generator. Ubah dokumen jadi
              materi, quiz, dan soal — guru tetap memegang kendali penuh.
            </Typography.Paragraph>
          </div>

          <div>
            <Typography.Title level={5} className="!mb-4">Navigasi</Typography.Title>
            <Space direction="vertical" size="middle">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </Space>
          </div>

          <div>
            <Typography.Title level={5} className="!mb-4">Kontak</Typography.Title>
            <Space direction="vertical" size="middle">
              <Typography.Text type="secondary">{pendiriNamaProp || CONTACT_FALLBACK.pendiriNama}</Typography.Text>
              <a
                href={`https://wa.me/${contact.waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                WA: {contact.waNumber.replace(/^(\d{2})(\d{3})(\d{4})(\d{4})$/, "$1$2-$3-$4")}
              </a>
              <a
                href={`https://instagram.com/${contact.igHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                IG: {contact.igHandle}
              </a>
              <a
                href={`https://tiktok.com/@${contact.tiktokHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                TikTok: {contact.tiktokHandle}
              </a>
              <a
                href={`https://youtube.com/@${contact.youtubeChannel.toLowerCase().replace(/\s+/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                YouTube: {contact.youtubeChannel}
              </a>
            </Space>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border-precision text-center">
          <Typography.Text type="secondary" className="text-xs">
            &copy; {new Date().getFullYear()} AKAL Center. Hak Cipta Dilindungi.
          </Typography.Text>
        </div>
      </div>
    </footer>
  );
}
