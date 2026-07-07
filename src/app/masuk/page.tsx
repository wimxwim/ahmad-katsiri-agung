import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
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
  const portal = params.portal === "guru" ? "guru" : "siswa";
  const tab = params.tab === "daftar" ? "daftar" : "masuk";
  const redirectTo =
    typeof params.redirect === "string" && params.redirect.startsWith("/")
      ? params.redirect
      : undefined;
  const errorCode = typeof params.error === "string" ? params.error : undefined;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    const session = await verifySession(sessionCookie.value);
    if (session) {
      redirect(redirectTo || "/");
    }
  }

  return (
    <FormMasuk
      redirectTo={redirectTo}
      initialPortal={portal}
      initialTab={tab}
      errorCode={errorCode}
    />
  );
}
