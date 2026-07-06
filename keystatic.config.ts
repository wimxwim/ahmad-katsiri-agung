import { config, collection, singleton, fields } from "@keystatic/core";

const isGithub = process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND === "github";

export default config({
  storage: isGithub
    ? {
        kind: "github",
        repo: "wimxwim/ahmad-katsiri-agung",
        branchPrefix: "cms/",
      }
    : { kind: "local" },
  collections: {
    materi: collection({
      label: "Bab Materi",
      slugField: "title",
      path: "content/materi/*/",
      format: { data: "json" },
      columns: ["title", "kelas", "bab"],
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
        pdfUrl: fields.file({ label: "Upload Modul Ajar PDF", publicPath: "/api/assets" }),
        pptUrl: fields.file({ label: "Upload Slide PPT", publicPath: "/api/assets" }),
        soalUrl: fields.file({ label: "Upload Naskah Soal PDF", publicPath: "/api/assets" }),
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
    soal: collection({
      label: "Bank Soal",
      slugField: "title",
      path: "content/soal/*/",
      format: { data: "json" },
      columns: ["title", "kelas", "bab"],
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
        soal: fields.array(
          fields.object({
            nomor: fields.number({ label: "Nomor Soal" }),
            pertanyaan: fields.text({ label: "Pertanyaan", multiline: true }),
            opsiA: fields.text({ label: "Opsi A" }),
            opsiB: fields.text({ label: "Opsi B" }),
            opsiC: fields.text({ label: "Opsi C" }),
            opsiD: fields.text({ label: "Opsi D" }),
            opsiE: fields.text({ label: "Opsi E (opsional)" }),
            jawaban: fields.select({
              label: "Kunci Jawaban",
              options: [
                { value: "A", label: "A" },
                { value: "B", label: "B" },
                { value: "C", label: "C" },
                { value: "D", label: "D" },
                { value: "E", label: "E" },
              ],
              defaultValue: "A",
            }),
          }),
          { label: "Soal", itemLabel: (p) => `Soal ${p.fields.nomor.value}` || "Soal" },
        ),
      },
    }),
    game: collection({
      label: "Game Edukasi",
      slugField: "judul",
      path: "content/game/*/",
      format: { data: "json" },
      columns: ["judul", "badge"],
      schema: {
        judul: fields.slug({ name: { label: "Judul Game" } }),
        desc: fields.text({ label: "Deskripsi", multiline: true }),
        url: fields.url({ label: "URL Game (Canva)" }),
        badge: fields.select({
          label: "Badge",
          options: [
            { value: "EKSTERNAL", label: "EKSTERNAL" },
            { value: "INTERNAL", label: "INTERNAL" },
          ],
          defaultValue: "EKSTERNAL",
        }),
        image: fields.text({ label: "Path Gambar Cover (WebP)" }),
      },
    }),
    hadits: collection({
      label: "Koleksi Hadits",
      slugField: "slug",
      path: "content/hadits/*/",
      format: { data: "json" },
      columns: ["sumber", "teks"],
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        sumber: fields.text({ label: "Sumber Hadits" }),
        teks: fields.text({ label: "Teks Hadits", multiline: true }),
      },
    }),
  },
  singletons: {
    navigation: singleton({
      label: "Navigasi & Footer",
      path: "content/navigation/",
      format: { data: "json" },
      schema: {
        navbarItems: fields.array(
          fields.object({
            href: fields.text({ label: "URL" }),
            label: fields.text({ label: "Label" }),
          }),
          { label: "Navbar Items (maksimal 8 item)", itemLabel: (p) => p.fields.label.value || "Item" },
        ),
        bottomTabs: fields.array(
          fields.object({
            href: fields.text({ label: "URL" }),
            label: fields.text({ label: "Label" }),
            icon: fields.text({ label: "Nama Icon (lucide-react)" }),
          }),
          { label: "Bottom Tab Items", itemLabel: (p) => p.fields.label.value || "Tab" },
        ),
        footerLinks: fields.array(
          fields.object({
            href: fields.text({ label: "URL" }),
            label: fields.text({ label: "Label" }),
          }),
          { label: "Footer Links", itemLabel: (p) => p.fields.label.value || "Link" },
        ),
        waNumber: fields.text({ label: "Nomor WhatsApp" }),
        igHandle: fields.text({ label: "Instagram Handle" }),
        tiktokHandle: fields.text({ label: "TikTok Handle" }),
        youtubeChannel: fields.text({ label: "Nama YouTube Channel" }),
      },
    }),
    siteConfig: singleton({
      label: "Konfigurasi Situs",
      path: "content/site-config/",
      format: { data: "json" },
      schema: {
        siteTitle: fields.text({ label: "Judul Situs" }),
        tagline: fields.text({ label: "Tagline", multiline: true }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        keywords: fields.text({ label: "Meta Keywords", multiline: true }),
        googleAnalyticsId: fields.text({ label: "Google Analytics ID" }),
      },
    }),
    about: singleton({
      label: "Halaman Tentang",
      path: "content/about/",
      format: { data: "json" },
      schema: {
        filosofi: fields.text({ label: "Filosofi", multiline: true }),
        pendiriNama: fields.text({ label: "Nama Pendiri" }),
        pendiriFoto: fields.text({ label: "Path Foto Pendiri" }),
        visi: fields.text({ label: "Visi", multiline: true }),
        misi: fields.array(fields.text({ label: "Butir Misi" }), {
          label: "Misi",
          itemLabel: (p) => (p.value || "").slice(0, 50) || "Misi",
        }),
        verifikator: fields.array(
          fields.object({
            nama: fields.text({ label: "Nama Verifikator" }),
            peran: fields.text({ label: "Peran" }),
          }),
          { label: "Tim Verifikator", itemLabel: (p) => p.fields.nama.value || "Verifikator" },
        ),
      },
    }),
    perangkatAjar: singleton({
      label: "Perangkat Ajar",
      path: "content/perangkat-ajar/",
      format: { data: "json" },
      schema: {
        items: fields.array(
          fields.object({
            kelas: fields.select({
              label: "Kelas",
              options: [
                { value: "7", label: "Kelas 7" },
                { value: "8", label: "Kelas 8" },
                { value: "9", label: "Kelas 9" },
              ],
              defaultValue: "7",
            }),
            label: fields.text({ label: "Label (PROTA/PROSEM/ATP)" }),
            file: fields.text({ label: "Path File PDF" }),
            tersedia: fields.checkbox({ label: "Tersedia", defaultValue: true }),
          }),
          { label: "Daftar Perangkat", itemLabel: (p) => `${p.fields.label.value} Kelas ${p.fields.kelas.value}` || "Item" },
        ),
      },
    }),
    pendidikPage: singleton({
      label: "Halaman Pendidik",
      path: "content/pendidik-page/",
      format: { data: "json" },
      schema: {
        featureCards: fields.array(
          fields.object({
            badge: fields.text({ label: "Badge" }),
            title: fields.text({ label: "Judul" }),
            desc: fields.text({ label: "Deskripsi", multiline: true }),
          }),
          { label: "Feature Cards", itemLabel: (p) => p.fields.title.value || "Card" },
        ),
        stats: fields.array(
          fields.object({
            value: fields.text({ label: "Nilai Statistik" }),
            label: fields.text({ label: "Label Statistik" }),
          }),
          { label: "Statistik", itemLabel: (p) => p.fields.label.value || "Stat" },
        ),
      },
    }),
  },
});
