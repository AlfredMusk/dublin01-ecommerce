# DUBLIN/01

Premium front-end e-commerce experience for **DUBLIN/01**, a fictional Dublin-based brand of sneakers and contemporary streetwear. Minimal black & white identity, bilingual EN/FR, prices in EUR, mobile-first and fully responsive.

## Status

🚧 **In Development** — Phase 02: design system. `index.html` is currently a temporary design system playground, not the Home page.

## Stack

- HTML5 (semantic, accessible)
- Tailwind CSS v4 (standalone CLI)
- JavaScript ES6+ (native ES modules, no framework)
- JSON (product catalogue and locales)
- LocalStorage (cart, wishlist, language preference)
- Node.js — development tooling only
- Git / GitHub

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:3001.

| Script | Description |
| --- | --- |
| `npm run dev` | Tailwind watch + local server on port 3001 |
| `npm run build` | Minified CSS build to `dist/css/main.css` |
| `npm run preview` | Build, then serve |

## Structure

```
dublin01-ecommerce/
├── index.html
├── pages/                  # Future pages (shop, product, cart…)
├── src/
│   ├── css/
│   │   ├── main.css        # Tailwind entry + imports
│   │   ├── theme.css       # Design tokens (@theme)
│   │   ├── base.css        # Fonts, base elements, focus, reduced motion
│   │   ├── typography.css  # type-* roles
│   │   ├── layout.css      # container-site, grid-site
│   │   └── components.css  # Buttons, links, icons, skip-link
│   ├── js/
│   │   ├── main.js         # Entry point
│   │   ├── playground.js   # Temporary playground script
│   │   ├── modules/        # cart, wishlist, search, filters, i18n
│   │   └── utils/          # storage, format, dom
│   └── data/
│       ├── products.json
│       └── locales/        # en.json, fr.json
├── public/                 # images, fonts (self-hosted Geist), icons
└── dist/                   # Generated CSS (git-ignored)
```

## Design system

- **Colour** — black, ink, white, paper, bone and neutrals 100–800. No accent.
- **Type** — Geist Sans + Geist Mono (self-hosted, OFL), fluid scale from Display XL to Micro.
- **Space** — 4px base, fluid section rhythm, 44px minimum touch targets.
- **Layout** — 4 / 8 / 12 columns, 1440px max container, 65ch reading width.
- **Controls** — square buttons (primary, secondary, ghost) and four link styles.
- **Motion** — 180 / 300 / 520ms, one easing curve, transform and opacity only, `prefers-reduced-motion` respected.

## Portfolio goal

A portfolio project demonstrating advanced UI/UX, responsive design and vanilla JavaScript architecture, built to evolve into a full-stack application and later an AI-powered commerce experience.

## Roadmap

1. Phase 01 — Project setup ✅
2. Phase 02 — Design system ✅
3. Phase 03 — Layout (navbar, hero, footer)
4. Phase 04 — Catalogue, filters & search
5. Phase 05 — Product page, cart & wishlist
6. Phase 06 — EN/FR i18n, accessibility & performance
7. Later — Full-stack backend, then AI Commerce
