---
name: social-media-embed
description: Integrasi feed media sosial ke website klien — Instagram, TikTok, YouTube, Facebook. Mencakup embed, API fetch, grid galeri, dan best practices performa.
metadata:
  author: Agensi
  version: "2.0"
  category: Konten
---

# SOCIAL MEDIA EMBED — Feed Medsos di Website

## Instagram Embed

**Instagram embed: API masih gratis, perlu access token.**

### Opsi 1: Instagram oEmbed (gratis, resmi)
```tsx
// components/InstagramEmbed.tsx
<blockquote
  className="instagram-media"
  data-instgrm-permalink="https://www.instagram.com/p/POST_ID/"
  data-instgrm-version="14"
/>
<Script async src="//www.instagram.com/embed.js" />
```
**Catatan:** layout shift — beri placeholder height.

### Opsi 2: Instagram Graph API (untuk galeri feed)
```tsx
// app/api/instagram/route.ts
export async function GET() {
  const token = process.env.INSTAGRAM_TOKEN;
  const res = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink&access_token=${token}`
  );
  return Response.json(await res.json());
}
```

## Facebook Embed

**Facebook embed: plugin page masih gratis.**

```tsx
<iframe
  src="https://www.facebook.com/plugins/page.php?href=URL_FACEBOOK_PAGE"
  width="340"
  height="500"
  style={{ border: "none", overflow: "hidden" }}
  allowFullScreen
  loading="lazy"
/>
```

## TikTok Embed

**TikTok embed: widget embed.js gratis.**

```tsx
<iframe
  src="https://www.tiktok.com/embed/v2/VIDEO_ID"
  width="325"
  height="580"
  allowFullScreen
/>
```
Dapatkan VIDEO_ID dari URL TikTok: `https://www.tiktok.com/@user/video/VIDEO_ID`

## YouTube Embed (Best Practice)

**YouTube embed: iframe + lite-youtube (untuk performa).**

```tsx
<iframe
  src={`https://www.youtube.com/embed/${VIDEO_ID}`}
  title="Video"
  width="100%"
  style={{ aspectRatio: "16/9" }}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen"
  loading="lazy"
/>
```

## Grid Galeri (Untuk Landing Page)

```tsx
// components/SocialGallery.tsx
const posts = [
  { src: "/ig-1.jpg", link: "https://instagram.com/p/..." },
  { src: "/ig-2.jpg", link: "..." },
  { src: "/ig-3.jpg", link: "..." },
];

export default function SocialGallery() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {posts.map((post, i) => (
        <a key={i} href={post.link} target="_blank" rel="noopener noreferrer" className="aspect-square overflow-hidden rounded-lg">
          <Image src={post.src} alt="" width={400} height={400} className="object-cover hover:scale-105 transition" />
        </a>
      ))}
    </div>
  );
}
```

## Best Practices Performa
- **Jangan embed langsung dari Instagram/TikTok JS** — berat, banyak request
- **Alternatif:** screenshot/gambar feed, link ke profil
- **Alternatif:** API fetch → tampilkan grid gambar + link
- Beri `loading="lazy"` untuk semua iframe
- Beri placeholder height untuk hindari CLS
- Gunakan `aspect-ratio` CSS untuk iframe responsive
- **Jangan blocking LCP** — lazy load semua embed

## Cara Pakai
1. Tentukan platform mana yang dipakai klien (IG, TikTok, YouTube)
2. Pilih metode embed (langsung atau API)
3. Integrasikan ke halaman yang diminta
4. Test loading time
