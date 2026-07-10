export type Mode = "pilih" | "murid" | "guru";
export type TabMurid = "daftar" | "masuk";

export const ERROR_MESSAGES: Record<string, string> = {
  intent_mismatch: "Akun ini tidak cocok dengan portal yang dipilih. Gunakan portal sesuai peran Anda.",
  terlalu_banyak_percobaan: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
  login_google_dibatalkan: "Login Google dibatalkan.",
  sesi_google_tidak_valid: "Sesi Google tidak valid. Coba lagi.",
  tidak_terhubung_google: "Tidak dapat terhubung ke Google. Coba lagi nanti.",
  email_google_belum_diverifikasi: "Email Google belum diverifikasi.",
  akun_google_tidak_cocok: "Akun Google ini tidak cocok dengan akun yang sudah ada.",
  login_google_gagal: "Login Google gagal. Coba lagi.",
  db_tidak_terhubung: "Database belum terhubung. Pastikan PostgreSQL sudah berjalan, lalu coba lagi.",
  auth: "Sesi autentikasi tidak valid.",
};

export function startGoogleLogin(portal: "guru" | "siswa", redirectTo?: string) {
  const url = new URL("/api/v1/auth/google", window.location.origin);
  url.searchParams.set("portal", portal);
  if (redirectTo) url.searchParams.set("returnTo", redirectTo);
  window.location.href = url.toString();
}
