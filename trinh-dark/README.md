# TRÌNH CÀ PHÊ — Immersive Dark Remake

Landing page / brand website remake cho **Trình Cà Phê** (Đà Nẵng, est. 2018) theo phong cách **Immersive Dark Mode · Techwear / Futuristic Premium**.

> Digital art landing page: tối, sang, mượt, typography-driven. Nổi bật **Cà phê bơ** và **Fine Robusta TR4**.

## ▶️ Chạy thử
Mở `index.html` trực tiếp là chạy được. Khuyến nghị dùng static server để smooth scroll/GSAP chuẩn:
```bash
cd trinh-dark
python3 -m http.server 5180
# http://localhost:5180
```

## 📂 Cấu trúc (phẳng, không thư mục con)
```
trinh-dark/
├── index.html
├── style.css
└── main.js
```

## 🎨 Palette (CSS variables trong style.css)
| Token | Hex | |
|-------|-----|--|
| `--ink` | `#050505` | Deep Black |
| `--ink-soft` | `#101312` | Charcoal |
| `--moss` / `--moss-deep` | `#15251D` / `#0C1611` | Dark Moss |
| `--avocado-neon` | `#B6FF5C` | Avocado Neon (accent) |
| `--avocado-soft` | `#A7D86D` | Soft Avocado |
| `--coffee` | `#4A2C1A` | Coffee Brown |
| `--cream` | `#F4F1E8` | Cream Text |
| `--muted` | `#8A8F88` | Muted Gray |

**Typography:** Playfair Display + Marcellus (display) · Inter (body). Chữ cực lớn làm mảng đồ họa, tracking thấp, line-height chặt.

## 🔄 Sections & Motion
| # | Section | Hiệu ứng |
|---|---------|----------|
| 0 | Preloader | Chữ "TRÌNH" hiện từng ký tự + bead neon + bar, fade vào hero |
| 1 | Header | Sticky, blur, hide-on-scroll-down, active link, mobile drawer |
| 2 | Hero | Zoom-in parallax bg + slogan/logo fade-out + particle beans bay |
| 3 | Farm — *From farm to cup* | Reveal fade-in-up + media parallax (ảnh chậm hơn chữ) + spec list |
| 4 | Roastery — *Roasted in the city* | 2 cột + drum-roaster glow xoay + heat pulse |
| 5 | Menu | **Horizontal scroll** (pin GSAP desktop) · scroll-snap native mobile · hover: zoom ảnh + title glow + tone wash |
| 6 | Stores | **Stacking cards** sticky + scale-down khi exit + "Explore more stores" |
| 7 | Footer | Chữ "TRÌNH" khổng lồ outline + rise reveal |

**Stack motion:** GSAP 3.12 + ScrollTrigger + Lenis (CDN).

## ♿ Guardrails
- `prefers-reduced-motion`: tắt preloader, parallax, particle, stacking → fallback tĩnh.
- Mobile: không pin horizontal; menu dùng CSS `scroll-snap`; giảm số particle.
- No-JS: `<noscript>` ẩn preloader + hiện toàn bộ nội dung.
- A11y: skip-link, focus-visible neon, aria cho nav toggle, alt cho ảnh.
- Performance: chỉ animate `transform`/`opacity`, có `will-change`, ảnh `width/height` + `loading=lazy`, hero `fetchpriority=high`.

## 🚀 Production notes
- Tailwind đang dùng **CDN** (prototype) → build Tailwind CLI khi lên thật.
- Thay ảnh Unsplash placeholder bằng ảnh thật của Trình (WebP/AVIF + `srcset`).
- Self-host GSAP/Lenis để kiểm soát phiên bản & hiệu năng.
- Điền hotline / social thật (hiện để placeholder).
