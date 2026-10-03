# DUBLIN/01

Premium front-end e-commerce experience for **DUBLIN/01**, a fictional Dublin-based brand of sneakers and contemporary streetwear. Minimal black & white identity, bilingual EN/FR, prices in EUR, mobile-first and fully responsive.

## Status

🚧 **In Development** — V1 storefront: a complete, navigable shop (home, catalogue, product pages, bag, wishlist, search, checkout UI, account and help pages) running on local data. No backend yet.

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
├── index.html, 404.html, pages/*.html   # Generated: do not edit (see scripts/build-html.mjs)
├── scripts/build-html.mjs               # Assembles pages from src/pages + src/partials
├── serve.json                           # Dev server: keep query strings, serve index.html at /
├── src/
│   ├── pages/          # Page templates with front matter (title, description, script)
│   ├── partials/       # layout, header, footer, catalog, info-head
│   ├── css/            # theme, base, typography, layout, components, header, commerce
│   ├── js/
│   │   ├── main.js     # Shared entry: header, search, bag, wishlist, newsletter
│   │   ├── pages/      # One script per page type (home, catalog, product, bag, checkout…)
│   │   ├── modules/    # header, menu, search, cart, wishlist, product-card, toast…
│   │   ├── data/       # catalog.js: loads products.json, search and helpers
│   │   └── utils/      # dom, dialog, storage, format, paths, forms
│   └── data/
│       ├── products.json   # 23 demo products: the single source of product data
│       └── locales/        # en.json, fr.json (header strings, i18n later)
├── public/
│   ├── images/         # products/ and editorial/ WebP + CREDITS.md
│   ├── fonts/          # Self-hosted Geist (OFL)
│   └── icons/
└── dist/               # Generated CSS (git-ignored)
```

Pages are static HTML assembled at build time, so the header and footer exist once (`src/partials`) and every page is plain, crawlable HTML. `npm run dev` rebuilds pages and CSS on save.

## Design system

- **Colour** — black, ink, white, paper, bone and neutrals 100–800. No accent.
- **Type** — Geist Sans + Geist Mono (self-hosted, OFL), fluid scale from Display XL to Micro.
- **Space** — 4px base, fluid section rhythm, 44px minimum touch targets.
- **Layout** — 4 / 8 / 12 columns, 1440px max container, 65ch reading width.
- **Controls** — square buttons (primary, secondary, ghost) and four link styles.
- **Motion** — 180 / 300 / 520ms, one easing curve, transform and opacity only, `prefers-reduced-motion` respected.

## Pages

| Page | URL |
| --- | --- |
| Home | `/` |
| New arrivals | `/pages/new.html` |
| Sneakers | `/pages/sneakers.html` — filters in the URL: `?gender=men`, `?style=running,trail`, `?brand=nike`, `?size=8`, `?sort=price-asc` |
| Clothing & accessories | `/pages/clothing.html?type=jackets` |
| Brands | `/pages/brands.html` |
| Search | `/pages/search.html?q=samba` |
| Product | `/pages/product.html?slug=adidas-samba-og-white-green` |
| Wishlist | `/pages/wishlist.html` |
| Bag | `/pages/bag.html` |
| Checkout (UI only) | `/pages/checkout.html` |
| Account | `/pages/account.html` |
| Our story, Delivery, Returns, FAQ, Contact | `/pages/about.html` … `/pages/contact.html` |
| Privacy, Terms, Cookies | `/pages/privacy.html` … |
| Design system reference | `/pages/design-system.html` |

## What works in V1

- Catalogue filters (category, type, style, gender, brand, size, price, collection, availability) and sort, all reflected in the URL; mobile filter drawer.
- Product pages with gallery, required size selection, size guide, stock states, related products.
- Bag and wishlist in LocalStorage (`dublin01:cart`, `dublin01:wishlist`), synced with the header counters and across tabs; free-delivery threshold at €100.
- Live search in the header overlay plus a results page.
- Checkout form for Ireland (county list, Eircode validation, shipping options) that stops before payment.

## V1 limits

- Products, prices and stock are fictional demo data; photos are Unsplash images that do not show the exact items listed.
- No payment, accounts, newsletter or contact backend: those forms validate and then say clearly that nothing was sent or stored.
- Product grids render client-side from `products.json`; a backend or build-time rendering will be needed for full SEO of listings.

## Portfolio goal

A portfolio project demonstrating advanced UI/UX, responsive design and vanilla JavaScript architecture, built to evolve into a full-stack application and later an AI-powered commerce experience.

## Roadmap

1. Phase 01 — Project setup ✅
2. Phase 02 — Design system ✅
3. Phase 03 — Header & navigation ✅
4. V1 — Complete storefront on local data ✅
5. Next — Section-by-section UI/UX refinement passes
6. Then — EN/FR i18n, performance budget, real product photography
7. Later — Full-stack backend, then AI Commerce
