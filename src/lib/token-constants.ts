export const GENERATE_COST = 35;

export const TOPUP_PLANS = [
  { id: "10k", amount: 10000, label: "Rp10.000", value: 10000 },
  { id: "20k", amount: 20000, label: "Rp20.000", value: 20000 },
  { id: "50k", amount: 50000, label: "Rp50.000", value: 50000 },
  { id: "100k", amount: 100000, label: "Rp100.000", value: 100000 },
] as const;

export const MIN_TOPUP = 10000;
export const MAX_TOPUP = 1000000;
export const MAX_TOPUP_PER_DAY = 5;

export const INITIAL_TOKEN_BALANCE = 10000;

export const FREE_TIER_UPLOAD_LIMIT = 15;
export const FREE_TIER_COURSE_LIMIT = 15;