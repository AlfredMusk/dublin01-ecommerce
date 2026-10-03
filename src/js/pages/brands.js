/**
 * Brands page: product counts per brand ([data-brand-count="<slug>"]).
 */

import { qsa } from '../utils/dom.js';
import { loadProducts, brandSlug } from '../data/catalog.js';
import { pluralize } from '../utils/format.js';

loadProducts().then((products) => {
  qsa('[data-brand-count]').forEach((el) => {
    const n = products.filter((p) => brandSlug(p.brand) === el.dataset.brandCount).length;
    el.textContent = pluralize(n, 'style');
  });
});
