import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { FormMasuk } from "./FormMasuk";

export const metadata = {
  title: "Masuk",
};

export default async function MasukPage() {
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
