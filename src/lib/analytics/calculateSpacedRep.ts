export function calculateNextReview(
  qualityScore: number,
  prevInterval: number,
  prevEF: number,
  repetitionNumber: number
): { nextInterval: number; newEF: number; nextDate: Date } {
  let newEF = prevEF + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let nextInterval: number;
  if (qualityScore < 3) {
    nextInterval = 1;
  } else if (repetitionNumber === 1) {
    nextInterval = 1;
  } else if (repetitionNumber === 2) {
    nextInterval = 6;
  } else {
    nextInterval = Math.round(prevInterval * newEF);
  }

  if (nextInterval > 180) nextInterval = 180;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextInterval);

  return { nextInterval, newEF, nextDate };
}
