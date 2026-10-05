import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import './setup.mjs';

const { normalise, searchProducts, isOnSale, BRAND_ORDER } = await import('../src/js/data/catalog.js');
const { formatPrice } = await import('../src/js/utils/format.js');
const { commerce } = await import('../src/js/config.js');

const root = fileURLToPath(new URL('..', import.meta.url));
const raw = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url), 'utf8'));
const products = raw.map(normalise);

test('catalogue has about 32 products with unique ids and slugs', () => {
  assert.ok(products.length >= 30 && products.length <= 36, `got ${products.length}`);
  assert.equal(new Set(products.map((p) => p.slug)).size, products.length);
  assert.equal(new Set(products.map((p) => p.id)).size, products.length);
});

test('every product has the required fields', () => {
  for (const p of raw) {
    for (const key of ['id', 'slug', 'name', 'brand', 'category', 'type', 'subcategory', 'gender', 'price', 'currency', 'images', 'color', 'colors', 'description', 'details', 'material', 'sizes', 'inventory', 'collection', 'createdAt', 'keywords']) {
      assert.ok(p[key] !== undefined && p[key] !== '', `${p.slug}: ${key}`);
    }
    assert.ok(BRAND_ORDER.includes(p.brand), `${p.slug}: brand ${p.brand}`);
    assert.ok(['sneakers', 'clothing', 'accessories'].includes(p.category), p.slug);
    assert.ok(['men', 'women', 'unisex'].includes(p.gender), p.slug);
    assert.equal(p.currency, 'EUR');
    assert.ok(p.price > 0 && Number.isFinite(p.price), p.slug);
    assert.match(p.slug, /^[a-z0-9-]+$/);
  }
});

test('inventory covers exactly the listed sizes, with whole non-negative units', () => {
  for (const p of raw) {
    assert.deepEqual(Object.keys(p.inventory).sort(), [...p.sizes].sort(), p.slug);
    for (const units of Object.values(p.inventory)) assert.ok(Number.isInteger(units) && units >= 0, p.slug);
  }
});

test('stock state is derived from inventory', () => {
  for (const p of products) {
    const units = Object.values(p.inventory).reduce((a, b) => a + b, 0);
    assert.equal(p.available, units > 0, p.slug);
    assert.deepEqual(p.availableSizes, p.sizes.filter((s) => p.inventory[s] > 0), p.slug);
    assert.equal(p.stock, units === 0 ? 'out_of_stock' : units <= commerce.lowStockThreshold ? 'low_stock' : 'in_stock', p.slug);
  }
});

test('footwear uses EU sizes between 35 and 48', () => {
  for (const p of raw.filter((x) => x.category === 'sneakers')) {
    assert.equal(p.sizeSystem, 'EU', p.slug);
    for (const size of p.sizes) assert.ok(Number(size) >= 35 && Number(size) <= 48, `${p.slug}: ${size}`);
  }
});

test('every image exists with its small variant, and no file is shared between products', () => {
  const seen = new Map();
  for (const p of raw) {
    assert.ok(p.images.length >= 1, p.slug);
    for (const image of p.images) {
      assert.ok(existsSync(root + image), `${p.slug}: ${image}`);
      assert.ok(existsSync(root + image.replace(/\.webp$/, '-sm.webp')), `${p.slug}: small ${image}`);
      assert.ok(!seen.has(image), `${image} used by ${seen.get(image)} and ${p.slug}`);
      seen.set(image, p.slug);
    }
  }
});

test('no invented reductions: a compare-at price must be higher than the price', () => {
  for (const p of raw) {
    if (p.compareAtPrice !== null) assert.ok(isOnSale(p), p.slug);
  }
});

test('brand prices carry a source or are flagged as development values', () => {
  for (const p of raw.filter((x) => x.brand !== 'DUBLIN/01')) {
    assert.ok(p.priceSource === null || (/^https:\/\//.test(p.priceSource.url) && /^\d{4}-\d{2}-\d{2}$/.test(p.priceSource.checked)), p.slug);
  }
});

test('running and trail, and each audience, are represented', () => {
  assert.ok(products.filter((p) => ['running', 'trail'].includes(p.style)).length >= 6);
  for (const gender of ['men', 'women', 'unisex']) assert.ok(products.some((p) => p.gender === gender), gender);
  for (const brand of BRAND_ORDER) assert.ok(products.some((p) => p.brand === brand), brand);
});

test('search finds products by name, brand, category, colour and keyword', () => {
  const slugs = (q) => searchProducts(products, q).map((p) => p.slug);
  assert.ok(slugs('new balance').every((s) => s.startsWith('new-balance')));
  assert.ok(slugs('new balance').length >= 3);
  assert.ok(slugs('samba').includes('adidas-samba-og-white-green'));
  assert.ok(slugs('running').length >= 3);
  assert.ok(slugs('black sneakers').every((s) => products.find((p) => p.slug === s).category === 'sneakers'));
  assert.ok(slugs('dublin').length >= 5);
  assert.deepEqual(slugs('zzzz'), []);
  assert.deepEqual(slugs('   '), []);
});

test('prices are formatted as euro for Ireland', () => {
  assert.equal(formatPrice(160), '€160.00');
  assert.equal(formatPrice(119.99), '€119.99');
  assert.equal(formatPrice(1234.5), '€1,234.50');
});
