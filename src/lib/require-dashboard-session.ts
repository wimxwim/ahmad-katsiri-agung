import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, ROLE_HOME_PATHS, type SesiRole } from "@/lib/session";

/**
 * Guard terpusat untuk layout dashboard.
 *
 * Mengapa ini perlu:
 * - Sebelumnya setiap layout (guru, siswa, owner, admin-sekolah, orang-tua)
 *   mengulang kode guard yang SAMA PERSIS — duplikasi berbahaya.
 * - Duplikasi menyebabkan redirect loop: middleware guard di edge → layout guard
 *   di server component → redirect lagi → middleware guard lagi.
 * - Dengan utility ini, guard cukup SATU KALI di layout, konsisten.
 *
 * Cara pakai:
 *   const session = await requireDashboardSession(["guru", "owner"], "guru", "/guru/beranda");
 *   // session pasti ada dan role-nya sudah divalidasi
 */
export async function requireDashboardSession(
  allowedRoles: SesiRole[],
  portal: "guru" | "siswa",
  defaultRedirect: string,
) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const _ar = sessionCookie?.value ? await verifySession(sessionCookie.value) : null;
  const session = _ar && _ar.success ? _ar.data : null;

  if (!session) {
    redirect(`/masuk?portal=${portal}&redirect=${encodeURIComponent(defaultRedirect)}`);
  }

  if (!allowedRoles.includes(session.role)) {
    redirect(ROLE_HOME_PATHS[session.role] || "/");
  }

  return session;
}