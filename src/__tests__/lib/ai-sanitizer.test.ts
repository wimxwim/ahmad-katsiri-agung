import { describe, it, expect } from "vitest";
import { sanitizeRichText, parseMateriSafe, parseQuizSafe, parseSoalSafe } from "@/lib/ai-sanitizer";

describe("ai-sanitizer", () => {
  describe("sanitizeRichText", () => {
    it("mengizinkan tag HTML aman", () => {
      const input = "<p><b>Judul</b> dan <i>teks</i> biasa</p>";
      const result = sanitizeRichText(input);
      expect(result).toContain("<p>");
      expect(result).toContain("<b>");
      expect(result).toContain("<i>");
      expect(result).not.toContain("script");
    });

    it("menghapus script tag", () => {
      const input = "<script>alert('xss')</script><p>aman</p>";
      const result = sanitizeRichText(input);
      expect(result).not.toContain("script");
      expect(result).not.toContain("alert");
      expect(result).toContain("<p>");
    });

    it("menghapus iframe", () => {
      const input = "<iframe src='evil.com'></iframe><p>aman</p>";
      const result = sanitizeRichText(input);
      expect(result).not.toContain("iframe");
      expect(result).toContain("<p>");
    });

    it("menghapus event handler inline", () => {
      const input = "<p onclick='alert(1)'>klik</p>";
      const result = sanitizeRichText(input);
      expect(result).not.toContain("onclick");
    });

    it("menghapus protocol berbahaya di href", () => {
      const input = "<a href='javascript:alert(1)'>link</a>";
      const result = sanitizeRichText(input);
      expect(result).not.toContain("javascript");
    });

    it("mengembalikan string kosong untuk non-string", () => {
      expect(sanitizeRichText(null)).toBe("");
      expect(sanitizeRichText(undefined)).toBe("");
      expect(sanitizeRichText(123)).toBe("");
    });
  });

  describe("parseMateriSafe", () => {
    it("memparse JSON valid", () => {
      const input = JSON.stringify({
        judul: "Bab 1 Akidah",
        ringkasan: "Ringkasan singkat tentang materi akidah Islam",
        pendahuluan: "Pendahuluan materi akidah Islam untuk siswa SMP",
        konten: [{ judul: "Bagian 1", isi: "Isi materi tentang akidah Islam yang cukup panjang" }],
        poinPenting: ["Poin penting pertama"],
      });
      const result = parseMateriSafe(input);
      expect(result).not.toBeNull();
      expect(result!.judul).toBe("Bab 1 Akidah");
    });

    it("menolak judul terlalu pendek", () => {
      const input = JSON.stringify({
        judul: "AB",
        ringkasan: "Ringkasan singkat tentang materi akidah Islam",
        pendahuluan: "Pendahuluan materi akidah Islam untuk siswa SMP",
        konten: [{ judul: "Bagian 1", isi: "Isi materi tentang akidah Islam yang cukup panjang" }],
        poinPenting: ["Poin penting pertama"],
      });
      const result = parseMateriSafe(input);
      expect(result).toBeNull();
    });

    it("menolak konten terlalu pendek", () => {
      const input = JSON.stringify({
        judul: "Bab 1",
        ringkasan: "Ringkasan singkat",
        pendahuluan: "Pendahuluan yang terlalu pendek",
        konten: [{ judul: "A", isi: "pendek" }],
        poinPenting: ["Poin"],
      });
      const result = parseMateriSafe(input);
      expect(result).toBeNull();
    });

    it("mengekstrak JSON dari markdown fence", () => {
      const input = '```json\n' + JSON.stringify({
        judul: "Bab 1 Akidah",
        ringkasan: "Ringkasan singkat tentang materi akidah Islam",
        pendahuluan: "Pendahuluan materi akidah Islam untuk siswa SMP",
        konten: [{ judul: "Bagian 1", isi: "Isi materi tentang akidah Islam yang cukup panjang" }],
        poinPenting: ["Poin penting pertama"],
      }) + '\n```';
      const result = parseMateriSafe(input);
      expect(result).not.toBeNull();
      expect(result!.judul).toBe("Bab 1 Akidah");
    });

    it("mengembalikan null untuk JSON invalid", () => {
      expect(parseMateriSafe("invalid")).toBeNull();
      expect(parseMateriSafe("")).toBeNull();
    });
  });

  describe("parseQuizSafe", () => {
    it("memparse quiz valid", () => {
      const input = JSON.stringify({
        judul: "Quiz Bab 1",
        soal: [
          { pertanyaan: "Apa itu?", tipe: "PG", opsi: { A: "Jawaban A", B: "Jawaban B", C: "Jawaban C", D: "Jawaban D" }, kunci: "A" },
        ],
      });
      const result = parseQuizSafe(input);
      expect(result).not.toBeNull();
      expect(result!.soal).toHaveLength(1);
    });

    it("menormalisasi tipe soal dari bahasa Indonesia", () => {
      const input = JSON.stringify({
        judul: "Quiz Bab 1",
        soal: [{ pertanyaan: "Apakah makna dari akidah Islam?", tipe: "Pilihan Ganda", opsi: { A: "Keyakinan", B: "Ibadah", C: "Muamalah", D: "Akhlak" }, kunci: "A" }],
      });
      const result = parseQuizSafe(input);
      expect(result).not.toBeNull();
      expect(result!.soal[0].tipe).toBe("PG");
    });

    it("menolak quiz tanpa soal", () => {
      const input = JSON.stringify({ judul: "Quiz", soal: [] });
      const result = parseQuizSafe(input);
      expect(result).toBeNull();
    });
  });

  describe("parseSoalSafe", () => {
    it("memparse bank soal valid", () => {
      const input = JSON.stringify({
        soal: [
          { pertanyaan: "Soal 1", tipe: "PG", opsi: { A: "A", B: "B", C: "C", D: "D" }, kunci: "B" },
          { pertanyaan: "Soal 2", tipe: "ISIAN", kunci: "jawaban" },
        ],
      });
      const result = parseSoalSafe(input);
      expect(result).not.toBeNull();
      expect(result!.soal).toHaveLength(2);
    });

    it("memparse array soal dengan wrapper", () => {
      const input = JSON.stringify({
        soal: [
          { pertanyaan: "Soal esai", tipe: "ESSAY", kunci: "Jawaban esai yang benar" },
        ],
      });
      const result = parseSoalSafe(input);
      expect(result).not.toBeNull();
      expect(result!.soal).toHaveLength(1);
    });
  });
});