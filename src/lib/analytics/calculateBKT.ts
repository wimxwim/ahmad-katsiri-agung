export interface BKTParams {
  pT: number;
  pG: number;
  pS: number;
}

export function updateBKT(
  prevP: number,
  isCorrect: boolean,
  params: BKTParams = { pT: 0.3, pG: 0.2, pS: 0.1 }
): number {
  const { pG, pS } = params;

  if (isCorrect) {
    const numerator = prevP * (1 - pS);
    const denominator = numerator + (1 - prevP) * pG;
    if (Math.abs(denominator) < 1e-10) return prevP;
    return numerator / denominator;
  }

  const numerator = prevP * pS;
  const denominator = numerator + (1 - prevP) * (1 - pG);
  if (Math.abs(denominator) < 1e-10) return prevP;
  return numerator / denominator;
}

export function slipForward(prevP: number, pT: number = 0.3): number {
  return prevP + (1 - prevP) * pT;
}

export function getMasteryLabel(pL: number): "dikuasai" | "dalam_proses" | "belum_dikuasai" {
  if (pL >= 0.8) return "dikuasai";
  if (pL >= 0.6) return "dalam_proses";
  return "belum_dikuasai";
}
