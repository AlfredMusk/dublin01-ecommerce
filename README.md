# DUBLIN/01

Premium front-end e-commerce experience for **DUBLIN/01**, a fictional Dublin-based brand of sneakers and contemporary streetwear. Minimal black & white identity, bilingual EN/FR, prices in EUR, mobile-first and fully responsive.

## Status

🚧 **In Development** — Phase 01: project setup.

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

Then open http://localhost:3000.

| Script | Description |
| --- | --- |
| `npm run dev` | Tailwind watch + local server on port 3000 |
| `npm run build` | Minified CSS build to `dist/css/main.css` |
| `npm run preview` | Build, then serve |

## Structure

```
dublin01-ecommerce/
├── index.html
├── pages/                  # Future pages (shop, product, cart…)
├── src/
│   ├── css/main.css        # Tailwind entry
│   ├── js/
│   │   ├── main.js         # Entry point
│   │   ├── modules/        # cart, wishlist, search, filters, i18n
│   │   └── utils/          # storage, format, dom
│   └── data/
│       ├── products.json
│       └── locales/        # en.json, fr.json
├── public/                 # images, fonts, icons
└── dist/                   # Generated CSS (git-ignored)
```

## Portfolio goal

A portfolio project demonstrating advanced UI/UX, responsive design and vanilla JavaScript architecture, built to evolve into a full-stack application and later an AI-powered commerce experience.

## Roadmap

1. Phase 01 — Project setup ✅
2. Phase 02 — Design system & layout (navbar, hero, footer)
3. Phase 03 — Catalogue, filters & search
4. Phase 04 — Product page, cart & wishlist
5. Phase 05 — EN/FR i18n, accessibility & performance
6. Later — Full-stack backend, then AI Commerce
