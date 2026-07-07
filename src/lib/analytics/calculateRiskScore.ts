export interface RiskMetrics {
  completionRate: number;
  quizPerformance: number;
  attendanceRate: number;
  loginGap: number;
  timelinessRate: number;
  participationRate: number;
}

export function calculateRiskScore(metrics: RiskMetrics): number {
  const L = Math.min(metrics.loginGap / 30, 1);

  const rawRisk =
    0.25 * (1 - metrics.completionRate) +
    0.25 * (1 - metrics.quizPerformance) +
    0.15 * (1 - metrics.attendanceRate) +
    0.10 * L +
    0.15 * (1 - metrics.timelinessRate) +
    0.10 * (1 - metrics.participationRate);

  const z = (rawRisk - 0.5) * 5;
  return 1 / (1 + Math.exp(-z));
}

export function getRiskLabel(riskScore: number): string {
  if (riskScore <= 0.3) return "aman";
  if (riskScore <= 0.5) return "pantau";
  if (riskScore <= 0.7) return "berisiko";
  return "kritis";
}
