import { notFound } from "next/navigation";
import { ALL_MATERI } from "@/data/materi";
import { MateriDetailClient } from "@/components/materi/MateriDetailClient";

export default async function DetailBabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const materi = ALL_MATERI[slug];

  if (!materi) {
    notFound();
  }

  return <MateriDetailClient materi={materi} />;
}

export async function generateStaticParams() {
  return Object.keys(ALL_MATERI).map((slug) => ({ slug }));
}
