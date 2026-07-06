---
name: privacy-policy
description: Generator halaman Kebijakan Privasi dalam Bahasa Indonesia — sesuai UU PDP, siap edit dan tempel di website klien.
metadata:
  author: Agensi
  version: "2.0"
  category: Compliance
---

# PRIVACY POLICY — Generator Kebijakan Privasi

## Template Lengkap (salin ke `app/kebijakan-privasi/page.tsx`)

```tsx
export default function KebijakanPrivasi() {
  const domain = "domain-klien.com";
  const wa = "62812xxxxxxx";
  const email = "email@domain.com";
  const tanggal = "25 Juni 2026";

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 prose">
      <h1>Kebijakan Privasi</h1>
      <p className="text-gray-500">Terakhir diperbarui: {tanggal}</p>

      <h2>1. Pendahuluan</h2>
      <p>
        Kebijakan privasi ini menjelaskan bagaimana <strong>{domain}</strong> mengumpulkan,
        menggunakan, dan melindungi data pribadi Anda sesuai dengan Undang-Undang
        Perlindungan Data Pribadi (UU No. 27/2022) dan peraturan terkait di Indonesia.
      </p>

      <h2>2. Data yang Dikumpulkan</h2>
      <p>Kami dapat mengumpulkan data berikut:</p>
      <ul>
        <li><strong>Data yang Anda berikan:</strong> nama, nomor WhatsApp, alamat email, pesan yang Anda kirim melalui form kontak</li>
        <li><strong>Data otomatis:</strong> alamat IP, tipe peramban, halaman yang dikunjungi, durasi kunjungan (via Google Analytics)</li>
        <li><strong>Cookie:</strong> cookie teknis untuk fungsi website dan cookie analytics (dengan persetujuan Anda)</li>
      </ul>

      <h2>3. Tujuan Penggunaan Data</h2>
      <ul>
        <li>Merespon pertanyaan dan pesan dari Anda</li>
        <li>Meningkatkan kualitas dan pengalaman website</li>
        <li>Menganalisis traffic dan pola penggunaan</li>
        <li>Memenuhi kewajiban hukum jika diperlukan</li>
      </ul>

      <h2>4. Dasar Hukum Pemrosesan</h2>
      <p>Kami memproses data Anda berdasarkan:</p>
      <ul>
        <li>Persetujuan Anda (cookie analytics)</li>
        <li>Kepentingan sah untuk merespon pertanyaan Anda</li>
        <li>Kewajiban hukum jika diperlukan</li>
      </ul>

      <h2>5. Penyimpanan Data</h2>
      <p>
        Data Anda disimpan di server Cloudflare dan Supabase yang aman.
        Kami menyimpan data selama diperlukan untuk tujuan yang disebutkan di atas,
        atau selama diwajibkan oleh hukum yang berlaku.
      </p>

      <h2>6. Hak Anda</h2>
      <p>Berdasarkan UU PDP, Anda memiliki hak:</p>
      <ul>
        <li>Mengetahui data apa yang kami kumpulkan</li>
        <li>Meminta akses ke data pribadi Anda</li>
        <li>Memperbaiki data yang tidak akurat</li>
        <li>Menghapus data Anda (hak untuk dilupakan)</li>
        <li>Menolak pemrosesan data untuk tujuan tertentu</li>
        <li>Menarik persetujuan cookie kapan saja</li>
        <li>Mengajukan keluhan ke lembaga pengawas</li>
      </ul>

      <h2>7. Keamanan Data</h2>
      <p>
        Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai
        untuk melindungi data Anda, termasuk enkripsi SSL/TLS, akses terbatas,
        dan firewall.
      </p>

      <h2>8. Pihak Ketiga</h2>
      <p>Kami menggunakan layanan pihak ketiga berikut:</p>
      <ul>
        <li><strong>Google Analytics</strong> — analisis traffic (dengan persetujuan cookie)</li>
        <li><strong>Cloudflare</strong> — CDN dan keamanan</li>
        <li><strong>Supabase</strong> — database dan hosting</li>
      </ul>
      <p>Masing-masing pihak ketiga memiliki kebijakan privasi mereka sendiri.</p>

      <h2>9. Perubahan Kebijakan</h2>
      <p>
        Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan
        di halaman ini dengan tanggal revisi terbaru.
      </p>

      <h2>10. Kontak</h2>
      <p>
        Untuk pertanyaan atau permintaan terkait data pribadi Anda,
        hubungi kami melalui:
      </p>
      <ul>
        <li>WhatsApp: <a href={`https://wa.me/${wa}`}>{wa}</a></li>
        <li>Email: {email}</li>
      </ul>
    </article>
  );
}
```

## Catatan UU PDP 2026
UU PDP sudah berlaku PENUH sejak 17 Oktober 2024.

Privacy Policy WAJIB mencakup:
1. Data apa yang dikumpulkan
2. Tujuan pemrosesan
3. Hak subjek data (akses, koreksi, hapus, portabilitas)
4. Jangka waktu penyimpanan
5. Pengaduan ke Lembaga PDP

Cross-border transfer: data pribadi boleh dikirim ke luar negeri hanya jika negara tujuan punya level perlindungan setara.

## Template Hak Subjek Data
```tsx
<h2>Hak Subjek Data berdasarkan UU PDP</h2>
<ul>
  <li>Hak untuk mengetahui data yang dikumpulkan</li>
  <li>Hak mengakses data pribadi</li>
  <li>Hak memperbaiki data yang tidak akurat</li>
  <li>Hak menghapus data (right to be forgotten)</li>
  <li>Hak membatasi pemrosesan</li>
  <li>Hak portabilitas data</li>
  <li>Hak menolak pemrosesan</li>
  <li>Hak mengajukan pengaduan ke Lembaga PDP</li>
</ul>
```

## Cara Pakai
1. Ganti variabel: domain, WA, email, tanggal
2. Simpan di `app/kebijakan-privasi/page.tsx`
3. Tambah link di footer
4. Link dari cookie consent banner
