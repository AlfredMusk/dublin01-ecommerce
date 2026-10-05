/**
 * Search source adapter. Every search UI (navigation field, mobile overlay,
 * results page) goes through `search()`, so a backend can replace this file
 * later without touching the interface.
 *
 * Today the source is the local catalogue (src/data/products.json), ranked in
 * the browser by searchProducts().
 *
 * Contract: search(query, { limit }) →
 *   Promise<{ query, total, results: Product[], shortcuts: { label, kind, href }[] }>
 * `shortcuts` are brand and category pages whose name matches the query; `href`
 * is site-relative (no base prefix).
 */

import { loadProducts, searchProducts, foldText, brandSlug, BRAND_ORDER } from './catalog.js';

const SECTIONS = [
  ['New arrivals', 'new-arrivals.html', 'new arrivals latest'],
  ['Men', 'men.html', 'men mens'],
  ['Women', 'women.html', 'women womens'],
  ['Sneakers', 'sneakers.html', 'sneakers shoes trainers runners footwear'],
  ['Running & trail', 'running-trail.html', 'running trail run'],
  ['Clothing', 'clothing.html', 'clothing clothes apparel streetwear'],
  ['Jackets', 'clothing.html?type=jackets', 'jackets jacket outerwear rain shell coat'],
  ['Hoodies & sweats', 'clothing.html?type=hoodies', 'hoodies hoodie sweatshirt fleece'],
  ['T-Shirts', 'clothing.html?type=t-shirts', 't shirts tee tees tshirt'],
  ['Accessories', 'accessories.html', 'accessories bag beanie socks cap'],
  ['Sale', 'sale.html', 'sale reduced discount'],
];

function shortcutsFor(query) {
  const terms = foldText(query).split(' ').filter((term) => term.length > 1);
  if (!terms.length) return [];
  const hit = (text) => terms.every((term) => foldText(text).split(' ').some((word) => word.startsWith(term)));
  const brands = BRAND_ORDER.filter((name) => hit(name)).map((name) => ({ label: name, kind: 'Brand', href: `brands/${brandSlug(name)}.html` }));
  const sections = SECTIONS.filter(([label, , words]) => hit(`${label} ${words}`)).map(([label, href]) => ({ label, kind: 'Category', href }));
  return [...brands, ...sections].slice(0, 4);
}

export async function search(query, { limit = Infinity } = {}) {
  const q = String(query ?? '').trim();
  if (!q) return { query: q, total: 0, results: [], shortcuts: [] };
  const all = searchProducts(await loadProducts(), q);
  return { query: q, total: all.length, results: all.slice(0, limit), shortcuts: shortcutsFor(q) };
}

/** Lets the UI warm the source before the first keystroke (no-op for a remote API). */
export const prepareSearch = () => loadProducts().catch(() => {});
