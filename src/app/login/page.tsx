import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { FormMasuk } from "../masuk/FormMasuk";

export const metadata: Metadata = {
  title: "Masuk — AKAL Center",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    const session = await verifySession(sessionCookie.value);
    if (session) {
      redirect("/");
    }
  }

  return <FormMasuk />;
}
