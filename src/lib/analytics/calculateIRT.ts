export interface IRTParams {
  a: number;
  b: number;
  c: number;
}

export function irt3PL(theta: number, a: number, b: number, c: number): number {
  const exponent = -a * (theta - b);
  return c + (1 - c) / (1 + Math.exp(exponent));
}

export function estimateTheta(
  responsePattern: { a: number; b: number; c: number; correct: boolean }[]
): number {
  let theta = 0;
  for (let iter = 0; iter < 30; iter++) {
    let numerator = 0;
    let denominator = 0;
    for (const r of responsePattern) {
      const p = irt3PL(theta, r.a, r.b, r.c);
      const q = 1 - p;
      const w = p * q;
      numerator += r.a * (r.correct ? q : -p) * (r.correct ? 1 / p : 1 / q);
      denominator += -r.a * r.a * w * (r.correct ? 1 / (p * p) : 1 / (q * q));
    }
    if (Math.abs(denominator) < 1e-10) break;
    theta -= numerator / denominator;
  }
  return theta;
}
