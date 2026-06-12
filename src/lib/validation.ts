import { z } from "zod";

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
  pertanyaan: z.string(),
  jawabanSiswa: z.string(),
  kunciJawaban: z.string(),
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
  token: z.string().optional(),
});
