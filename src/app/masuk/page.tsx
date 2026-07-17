import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME, ROLE_HOME_PATHS } from "@/lib/session";
import { FormMasuk } from "./FormMasuk";

export const metadata: Metadata = {
  title: "Masuk",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://akalcenter.my.id/masuk",
  },
};

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const portal = params.portal === "guru" ? "guru" : params.portal === "siswa" ? "siswa" : undefined;
  const tab = params.tab === "daftar" ? "daftar" : "masuk";
  const redirectTo =
    typeof params.redirect === "string" && params.redirect.startsWith("/")
      ? params.redirect
      : undefined;
  const errorCode = typeof params.error === "string" ? params.error : undefined;
  const inviteKode = typeof params.kode === "string" && params.kode.length >= 1 && params.kode.length <= 6 ? params.kode : undefined;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    const _ar = await verifySession(sessionCookie.value);
    if (_ar.success) {
      const home = ROLE_HOME_PATHS[_ar.data.role] || "/";
      const target = redirectTo || home;
      redirect(target);
    }
  }

  return (
    <FormMasuk
      redirectTo={redirectTo}
      initialPortal={portal}
      initialTab={tab}
      errorCode={errorCode}
      inviteKode={inviteKode}
    />
  );
}
