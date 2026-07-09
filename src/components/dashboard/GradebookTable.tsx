interface SiswaRow {
  nama: string;
  kelas: string;
  nis?: string | null;
  skorRataRata: number;
}

interface GradebookTableProps {
  siswa: SiswaRow[];
  quizzes: string[];
  siswaQuizMap: Map<string, Map<string, number>>;
}

export function GradebookTable({ siswa, quizzes, siswaQuizMap }: GradebookTableProps) {
  if (siswa.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        Belum ada data nilai.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-precision">
            <th className="text-left py-3 px-4 font-semibold text-on-surface sticky left-0 bg-white/80 backdrop-blur-sm z-10">
              Nama Siswa
            </th>
            <th className="text-left py-3 px-4 font-semibold text-on-surface">Kelas</th>
            <th className="text-left py-3 px-4 font-semibold text-on-surface">NIS</th>
            {quizzes.map((quiz) => (
              <th key={quiz} className="text-center py-3 px-4 font-semibold text-on-surface whitespace-nowrap">
                {quiz.length > 20 ? quiz.slice(0, 20) + "..." : quiz}
              </th>
            ))}
            <th className="text-center py-3 px-4 font-semibold text-on-surface">Rata-rata</th>
          </tr>
        </thead>
        <tbody>
          {siswa.map((s, i) => {
            const quizScores = siswaQuizMap.get(s.nama);
            let total = 0;
            let count = 0;
            if (quizScores) {
              for (const [, score] of quizScores) {
                total += score;
                count++;
              }
            }
            const avg = count > 0 ? total / count : 0;

            return (
              <tr key={i} className="border-b border-primary/5 hover:bg-primary/[0.02]">
                <td className="py-3 px-4 font-medium text-on-surface sticky left-0 bg-white/80 backdrop-blur-sm z-10">
                  {s.nama}
                </td>
                <td className="py-3 px-4 text-on-surface-variant">{s.kelas}</td>
                <td className="py-3 px-4 text-on-surface-variant">{s.nis || "-"}</td>
                {quizzes.map((quiz) => {
                  const score = quizScores?.get(quiz);
                  const scoreColor =
                    score === undefined
                      ? "text-on-surface-variant/40"
                      : score >= 85
                      ? "text-green-600"
                      : score >= 70
                      ? "text-amber-600"
                      : "text-red-600";
                  return (
                    <td key={quiz} className={`py-3 px-4 text-center font-medium ${scoreColor}`}>
                      {score !== undefined ? `${score}%` : "-"}
                    </td>
                  );
                })}
                <td
                  className={`py-3 px-4 text-center font-bold ${
                    avg >= 85 ? "text-green-600" : avg >= 70 ? "text-amber-600" : "text-red-600"
                  }`}
                >
                  {avg > 0 ? `${Math.round(avg)}%` : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
