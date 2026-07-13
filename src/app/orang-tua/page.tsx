import { headers, cookies } from "next/headers";
import { OrangTuaPageClient } from "./OrangTuaPageClient";

export default async function OrangTuaIndex() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || "http";
  const cookieStore = await cookies();

  const res = await fetch(`${proto}://${host}/api/v1/orang-tua/dashboard`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Gagal memuat data");
  const json = await res.json();

  return <OrangTuaPageClient initialData={json.data} />;
}