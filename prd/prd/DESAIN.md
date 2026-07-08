# AKAL Center — Desain System

**Versi:** 1.0
**Framework:** Tailwind CSS v4 (oklch + custom @theme)
**Untuk:** Kimi K2.7 Code — gunakan sebagai referensi saat membangun komponen UI baru

> **Prinsip Utama:** "Besar tapi ringan, kelihatan simple walau isi rumit."
> Setiap elemen visual harus elegan, premium, dan konsisten. JANGAN merombak
> design system ini. Tambahkan komponen baru dengan bahasa visual yang sama.

---

## 1. PALET WARNA

### 1.1 Primary — Hijau Gelap Premium
```
#005231          background gelap, hover strong
#006b3e          hover state ringan
#1b6b45 / 15%    border-precision (semi-transparent)
#dcfce7 / #2e7d32  surface hijau ringan
```

### 1.2 Tertiary — Gold Accent
```
#5a4200          gold dark
#775900          gold medium
#eec055 → #ffdf9b → #eec055 → #ffdf9b    shimmer gradient (90deg)
```

### 1.3 Surface & Background
```
#f2fcf7          surface utama (putih kehijauan, sangat light)
#ffffff          card, modal background
#0a0a0a          text dark (default)
rgba(27,107,69,0.15)  border color
```

### 1.4 Glass Effect
```
background: rgba(255, 255, 255, 0.6)
backdrop-filter: blur(24px)   /* sm: blur(2px) */
-webkit-backdrop-filter: blur(24px)
border: 1px solid rgba(27, 107, 69, 0.15)
```

### 1.5 Semantic
```
#dc2626          destructive / error
#16a34a          success
#ca8a04          warning
#2563eb          info / link
```

### 1.6 Kelas Tailwind Custom
```css
@theme {
  --color-primary: #005231;
  --color-primary-light: #006b3e;
  --color-tertiary: #5a4200;
  --color-tertiary-light: #775900;
  --color-surface: #f2fcf7;
  --color-border-precision: rgba(27, 107, 69, 0.15);
}
```

---

## 2. TIPOGRAFI

### 2.1 Font Families

| Kategori | Font | CDN | Contoh |
|----------|------|-----|--------|
| **Heading** | Bricolage Grotesque | `next/font/google` | Semua judul, hero, section title |
| **Body** | Inter | `next/font/google` | Semua teks body, paragraf, label |
| **Arabic/Quran** | Amiri | `next/font/google` | Ayat, dalil, teks arab |
| **Mono** | JetBrains Mono | `next/font/google` | Kode, data teknis |

### 2.2 Skala Ukuran

| Token | Size | Line Height | Digunakan Untuk |
|-------|------|-------------|-----------------|
| xs | 0.75rem / 12px | 1rem | Label kecil, badge |
| sm | 0.875rem / 14px | 1.25rem | Body small, caption |
| base | 1rem / 16px | 1.5rem | Body default |
| lg | 1.125rem / 18px | 1.75rem | Body large, subtitle |
| xl | 1.25rem / 20px | 1.75rem | Card title |
| 2xl | 1.5rem / 24px | 2rem | Section heading |
| 3xl | 1.875rem / 30px | 2.25rem | Page heading |
| 4xl | 2.25rem / 36px | 2.5rem | Hero heading |
| 5xl | 3rem / 48px | 1 | Hero utama |

### 2.3 Font Weight
- `font-normal` (400) — body text
- `font-medium` (500) — emphasis, links
- `font-semibold` (600) — card titles, subheadings
- `font-bold` (700) — headings
- `font-extrabold` (800) — hero heading only

---

## 3. SPACING & LAYOUT

### 3.1 Container
```css
max-width: 1280px
mx-auto
```

### 3.2 Padding Mobile-First
```
px-3         12px  (mobile, semua halaman)
sm:px-5      20px  (tablet)
lg:px-8      32px  (desktop)
```

### 3.3 Gap
```
gap-4        16px  (grid cards, section antar elemen)
gap-6        24px  (antar section besar)
gap-8        32px  (antar major section)
gap-12       48px  (antar hero & konten)
```

### 3.4 Section Spacing
```html
<section className="py-12 sm:py-16 lg:py-20">
  <!-- konten -->
</section>
```

---

## 4. RADIUS (Border Radius)

| Token | Value | Tailwind | Digunakan Untuk |
|-------|-------|----------|-----------------|
| sm | 4px | `rounded-sm` | Input, badge kecil |
| md | 12px | `rounded-xl` | Card, button default |
| lg | 16px | `rounded-2xl` | Card besar, modal |
| xl | 24px | `rounded-3xl` | Hero image, feature card |
| custom | 32-80px | `rounded-[32px]` | Glass container, bottom bar |

### Aturan Cepat
- **Cards** → `rounded-2xl` atau `rounded-3xl`
- **Buttons** → `rounded-xl` (pill-style bisa `rounded-full`)
- **Input/Textarea** → `rounded-xl` border 1px
- **Glass Container** → `rounded-[32px]` atau `rounded-[80px]`
- **Tab/Menu Items** → `rounded-full`

---

## 5. SHADOW

### 5.1 Shadow Glass (Tailwind Config)
```css
--shadow-glass: 0 4px 24px -2px rgba(0, 82, 49, 0.06), 0 2px 8px -2px rgba(0, 82, 49, 0.04);
--shadow-glass-lg: 0 12px 40px -8px rgba(0, 82, 49, 0.08), 0 4px 16px -4px rgba(0, 82, 49, 0.04);
--shadow-glass-xl: 0 24px 56px -12px rgba(0, 82, 49, 0.12), 0 8px 24px -8px rgba(0, 82, 49, 0.06);
```

### 5.2 Kelas Tailwind
```css
@theme {
  --shadow-glass: 0 4px 24px -2px rgba(0, 82, 49, 0.06), 0 2px 8px -2px rgba(0, 82, 49, 0.04);
  --shadow-glass-lg: 0 12px 40px -8px rgba(0, 82, 49, 0.08), 0 4px 16px -4px rgba(0, 82, 49, 0.04);
  --shadow-glass-xl: 0 24px 56px -12px rgba(0, 82, 49, 0.12), 0 8px 24px -8px rgba(0, 82, 49, 0.06);
}
```

---

## 6. ANIMASI

### 6.1 Konfigurasi motion/react
```typescript
const easeCurve = [0.16, 1, 0.3, 1] as const;
```

### 6.2 Pattern Animasi

#### Hero / Heading (from bottom)
```tsx
<motion.div
  initial={{ y: 40, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
>
```

#### Stagger Grid (items muncul satu per satu)
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};
```

#### Scroll Reveal (whileInView)
```tsx
<motion.div
  initial={{ y: 30, opacity: 0 }}
  whileInView={{ y: 0, opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>
```

#### Sidebar
```tsx
// Kiri: x: -30, Kanan: x: 30
<motion.div
  initial={{ x: -30, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>
```

### 6.3 Durasi
- Hero: 0.6-0.7 detik
- Cards/Items: 0.5 detik
- Menu/Modal: 0.3 detik
- Hover transition: 200-300ms

### 6.4 Mobile Blur
```css
@media (max-width: 640px) {
  .bg-glass {
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }
}
```

---

## 7. KOMPONEN BASIS

### 7.1 Button
```html
<!-- Primary -->
<button className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200">

<!-- Outline -->
<button className="border border-primary text-primary hover:bg-primary/5 px-6 py-3 rounded-xl font-medium transition-all duration-200">

<!-- Ghost -->
<button className="text-primary hover:bg-primary/5 px-4 py-2 rounded-xl font-medium transition-all duration-200">
```

### 7.2 Card (Glass Style)
```html
<div className="bg-glass rounded-[32px] p-6 sm:p-8">
  <h3 className="font-bricolage text-xl font-semibold text-primary mb-3">Judul</h3>
  <p className="font-inter text-gray-600 leading-relaxed">Deskripsi</p>
</div>
```

### 7.3 Card Hover (Standard)
```html
<div className="bg-white rounded-3xl p-6 border border-border-precision hover:shadow-glass-lg transition-all duration-300">
```

### 7.4 Input
```html
<input className="w-full px-4 py-3 rounded-xl border border-border-precision bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-inter" />
```

### 7.5 Section Container
```html
<section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-5 lg:px-8">
  <div className="max-w-7xl mx-auto">
    <!-- konten -->
  </div>
</section>
```

### 7.6 Section Heading
```html
<div className="text-center mb-8 sm:mb-12">
  <h2 className="font-bricolage text-3xl sm:text-4xl font-bold text-primary mb-4">
    Judul Section
  </h2>
  <p className="font-inter text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
    Subtitle atau deskripsi section
  </p>
</div>
```

### 7.7 Badge / Tag
```html
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
  AKIDAH
</span>
```

### 7.8 Shimmer Text
```html
<span className="shimmer-text font-bricolage font-bold">
  Teks Berkilau Emas
</span>
```

```css
.shimmer-text {
  background: linear-gradient(90deg, #eec055, #ffdf9b, #eec055, #ffdf9b);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  to { background-position: 200% center; }
}
```

---

## 8. RESPONSIVE BREAKPOINTS

```css
/* Tailwind defaults */
sm:  640px   /* Mobile landscape / Small tablet */
md:  768px   /* Tablet */
lg:  1024px  /* Small desktop */
xl:  1280px  /* Desktop */
2xl: 1536px  /* Large desktop */
```

### Mobile-First Pattern
```html
<!-- Grid: 1 kolom mobile → 2 kolom tablet → 3 kolom desktop -->
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```

---

## 9. SAFE AREA (Mobile Notch)

```html
<div className="pb-safe">
  <!-- padding-bottom: env(safe-area-inset-bottom, 20px) -->
</div>
```

```css
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
```

---

## 10. ANTI-PATTERN — JANGAN DILAKUKAN

<avoid>
  <item>JANGAN pakai warna di luar palette — #005231, #5a4200, #f2fcf7 hanya ini</item>
  <item>JANGAN pakai font selain Bricolage/Inter/Amiri/JetBrains Mono</item>
  <item>JANGAN pakai shadow selain shadow-glass, shadow-glass-lg, shadow-glass-xl</item>
  <item>JANGAN ubah ease curve [0.16, 1, 0.3, 1] as const</item>
  <item>JANGAN pakai backdrop-blur selain 2xl (dan 2px di mobile)</item>
  <item>JANGAN tambah komponen dengan style inline yang berbeda</item>
  <item>JANGAN pakai any di TypeScript — semua type harus explicit</item>
  <item>JANGAN pakai library UI component (shadcn/ui, MUI, Chakra) — semua custom</item>
</avoid>

---

## 11. CHANGELOG DESAIN

| Tanggal | Perubahan |
|---------|-----------|
| 6 Jul 2026 | v1.0 — Initial design system documentation |

---

*Desain System AKAL Center. Setiap perubahan visual harus tercatat di sini.*
