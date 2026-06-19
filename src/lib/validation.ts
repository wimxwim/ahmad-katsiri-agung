import { z } from "zod";

export const LoginMuridSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi").max(100),
  kelas: z.string().min(1, "Kelas harus diisi").max(10),
  noAbsen: z.string().min(1, "No. Absen harus diisi").max(5),
  nis: z.string().max(30).optional().default(""),
  sekolah: z.string().max(100).optional().default(""),
});

export const LoginGuruSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi").max(100),
  password: z.string().min(1, "Kata sandi harus diisi"),
});

export const DoaSchema = z.object({
  nama: z.string().max(60).optional().default("Anonim"),
  isi: z
    .string()
    .min(1, "Isi doa tidak boleh kosong")
    .max(400, "Maksimal 400 karakter"),
});

export const SiswaCekSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir harus diisi"),
});

const JawabanSalahSchema = z.object({
  nomor: z.number().int().positive(),
  pertanyaan: z.string().max(500),
  jawabanSiswa: z.string().max(500),
  kunciJawaban: z.string().max(500),
});

export const KuisSelesaiSchema = z.object({
  namaSiswa: z.string().min(1),
  kelas: z.string(),
  status: z.enum(["resmi", "latihan"]),
  judulBab: z.string(),
  slugBab: z.string(),
  skor: z.number().int().min(0),
  totalSoal: z.number().int().positive(),
  jawabanSalah: z.array(JawabanSalahSchema).max(50),
});
