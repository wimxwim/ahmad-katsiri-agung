import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, ROLE_HOME_PATHS, type SesiRole } from "@/lib/session";

const ALLOWED: SesiRole[] = ["murid", "orang_tua"];

export default async function SiswaIndex() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const session = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  if (!session) redirect("/masuk?portal=siswa&redirect=/siswa");
  if (!ALLOWED.includes(session.role)) redirect(ROLE_HOME_PATHS[session.role] || "/");
  redirect("/siswa/beranda");
}
