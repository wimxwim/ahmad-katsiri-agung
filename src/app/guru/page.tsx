import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, ROLE_HOME_PATHS, type SesiRole } from "@/lib/session";

const ALLOWED: SesiRole[] = ["guru", "owner", "admin_sekolah"];

export default async function GuruIndex() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  const session = _ar && _ar.success ? _ar.data : null;
  if (!session) redirect("/masuk?portal=guru&redirect=/guru");
  if (!ALLOWED.includes(session.role)) redirect(ROLE_HOME_PATHS[session.role] || "/");
  redirect("/guru/beranda");
}
