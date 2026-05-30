# Trình Cà Phê — Immersive Web Remake

Website trải nghiệm nhập vai (Immersive Web Design) cho thương hiệu **Trình Cà Phê** — cà phê bơ đặc sản từ nông trại Trình Farm, Đắk Lắk.

> Thiết kế dựa trên design system sinh ra từ skill **ui-ux-pro-max**: style **Organic Biophilic**, bảng màu earth-tone, cặp font editorial (Playfair Display + Marcellus + Inter).

## 🎨 Design tokens

| Vai trò | Màu | Token |
|--------|------|-------|
| Forest Green (chủ đạo) | `#1B4332` | `--color-forest` |
| Forest Deep (nền tối) | `#102A20` | `--color-forest-deep` |
| Avocado | `#52796F` / `#84A98C` | `--color-avocado(-light)` |
| Cream (sữa bơ chín) | `#F7F3E9` | `--color-cream` |
| Coffee Bean (nâu rang) | `#3A2618` | `--color-bean` |
| Clay (điểm xuyết vàng) | `#C9A227` | `--color-clay` |

**Typography:** Playfair Display (serif hoài niệm — tiêu đề), Marcellus (display serif — logo/heading), Inter (sans hiện đại — nội dung).

## 🔄 4 phân cảnh chuyển động

| # | Section | Hiệu ứng | Kỹ thuật |
|---|---------|----------|----------|
| 1 | Hero | Zoom-in parallax vòm lá + content drift | GSAP ScrollTrigger `scrub` |
| 2 | About (Trình Farm) | Fade-in-up + ảnh trượt chậm hơn chữ (3D depth) | IntersectionObserver + parallax `data-parallax` |
| 3 | Specialty Menu | Khóa cuộn dọc → cuộn ngang (pin + translate) | GSAP pin; mobile fallback = scroll-snap |
| 4 | Store Locator | Stacking cards (xếp chồng mượt) | `position: sticky` + scale outgoing card |

## ▶️ Chạy thử

Cần một static server bất kỳ (vì dùng module/CDN):

```bash
cd trinh-ca-phe
python3 -m http.server 5173
# Mở http://localhost:5173
```

Hoặc dùng VS Code **Live Server**.

## 📂 Cấu trúc

```
trinh-ca-phe/
├── index.html              # Khung 4 phân cảnh + navbar + footer
├── assets/
│   ├── css/style.css       # Tokens, components, animation, reduced-motion
│   └── js/main.js          # Lenis smooth scroll + GSAP ScrollTrigger scenes
└── README.md
```

## ♿ UX guardrails (theo ui-ux-pro-max)

- ✅ `prefers-reduced-motion`: tắt toàn bộ parallax/scroll-jacking, stacking về list thường.
- ✅ Mobile fallback: menu ngang dùng native scroll-snap (không pin scroll-jack trên touch).
- ✅ Skip-link, focus-visible (ring `clay`), aria cho menu/icon button.
- ✅ Responsive: 375 / 768 / 1024 / 1440. Dùng `100svh`, `clamp()` spacing.
- ✅ Ảnh khai báo `width/height` + `loading="lazy"` (tránh CLS), hero `fetchpriority="high"`.

## 🚀 Production notes

- Tailwind hiện dùng **CDN** (prototype). Khi build thật: cài Tailwind CLI/PostCSS, purge class.
- Thay ảnh Unsplash placeholder bằng ảnh thật của Trình (ưu tiên WebP/AVIF + `srcset`).
- Cân nhắc self-host GSAP/Lenis thay vì CDN để kiểm soát phiên bản & hiệu năng.
