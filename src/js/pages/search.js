/**
 * Search results page: search.html?q=
 */

import { qs } from '../utils/dom.js';
import { search } from '../data/search-source.js';
import { productCard, skeletonCards } from '../modules/product-card.js';
import { pageUrl, escapeHtml } from '../utils/paths.js';
import { pluralize } from '../utils/format.js';

const SUGGESTIONS = ['running', 'adidas', 'new balance', 'hoodie', 'jacket', 'white'];

async function init() {
  const q = (new URLSearchParams(location.search).get('q') ?? '').trim();
  const input = qs('#search-page-input');
  const results = qs('[data-results]');
  const heading = qs('[data-search-heading]');
  const count = qs('[data-count]');
  input.value = q;

  if (!q) {
    heading.textContent = 'Search';
    count.textContent = 'Type a product, brand or style.';
    results.innerHTML = '';
    return;
  }

  document.title = `“${q}” — Search — DUBLIN/01`;
  heading.textContent = `Results for “${q}”`;
  results.innerHTML = skeletonCards(4);
  let list;
  try {
    ({ results: list } = await search(q));
  } catch {
    count.textContent = '';
    results.innerHTML = '<p class="type-body col-span-full text-neutral-600">Search is unavailable right now. Refresh the page to try again.</p>';
    return;
  }
  count.textContent = pluralize(list.length, 'product');
  results.innerHTML = list.length
    ? list.map((p, i) => productCard(p, { eager: i < 4, quickAdd: true })).join('')
    : `<div class="col-span-full border border-neutral-200 px-6 py-16">
        <p class="type-h3">No results for “${escapeHtml(q)}”.</p>
        <p class="type-body mt-3 text-neutral-600">Check the spelling, or try one of these:</p>
        <ul class="mt-6 flex flex-wrap gap-2" role="list">${SUGGESTIONS.map(
          (s) => `<li><a class="chip" href="${pageUrl('search', { q: s })}">${s}</a></li>`,
        ).join('')}</ul>
      </div>`;
  document.dispatchEvent(new CustomEvent('catalog:rendered'));
}

init();
