# DUBLIN/01

Premium front-end e-commerce experience for **DUBLIN/01**, a fictional Dublin-based brand of sneakers and contemporary streetwear. Minimal black & white identity, bilingual EN/FR, prices in EUR, mobile-first and fully responsive.

## Status

🚧 **In Development** — Phase 03: global header & navigation. The Home content comes next.

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
├── index.html              # Home (header in place, content next)
├── pages/
│   └── design-system.html  # Internal design system reference (noindex)
├── src/
│   ├── css/
│   │   ├── main.css        # Tailwind entry + imports
│   │   ├── theme.css       # Design tokens (@theme)
│   │   ├── base.css        # Fonts, base elements, focus, reduced motion
│   │   ├── typography.css  # type-* roles
│   │   ├── layout.css      # container-site, grid-site
│   │   ├── components.css  # Buttons, links, icons, skip-link
│   │   └── header.css      # Header, mega menu, mobile menu, search
│   ├── js/
│   │   ├── main.js         # Entry point
│   │   ├── playground.js   # Design system page demo
│   │   ├── modules/        # header, menu, search, cart, wishlist, filters, i18n
│   │   └── utils/          # dom, dialog, storage, format
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

## URL architecture

Pages are added progressively; the header already links to their final URLs (404 until they exist).

| Destination | URL |
| --- | --- |
| New | `/pages/new.html` |
| Sneakers | `/pages/sneakers.html` — filters as query params: `?gender=men`, `?style=running`, `?brand=nike`, `?collection=limited` |
| Clothing | `/pages/clothing.html` — `?type=jackets`, `?gender=women`, `?collection=new` |
| Brands | `/pages/brands.html` |
| Search | `/pages/search.html?q=` |
| Account | `/pages/account.html` |
| Wishlist | `/pages/wishlist.html` |
| Bag | `/pages/bag.html` |

Header behaviour is attached through `data-*` hooks (`data-header`, `data-mega-trigger`, `data-menu`, `data-search`, `data-bag-count`), so the same markup works on every page.

## Portfolio goal

A portfolio project demonstrating advanced UI/UX, responsive design and vanilla JavaScript architecture, built to evolve into a full-stack application and later an AI-powered commerce experience.

## Roadmap

1. Phase 01 — Project setup ✅
2. Phase 02 — Design system ✅
3. Phase 03 — Header & navigation ✅
4. Phase 04 — Home (hero, editorial sections, footer)
5. Phase 05 — Catalogue, filters & search
6. Phase 06 — Product page, cart & wishlist
7. Phase 07 — EN/FR i18n, accessibility & performance
8. Later — Full-stack backend, then AI Commerce
