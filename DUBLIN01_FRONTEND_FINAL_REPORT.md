# DUBLIN/01 — Final front-end report

9 October 2026, final quality-assurance session. Every figure below was produced on the local repository after the last correction. What was not done is stated as such.

**Verdict: PASS** for a front-end portfolio project (section 15). This is not a statement of commercial production readiness.

## 1. Final project architecture

- **Build-time HTML.** `scripts/build-html.mjs` assembles `src/pages`, `src/templates` and `src/partials` with the JSON data into 70 static pages (32 product pages, 6 brand pages). Each URL is a real file.
- **One source of product data.** `src/data/products.json`, read in the browser only through `src/js/data/catalog.js`.
- **Small ES modules.** `src/js/modules` (shared behaviour: carousel, cart, bag drawer, quick add, wishlist, search, consent…), `src/js/pages` (one module per page type), `src/js/utils`.
- **State.** Catalogue filters in the URL; bag, wishlist, history and consent in `localStorage`.
- **No back end.** Checkout, accounts, newsletter and contact are honest interfaces that state they are unavailable in the demo.

## 2. Technologies actually used

HTML5 · Tailwind CSS 4.3.3 (CLI) with design tokens in `src/css/theme.css` · vanilla JavaScript (native ES modules) · JSON · `localStorage` · Node.js ≥ 20 for the generator and tests (`node --test`).

Development dependencies: `tailwindcss`, `@tailwindcss/cli`, `concurrently`, `serve`. No runtime dependency. No React, Next.js, TypeScript or ESLint exists in this repository and none was added.

The validators and browsers used for this audit (html-validate, axe-core, Lighthouse, Playwright with Chrome, Firefox and WebKit) were run from outside the project and are not project dependencies.

## 3. HTML validation results

Tool: html-validate, presets `standard` and `a11y`, on all 91 HTML files.

| Rule | Occurrences | Decision |
|---|---|---|
| `element-required-attributes` (`<img>` without `src`) | 3, home page | **Fixed.** Deferred hero images now carry a 1 px placeholder `src`; the carousel waits for the real image |
| `no-redundant-role` (`role="list"` on lists) | 1,723 | Kept on purpose: it restores list semantics in WebKit screen readers when list markers are removed by CSS |
| `prefer-native-element` (`role="list"` on `<ol>`) | 31 | Same reason, breadcrumbs |
| `no-redundant-for` (label wraps its input and also has `for`) | 214 | Kept: valid HTML, explicit association |
| `wcag/h32` (form without submit button) | 170 | Kept: the two search forms submit with Enter (`enterkeyhint="search"`); the filter forms apply on change and have no submit action |

No other rule reports anything. The project's own tests additionally check, on every generated page: language, unique title, description, a single `h1`, alternative text and dimensions on images, accessible names on controls, and that every internal link and asset resolves.

## 4. CSS and responsive validation

- Tailwind 4 is really used (`src/css/main.css` imports it and scans the templates); components are written in `src/css/components.css`, `header.css` and `commerce.css` on top of the tokens.
- Chrome, 91 HTML files at 9 widths (320, 375, 390, 430, 768, 1024, 1280, 1440, 1920 px) = 819 page loads: 0 horizontal overflow, 0 broken image, 0 console error, 0 failed request.
- Home page measured at 390, 768 and 1440 px: every card and category tile at 4:5, one section-title size, 48 px buttons, one section spacing value.
- Hero height equals the screen under the header; verified through a full cycle of the four campaigns.

## 5. JavaScript functionality results

All run in Chrome through Playwright, all passing:

- 24 customer journeys: navigation, mega menus, search (including markup, symbols, blank and 300-character input), filters and sorting in the URL, product pages, size selection (adding without a size is refused), quick add, bag (quantity, removal, subtotal, free delivery from €100.00 inclusive), wishlist, persistence after refresh and in a second tab, empty states, missing product and missing page, back and forward with filters restored, refresh of a nested product route, mobile menu and filters, footer links, newsletter validation.
- Keyboard: mega menu, search panel and bag drawer open and close from the keyboard and return focus.
- Honest demo states: checkout button disabled ("Checkout is unavailable in this demo"), sign-in stores nothing, newsletter says the address was not saved, catalogue load failure shows an error message.

## 6. Product catalogue consistency

- 32 products, unique ids and slugs, EUR, total €3,417.95, no struck-through price, no review or rating.
- 206 cards across 20 listing, search and filter pages and all 32 product pages show the catalogue price, including in structured data. Rain Shell: €100.00 everywhere.
- 32 product pages checked one by one: image count, sizes shown, sizes in stock, title, brand, related products, delivery and returns sections. Stock is labelled "(demo stock)".
- No price changed in this session.
- **Unverified product data that remains**: XA PRO 3D GORE-TEX variant (€150); Crew Socks 3-Pack (€25) above the benchmark range; Crossbody Bag material not published; Gazelle lining not published; three end-of-line models kept at their former price; 15 products with a single photograph; own-label compositions and the Rain Shell price are provisional. Detail in `docs/rapport-prix-catalogue.md`.

## 7. Accessibility results

- axe-core (WCAG 2.0, 2.1 and 2.2 A and AA plus best practices), 22 representative pages at 2 widths = 44 runs: **0 violation** after two corrections (hero slide used an ARIA role not allowed on `<article>`; the bag page skipped a heading level).
- Lighthouse accessibility: 100 on the four pages measured.
- Reduced motion: no carousel autoplay, no reveal animation.
- Not done: screen-reader testing, formal WCAG audit by a specialist.

## 8. Cross-browser test results

| Engine | Coverage | Result |
|---|---|---|
| Chromium (Google Chrome) | 91 files × 9 widths, 24 journeys, axe, Lighthouse | Pass |
| Firefox 157 | 70 pages × 3 widths (375, 1024, 1440) = 210 loads; home, search, filter and sort, product, bag, wishlist, mobile menu | 0 overflow, 0 broken image, 0 script error; journeys pass |
| WebKit 27.2 | Same coverage as Firefox | 0 overflow, 0 broken image, 0 script error; journeys pass |

The hero carousel was also followed through a full cycle at 1440 and 390 px in the three engines: every campaign displays its real image.

WebKit here is the Playwright build of the engine, not the Safari application. No physical device was used.

## 9. Lighthouse results

Lighthouse 13.5, headless Chrome, local server, minified build (performance / accessibility / best practices / SEO).

| Page | Mobile | Desktop | Mobile LCP | CLS |
|---|---|---|---|---|
| Home | 88 / 100 / 100 / 92 | 99 / 100 / 100 / 92 | 3.9 s | 0 |
| Sneakers catalogue | 98 / 100 / 100 / 92 | 100 / 100 / 100 / 92 | 2.3 s | 0 |
| Product page | 97 / 100 / 100 / 92 | 100 / 100 / 100 / 92 | 2.4 s | 0 |
| Bag | 99 / 100 / 100 / 58 | 100 / 100 / 100 / 58 | 2.1 s | 0.04 |

SEO at 92: relative canonical URL (no production domain). Bag at 58: deliberately `noindex`.

## 10. Remaining limitations

- **Scope**: no authentication, payment, orders, server inventory or email; `localStorage` only. Commerce data (prices, stock, delivery, returns, VAT wording) is illustrative.
- **Not tested**: the Safari application, physical devices, screen readers, real hosting.
- **Performance**: home mobile LCP of 3.9 s under simulated slow 4G (one render-blocking stylesheet of about 72 KB).
- **Data**: the unverified items of section 6.
- **Third parties**: brand names are references without affiliation; photographs are credited Unsplash images whose commercial rights are not established.
- **Tooling**: no type checking and no style linter.
- "Shop rain shells" opens a single product; product listings are rendered in the browser.

## 11. Files modified in this session

- `scripts/build-html.mjs`: placeholder `src` on deferred hero images; hero slides are `<div role="group">`.
- `src/js/modules/carousel.js`: waits for the real image after a swap; unused helper removed.
- `src/js/pages/bag.js`: heading for the list of items.
- `src/js/main.js`: leftover console message removed.
- Removed: `src/js/modules/filters.js`, `src/js/modules/i18n.js` (empty placeholders, imported nowhere).
- `docs/learning-roadmap.md` (new), this report, `travaux-realises.md`, regenerated `index.html`.

## 12. Test commands and actual results

| Command or tool | Result |
|---|---|
| `npm run lint` | Pass |
| `npm run build` | Pass, 70 pages |
| `npm test` | 29 of 29 |
| `npm ls --depth=0` | 4 development dependencies, none missing |
| html-validate | Section 3 |
| axe-core | 0 violation in 44 runs |
| Playwright journeys (Chrome) | 24 of 24 |
| Lighthouse | Section 9 |
| TypeScript, ESLint | Not part of this project: not run |

## 13. Final Git commit hash

Recorded in the delivery message and visible as the head of `main` on GitHub; a commit cannot contain its own hash. The previous published head was `1f603ae`.

## 14. GitHub push verification

- Repository: https://github.com/AlfredMusk/dublin01-ecommerce, branch `main`, public.
- Before this session local `main` and `origin/main` were both at `1f603ae` (37 commits).
- This session is delivered with a normal `git push origin main`: no force, no history rewrite, no other branch pushed. The remote head is compared with the local head after the push.
- Tracked files and history reviewed: no credential, token, `.env` file, personal email or local absolute path. The local backup branch and bundle are not published.
- GitHub Pages and other deployments: not activated.

## 15. Final front-end completion verdict

**PASS.**

All required checks were executed and pass: HTML validation with documented exceptions, responsive sweep, 24 journeys, catalogue consistency, automated accessibility, three browser engines, measured Lighthouse results, build, lint and tests. The defects found in this session were corrected and re-tested.

The verdict covers a front-end portfolio project. The limitations of section 10 remain true and are not hidden by it.
