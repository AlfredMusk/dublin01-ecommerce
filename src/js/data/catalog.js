/**
 * Product catalogue: loads src/data/products.json once and exposes queries.
 * The JSON shape is the contract a future API should keep.
 */

let cache;

export function loadProducts() {
  cache ??= fetch(new URL('../../data/products.json', import.meta.url))
    .then((response) => {
      if (!response.ok) throw new Error(`Catalogue unavailable (${response.status})`);
      return response.json();
    })
    .catch((error) => {
      cache = undefined; // a failed load must not be remembered: the next call retries
      throw error;
    });
  return cache;
}

export const getBySlug = async (slug) => (await loadProducts()).find((p) => p.slug === slug);

export const isOnSale = (p) => Boolean(p.compareAtPrice && p.compareAtPrice > p.price);
export const isSoldOut = (p) => p.stock === 'out_of_stock' || p.availableSizes.length === 0;

export const BRAND_ORDER = ['Nike', 'adidas', 'New Balance', 'ASICS', 'Salomon', 'DUBLIN/01'];
export const brandSlug = (brand) => brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const normalise = (text) =>
  String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Ranked full-text search over name, brand, category, type, style, colour and keywords. */
export function searchProducts(products, query) {
  const terms = normalise(query).split(' ').filter(Boolean);
  if (!terms.length) return [];
  return products
    .map((p) => {
      const fields = [
        [normalise(`${p.brand} ${p.name}`), 4],
        [normalise(p.brand), 3],
        [normalise([p.category, p.type, p.style, p.gender].join(' ')), 2],
        [normalise([p.color, ...p.keywords].join(' ')), 1],
      ];
      let score = 0;
      for (const term of terms) {
        const hit = fields.reduce((best, [text, weight]) => (text.includes(term) ? Math.max(best, weight) : best), 0);
        if (!hit) return null; // every term must match somewhere
        score += hit;
      }
      return { p, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => p);
}
