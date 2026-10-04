/**
 * Wishlist page: renders saved products and re-renders on change.
 */

import { qs } from '../utils/dom.js';
import { loadProducts } from '../data/catalog.js';
import { getWishlist } from '../modules/wishlist.js';
import { productCard } from '../modules/product-card.js';
import { pluralize } from '../utils/format.js';

const results = qs('[data-results]');
const empty = qs('[data-empty]');
const count = qs('[data-count]');

async function render() {
  const products = await loadProducts();
  const list = getWishlist().map((slug) => products.find((p) => p.slug === slug)).filter(Boolean);
  count.textContent = pluralize(list.length, 'item');
  empty.hidden = list.length > 0;
  results.hidden = list.length === 0;
  results.innerHTML = list.map((p) => productCard(p, { quickAdd: true })).join('');
  document.dispatchEvent(new CustomEvent('catalog:rendered'));
}

document.addEventListener('wishlist:change', render);
render();
