export const mockGuru = {
  id: "g1",
  nama: "Ahmad Katsiri Agung, S.Pd.",
  email: "guru@akalcenter.my.id",
  role: "GURU" as const,
};

export const mockKursus = [
  {
    id: "k1",
    nama: "Akidah Akhlak Kelas 7",
    deskripsi: "Pembelajaran Aqidah Akhlaq untuk SMP/MTs Kelas 7 — Semester 1 & 2",
    kelas: "7",
    jumlahSiswa: 45,
    jumlahMateri: 5,
    status: "AKTIF" as const,
    createdAt: "2026-01-15",
    updatedAt: "2026-06-20",
    coverColor: "#005231",
  },
  {
    id: "k2",
    nama: "Akidah Akhlak Kelas 8",
    deskripsi: "Pembelajaran Aqidah Akhlaq untuk SMP/MTs Kelas 8 — Semester 1 & 2",
    kelas: "8",
    jumlahSiswa: 38,
    jumlahMateri: 5,
    status: "AKTIF" as const,
    createdAt: "2026-01-15",
    updatedAt: "2026-06-18",
    coverColor: "#5a4200",
  },
  {
    id: "k3",
    nama: "Akidah Akhlak Kelas 9",
    deskripsi: "Pembelajaran Aqidah Akhlaq untuk SMP/MTs Kelas 9 — Semester 1 & 2",
    kelas: "9",
    jumlahSiswa: 32,
    jumlahMateri: 4,
    status: "AKTIF" as const,
    createdAt: "2026-01-15",
    updatedAt: "2026-05-30",
    coverColor: "#1b6b45",
  },
];

export const mockSiswa = [
  { id: "s1", nama: "Aisyah Putri", kelas: "7A", noAbsen: "01", nis: "2026001" },
  { id: "s2", nama: "Muhammad Rizky", kelas: "7A", noAbsen: "02", nis: "2026002" },
  { id: "s3", nama: "Fatimah Azzahra", kelas: "7B", noAbsen: "03", nis: "2026003" },
  { id: "s4", nama: "Ahmad Fauzan", kelas: "7B", noAbsen: "04", nis: "2026004" },
  { id: "s5", nama: "Nurul Hidayah", kelas: "7A", noAbsen: "05", nis: "2026005" },
  { id: "s6", nama: "Rafi Aditya", kelas: "8A", noAbsen: "01", nis: "2025001" },
  { id: "s7", nama: "Siti Khadijah", kelas: "8A", noAbsen: "02", nis: "2025002" },
  { id: "s8", nama: "Hasan Basri", kelas: "8B", noAbsen: "03", nis: "2025003" },
  { id: "s9", nama: "Zainab Nur", kelas: "9A", noAbsen: "01", nis: "2024001" },
  { id: "s10", nama: "Umar Faruq", kelas: "9A", noAbsen: "02", nis: "2024002" },
];

export const mockNilai = [
  { id: "n1", siswaId: "s1", kursusId: "k1", judulQuiz: "Iman Kepada Malaikat", skor: 85, totalSoal: 10, tanggal: "2026-02-10" },
  { id: "n2", siswaId: "s1", kursusId: "k1", judulQuiz: "Tabayyun & Ghibah", skor: 90, totalSoal: 10, tanggal: "2026-03-15" },
  { id: "n3", siswaId: "s1", kursusId: "k1", judulQuiz: "Salat & Akhlak", skor: 78, totalSoal: 10, tanggal: "2026-04-20" },
  { id: "n4", siswaId: "s2", kursusId: "k1", judulQuiz: "Iman Kepada Malaikat", skor: 70, totalSoal: 10, tanggal: "2026-02-10" },
  { id: "n5", siswaId: "s2", kursusId: "k1", judulQuiz: "Tabayyun & Ghibah", skor: 65, totalSoal: 10, tanggal: "2026-03-15" },
  { id: "n6", siswaId: "s3", kursusId: "k1", judulQuiz: "Iman Kepada Malaikat", skor: 95, totalSoal: 10, tanggal: "2026-02-10" },
  { id: "n7", siswaId: "s4", kursusId: "k1", judulQuiz: "Iman Kepada Malaikat", skor: 60, totalSoal: 10, tanggal: "2026-02-10" },
  { id: "n8", siswaId: "s6", kursusId: "k2", judulQuiz: "Iman Kepada Kitab Allah", skor: 88, totalSoal: 10, tanggal: "2026-02-12" },
  { id: "n9", siswaId: "s7", kursusId: "k2", judulQuiz: "Iman Kepada Kitab Allah", skor: 72, totalSoal: 10, tanggal: "2026-02-12" },
  { id: "n10", siswaId: "s9", kursusId: "k3", judulQuiz: "Qada & Qadar", skor: 82, totalSoal: 10, tanggal: "2026-03-01" },
];

export const mockStats = {
  totalKursus: 3,
  totalSiswa: 115,
  totalQuizSelesai: 340,
  rataRataSkor: 78,
  siswaAktif: 89,
  materiTerupload: 14,
};
