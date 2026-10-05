/**
 * Product catalogue: the single data-access module of the storefront.
 *
 * Today it reads src/data/products.json once. Every function is async and
 * shaped like the API it will later call (see docs/api-contract.md), so the
 * interface does not change when a backend replaces the JSON file:
 *
 *   getProducts(query?)   → GET /products
 *   getProduct(slug)      → GET /products/:slug
 *   getCategories()       → GET /categories
 *   getBrands()           → GET /brands
 *   searchCatalogue(q)    → GET /search?q=   (see ./search-source.js)
 *
 * @typedef {Object} Product
 * @property {string} id            Stock-keeping reference, e.g. "D01-010"
 * @property {string} slug          URL identifier
 * @property {string} name
 * @property {string} brand
 * @property {'sneakers'|'clothing'|'accessories'} category
 * @property {string} type          jackets | hoodies | t-shirts | trousers | accessories | sneakers
 * @property {string} subcategory   Style for footwear (lifestyle, running, trail, skate), type otherwise
 * @property {'men'|'women'|'unisex'} gender
 * @property {string|null} style
 * @property {number} price         In `currency`, VAT included
 * @property {number|null} compareAtPrice  Previous price, only for a genuine reduction
 * @property {string} currency      ISO 4217, "EUR"
 * @property {string[]} images      Site-relative paths, first is the main view
 * @property {string} color         Display name of the colourway
 * @property {string[]} colors      Colour families, used by the colour filter
 * @property {string} description
 * @property {string[]} details
 * @property {string} material
 * @property {string[]|null} care
 * @property {string|null} sizeSystem  "EU" | "Apparel" | "Waist" | null
 * @property {string[]} sizes
 * @property {Object<string, number>} inventory  Units in stock per size
 * @property {string} collection
 * @property {string|null} badge    Editorial badge such as "Exclusive"
 * @property {boolean} isNew
 * @property {boolean} isFeatured
 * @property {boolean} isLimited
 * @property {string} createdAt     ISO date
 * @property {string[]} keywords
 * Derived on load (never stored):
 * @property {string[]} availableSizes  Sizes with at least one unit
 * @property {'in_stock'|'low_stock'|'out_of_stock'} stock
 * @property {boolean} available
 */

import { commerce } from '../config.js';

let cache;

/** Adds the fields derived from inventory, so stock has a single source. */
export function normalise(p) {
  const availableSizes = p.sizes.filter((size) => (p.inventory[size] ?? 0) > 0);
  const units = Object.values(p.inventory).reduce((sum, n) => sum + n, 0);
  const stock = units === 0 ? 'out_of_stock' : units <= commerce.lowStockThreshold ? 'low_stock' : 'in_stock';
  return { ...p, availableSizes, stock, available: units > 0 };
}

export function loadProducts() {
  cache ??= fetch(new URL('../../data/products.json', import.meta.url))
    .then((response) => {
      if (!response.ok) throw new Error(`Catalogue unavailable (${response.status})`);
      return response.json();
    })
    .then((list) => list.map(normalise))
    .catch((error) => {
      cache = undefined; // a failed load must not be remembered: the next call retries
      throw error;
    });
  return cache;
}

/** @returns {Promise<Product[]>} */
export const getProducts = loadProducts;

/** @returns {Promise<Product|undefined>} */
export const getProduct = async (slug) => (await loadProducts()).find((p) => p.slug === slug);

/** @returns {Promise<{slug: string, name: string, count: number}[]>} */
export async function getBrands() {
  const products = await loadProducts();
  return BRAND_ORDER.map((name) => ({ slug: brandSlug(name), name, count: products.filter((p) => p.brand === name).length })).filter(
    (brand) => brand.count,
  );
}

/** @returns {Promise<{slug: string, name: string, count: number}[]>} */
export async function getCategories() {
  const products = await loadProducts();
  return Object.entries(CATEGORY_NAMES).map(([slug, name]) => ({ slug, name, count: products.filter((p) => p.category === slug).length }));
}

/** Units that can still be bought in this size. */
export const stockFor = (p, size) => p?.inventory?.[size] ?? 0;

export const getBySlug = getProduct;

export const isOnSale = (p) => Boolean(p.compareAtPrice && p.compareAtPrice > p.price);
export const isSoldOut = (p) => !p.available;
export const hasSizes = (p) => p.sizes.length > 1;
export const sizeLabel = (p, size) => (p.sizeSystem === 'EU' ? `EU ${size}` : size);

export const CATEGORY_NAMES = { sneakers: 'Sneakers', clothing: 'Clothing', accessories: 'Accessories' };
export const BRAND_ORDER = ['Nike', 'adidas', 'New Balance', 'ASICS', 'Salomon', 'DUBLIN/01'];
export const brandSlug = (brand) => brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const fold = (text) =>
  String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Ranked full-text search over name, brand, category, subcategory, style, gender, colour, collection, material and keywords. */
export const foldText = (text) => fold(text);

export function searchProducts(products, query) {
  const terms = fold(query).split(' ').filter(Boolean);
  if (!terms.length) return [];
  return products
    .map((p) => {
      const fields = [
        [fold(`${p.brand} ${p.name}`), 4],
        [fold(p.brand), 3],
        [fold([p.category, p.type, p.subcategory, p.style, p.gender].join(' ')), 2],
        [fold([p.color, ...p.colors, p.collection, p.material, ...p.keywords].join(' ')), 1],
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
