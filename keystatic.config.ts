import { config, collection, fields } from "@keystatic/core";

export default config({
  storage: {
    kind: "github",
    repo: { owner: "wimxwim", name: "ahmad-katsiri-agung" },
  },
  collections: {
    materi: collection({
      label: "Bab Materi",
      slugField: "title",
      path: "content/materi/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({ name: { label: "Judul Bab" } }),
        kelas: fields.select({
          label: "Kelas",
          options: [
            { value: "7", label: "Kelas 7" },
            { value: "8", label: "Kelas 8" },
            { value: "9", label: "Kelas 9" },
          ],
          defaultValue: "7",
        }),
        bab: fields.number({ label: "Urutan Bab" }),
        babLabel: fields.select({
          label: "Label",
          options: [
            { value: "AKIDAH", label: "AKIDAH" },
            { value: "AKHLAK", label: "AKHLAK" },
          ],
          defaultValue: "AKHLAK",
        }),
        ringkasan: fields.text({ label: "Ringkasan", multiline: true }),
        subTopik: fields.number({ label: "Jumlah Sub Topik" }),
        waktuBaca: fields.text({ label: "Waktu Baca" }),
        icon: fields.text({ label: "Icon (emoji)" }),
        videoUrl: fields.url({ label: "Video YouTube URL" }),
        soalUrl: fields.url({ label: "URL Naskah Soal PDF" }),
        gameUrl: fields.url({ label: "URL Game Terkait" }),
        pendahuluan: fields.text({ label: "Pendahuluan", multiline: true }),
        konten: fields.array(
          fields.object({
            judul: fields.text({ label: "Judul Sub Topik" }),
            isi: fields.text({ label: "Isi Konten", multiline: true }),
          }),
          { label: "Sub Topik", itemLabel: (p) => p.fields.judul.value || "Sub Topik" },
        ),
        dalil: fields.object(
          {
            surah: fields.text({ label: "Surah" }),
            arab: fields.text({ label: "Teks Arab", multiline: true }),
            arti: fields.text({ label: "Terjemahan", multiline: true }),
          },
          { label: "Dalil" },
        ),
        dimensi: fields.array(
          fields.object({
            nomor: fields.number({ label: "Nomor" }),
            judul: fields.text({ label: "Judul Dimensi" }),
            deskripsi: fields.text({ label: "Deskripsi", multiline: true }),
          }),
          { label: "Dimensi Deep Learning", itemLabel: (p) => p.fields.judul.value || "Dimensi" },
        ),
        poinPenting: fields.array(fields.text({ label: "Poin" }), {
          label: "Poin Penting",
          itemLabel: (p) => (p.value || "").slice(0, 40) || "Poin",
        }),
        prevSlug: fields.text({ label: "Prev Slug" }),
        prevTitle: fields.text({ label: "Prev Title" }),
        nextSlug: fields.text({ label: "Next Slug" }),
        nextTitle: fields.text({ label: "Next Title" }),
      },
    }),
  },
});
