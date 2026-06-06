# MeliOh Bistro Da Nang — Remake Concept

A redesign concept for [MeliOh Bistro](https://meliohbistro.com/), a romantic
dining destination for couples in Da Nang — *the nest of love by Han River*.

This is a portfolio design study, not the official site.

## Direction

**Candlelight Editorial** — a warm, romantic dining brand treated like a print
magazine rather than a template brochure. Warm luxury (never dark/cyber),
editorial serif headings, generous whitespace, asymmetric layouts and image-led
storytelling.

- **Palette:** Candle Cream, Champagne, Warm Blush, Rose Brown, Deep Wine,
  Charcoal, Soft Gold.
- **Type:** Cormorant Garamond (headings) + Be Vietnam Pro (body).
- **Motion:** subtle fade-in-up, light hero parallax, gentle image zoom; reduced
  on mobile and disabled for `prefers-reduced-motion`.

## Tech

Plain HTML, CSS and JavaScript — no build step. Open `index.html` in a browser
or serve the folder:

```bash
python3 -m http.server 8000
```

## Sections

Preloader, Header, Hero, About, Experience, Services (accordion),
Proposal Packages, Menu preview, Gallery, Reservation form, Location/Map,
Stories, Newsletter, Footer, and a floating mobile contact dock.

## Configuring real submissions

The reservation and newsletter forms run in **demo mode** until you set a real
endpoint. Replace `your-form-id` in the `action` of `#reservationForm` and
`#newsletterForm` in `index.html` with a [Formspree](https://formspree.io) form
ID (or any endpoint accepting `multipart/form-data`). Validation, the honeypot
anti-spam field and success/error states work as-is.

## Image assets

Gallery and section images are high-quality placeholders that match the brand
vibe (candlelight, glass dome, bridge view, proposal). Swap in MeliOh's real
photos by replacing the `src` URLs.

## Real brand info used

- Address: Lot A1-04 The Villas of Green Islands, Hoa Cuong Bac, Hai Chau, Da Nang
- Phone: +84 0918 204 008
- Email: melioh.bistrodn@gmail.com
- Services: Anniversary/Birthday dinner, three proposal packages, special-view party
