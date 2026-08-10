import type { Metadata } from "next";
import { db } from "@/lib/db";
import { kursus } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://akalcenter.my.id";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [course] = await db
      .select({ judul: kursus.judul, deskripsi: kursus.deskripsi })
      .from(kursus)
      .where(and(eq(kursus.slug, slug), isNull(kursus.deletedAt)))
      .limit(1);
    if (!course) throw new Error("Not found");
    return {
      title: { absolute: `${course.judul} — AKAL Center` },
      description: course.deskripsi || `Kursus ${course.judul} di AKAL Center`,
      alternates: { canonical: `${BASE_URL}/kursus/${slug}` },
    };
  } catch {
    return {
      title: { absolute: "Kursus — AKAL Center" },
      description: "Lihat detail kursus di AKAL Center.",
      alternates: { canonical: `${BASE_URL}/kursus` },
    };
  }
}

export default function KursusDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
