import KeystaticApp from "./keystatic";
import { notFound } from "next/navigation";

export default function RootLayout() {
  const clientId = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID;
  if (!clientId) {
    notFound();
  }
  return <KeystaticApp />;
}
