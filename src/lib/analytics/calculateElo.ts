export function updateElo(
  ratingSiswa: number,
  ratingSoal: number,
  isCorrect: boolean,
  kFactor: number = 32
): { newRatingSiswa: number; newRatingSoal: number } {
  const expectedSiswa = 1 / (1 + Math.pow(10, (ratingSoal - ratingSiswa) / 400));
  const actualScore = isCorrect ? 1 : 0;
  const delta = kFactor * (actualScore - expectedSiswa);

  return {
    newRatingSiswa: ratingSiswa + delta,
    newRatingSoal: ratingSoal - delta,
  };
}
