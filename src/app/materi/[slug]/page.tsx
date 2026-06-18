import { notFound } from "next/navigation";
import { getAllMateri, getMateriBySlug } from "@/lib/cms-data";
import { MateriDetailClient } from "@/components/materi/MateriDetailClient";

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
