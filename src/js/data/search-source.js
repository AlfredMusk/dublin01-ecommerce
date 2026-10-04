/**
 * Search source adapter. Every search UI (navigation field, mobile overlay,
 * results page) goes through `search()`, so a backend can replace this file
 * later without touching the interface.
 *
 * Today the source is the local demo catalogue (src/data/products.json),
 * ranked in the browser by searchProducts().
 *
 * Contract: search(query, { limit }) → Promise<{ query, total, results: Product[] }>
 */

import { loadProducts, searchProducts } from './catalog.js';

export async function search(query, { limit = Infinity } = {}) {
  const q = String(query ?? '').trim();
  if (!q) return { query: q, total: 0, results: [] };
  const all = searchProducts(await loadProducts(), q);
  return { query: q, total: all.length, results: all.slice(0, limit) };
}

/** Lets the UI warm the source before the first keystroke (no-op for a remote API). */
export const prepareSearch = () => loadProducts().catch(() => {});
