import KeystaticApp from "./keystatic";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

const ALLOWED_USERS =
  process.env.KEYSTATIC_ALLOWED_USERS?.split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) ?? [];

async function verifyGithubUser(): Promise<"allowed" | "denied" | "no-token"> {
  const cookieStore = await cookies();
  const token = cookieStore.get("keystatic-gh-access-token")?.value;
  if (!token) return "no-token";

  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "akal-center-cms",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return "denied";
    const user = await res.json();
    const login: string = user.login?.toLowerCase();
    if (!login) return "denied";
    if (ALLOWED_USERS.length > 0 && !ALLOWED_USERS.includes(login)) {
      return "denied";
    }
    return "allowed";
  } catch {
    return "denied";
  }
}

export default async function RootLayout() {
  const storageKind = process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND;
  const clientId = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_CLIENT_ID;
  const secret = process.env.KEYSTATIC_SECRET;

  // 🔒 Block ALL access unless explicitly configured
  const isProduction = process.env.NODE_ENV === "production";
  const isGithubMode = storageKind === "github";
  const isExplicitLocal = storageKind === "local";

  if (isGithubMode) {
    if (!clientId || !secret) {
      notFound();
    }
  } else if (!isExplicitLocal || isProduction) {
    notFound();
  }

  // 🔒 GitHub user allowlist — only when list is configured
  if (ALLOWED_USERS.length > 0) {
    const access = await verifyGithubUser();
    if (access === "denied") {
      return (
        <html>
          <body style={{ fontFamily: "system-ui, sans-serif", background: "#0a0a0a", color: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
            <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
              <h1 style={{ fontSize: 28, marginBottom: 12 }}>⛔ Akses Ditolak</h1>
              <p style={{ color: "#aaa", lineHeight: 1.6 }}>
                Akun GitHub Anda tidak terdaftar untuk mengakses CMS ini.
                Hubungi administrator jika Anda perlu akses.
              </p>
              <a
                href="/keystatic"
                style={{ display: "inline-block", marginTop: 20, color: "#4ade80" }}
              >
                Coba Login Ulang
              </a>
            </div>
          </body>
        </html>
      );
    }
  }

  return <KeystaticApp />;
}
