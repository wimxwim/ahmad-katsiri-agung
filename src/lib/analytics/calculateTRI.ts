export interface TRIMetrics {
  materi: number;
  responsivitas: number;
  gradingSpeed: number;
  variasi: number;
  efektivitas: number;
  konsistensi: number;
}

export function calculateTRI(metrics: TRIMetrics): number {
  return (
    0.15 * metrics.materi +
    0.15 * metrics.responsivitas +
    0.15 * metrics.gradingSpeed +
    0.10 * metrics.variasi +
    0.30 * metrics.efektivitas +
    0.15 * metrics.konsistensi
  );
}

export function getTRILabel(triScore: number): string {
  if (triScore >= 0.8) return "expert";
  if (triScore >= 0.6) return "baik";
  if (triScore >= 0.4) return "perlu_perhatian";
  return "butuh_dukungan";
}
