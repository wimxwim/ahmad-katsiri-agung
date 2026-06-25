import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllMateri, getMateriBySlug } from "@/lib/cms-data";
import { MateriDetailClient } from "@/components/materi/MateriDetailClient";

const BASE_URL = "https://akalcenter.my.id";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const materi = await getMateriBySlug(slug);
  if (!materi) return {};

  const title = `${materi.title} — Kelas ${materi.kelas} | AKAL Center`;
  const description = materi.ringkasan;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/materi/${materi.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/materi/${materi.slug}`,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function DetailBabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const materi = await getMateriBySlug(slug);

  if (!materi) {
    notFound();
  }

  return <MateriDetailClient materi={materi} />;
}

export async function generateStaticParams() {
  const all = await getAllMateri();
  return Object.keys(all).map((slug) => ({ slug }));
}
