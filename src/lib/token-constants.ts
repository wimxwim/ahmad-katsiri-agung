export const GENERATE_COST = 35;

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
export const MAX_TOPUP = 1000000;
export const MAX_TOPUP_PER_DAY = 5;

export const INITIAL_TOKEN_BALANCE = 10000;

export const FREE_TIER_UPLOAD_LIMIT = 15;
export const FREE_TIER_COURSE_LIMIT = 15;