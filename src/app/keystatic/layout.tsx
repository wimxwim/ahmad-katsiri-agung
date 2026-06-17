import KeystaticApp from "./keystatic";
import { notFound } from "next/navigation";

export default function RootLayout() {
  const storageKind = process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND;
  const clientId = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID;
  const secret = process.env.KEYSTATIC_SECRET;

  // 🔒 Block ALL access unless explicitly configured:
  //   - Production (github mode): requires clientId + secret
  //   - Local dev: only when storageKind is explicitly "local"
  const isProduction = process.env.NODE_ENV === "production";
  const isGithubMode = storageKind === "github";
  const isExplicitLocal = storageKind === "local";

  if (isProduction) {
    // Never expose CMS in production
    notFound();
  }

  if (isGithubMode) {
    if (!clientId || !secret) {
      notFound();
    }
  } else if (!isExplicitLocal) {
    notFound();
  }

  return <KeystaticApp />;
}
