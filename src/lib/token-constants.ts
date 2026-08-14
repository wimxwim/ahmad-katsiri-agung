export const GENERATE_COST = 85;

/** Dynamic Pricing: 1.000% margin */
export const API_INPUT_COST_PER_TOKEN = 0.001232;
export const API_OUTPUT_COST_PER_TOKEN = 0.002464;
export const MARGIN_MULTIPLIER = 11.5;
export const MIN_GENERATE_CHARGE = 50;
export const MAX_GENERATE_CHARGE = 500;
export const ESTIMATED_OUTPUT_TOKENS = 3000;
export const CHARS_PER_TOKEN_ESTIMATE = 4;

export const TOPUP_PLANS = [
  { id: "5k", amount: 5000, label: "Rp5.000", value: 5000 },
  { id: "10k", amount: 10000, label: "Rp10.000", value: 10000 },
  { id: "20k", amount: 20000, label: "Rp20.000", value: 20000 },
  { id: "50k", amount: 50000, label: "Rp50.000", value: 50000 },
  { id: "100k", amount: 100000, label: "Rp100.000", value: 100000 },
  { id: "200k", amount: 200000, label: "Rp200.000", value: 200000 },
  { id: "500k", amount: 500000, label: "Rp500.000", value: 500000 },
] as const;

export const MIN_TOPUP = 5000;
// trial Rp1k — MIN_TOPUP 5000 tetap untuk production, tapi trial 1k bisa diaktifkan via env FREE_GENERATE_MODE atau promo code. Jangan turunkan tanpa verifikasi Midtrans.
export const MAX_TOPUP = 1000000;
export const MAX_TOPUP_PER_DAY = 5;

/**
 * Free tier: setiap pengguna baru mendapatkan Rp2.000 (2000 token) gratis.
 * 1 token = Rp1. Biaya per generate AI bervariasi sesuai panjang dokumen.
 * ~20+ generate gratis dengan saldo awal.
 * Trial Rp1k: untuk testing, bisa topup 1000 via custom amount jika FREE_GENERATE_MODE off tapi promo aktif.
 */
export const INITIAL_TOKEN_BALANCE = 2000;

export const FREE_TIER_UPLOAD_LIMIT = 15;
export const FREE_TIER_COURSE_LIMIT = 15;
export const DAILY_GENERATE_LIMIT = 5;

/** Premium: user yang sudah top-up (isUnlocked = true) dapat 20 generate/hari. */
export const PREMIUM_DAILY_GENERATE_LIMIT = 20;
