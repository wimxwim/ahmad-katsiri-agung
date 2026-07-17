export const FREE_TIER = {
  INITIAL_BALANCE: 10000,
  GENERATE_COST: 85,
  FREE_GENERATIONS: Math.floor(10000 / 85),
  UPLOAD_LIMIT: 15,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  DAILY_GENERATE_LIMIT: 5,
} as const;

export function getFreeTierSummary() {
  return {
    rupiah: FREE_TIER.INITIAL_BALANCE.toLocaleString("id-ID"),
    gratis: FREE_TIER.FREE_GENERATIONS,
    biayaPerGenerate: FREE_TIER.GENERATE_COST,
    uploadGratis: FREE_TIER.UPLOAD_LIMIT,
  };
}