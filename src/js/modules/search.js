/**
 * Search overlay with live results from the catalogue. Pressing Enter goes to
 * pages/search.html?q= for the full result grid.
 * Markup hooks: [data-search] dialog, [data-search-trigger], [data-search-live],
 * [data-search-popular], [data-search-status].
 */

import { qs, qsa } from '../utils/dom.js';
import { initDialog, openDialog, closeDialog } from '../utils/dialog.js';
import { loadProducts, searchProducts } from '../data/catalog.js';
import { asset, pageUrl, productUrl, escapeHtml } from '../utils/paths.js';
import { formatPrice } from '../utils/format.js';
import { smallImage, imageAlt } from './product-card.js';

const PREVIEW_LIMIT = 4;

export function initSearch() {
  const dialog = qs('[data-search]');
  if (!dialog) return;
  initDialog(dialog);

  const input = qs('input[type="search"]', dialog);
  const form = qs('form', dialog);
  const live = qs('[data-search-live]', dialog);
  const popular = qs('[data-search-popular]', dialog);
  const status = qs('[data-search-status]', dialog);
  const menu = qs('[data-menu]');
  const menuTrigger = qs('[data-menu-trigger]');

  qsa('[data-search-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      let returnFocus = trigger;
      // Opened from the mobile menu: close it and return focus to the menu button.
      if (menu?.open && menu.contains(trigger)) {
        closeDialog(menu, { restoreFocus: false });
        returnFocus = menuTrigger;
      }
      openDialog(dialog, { returnFocus, initialFocus: input });
      loadProducts(); // warm the catalogue
    });
  });

  let timer;
  input?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => renderLive(input.value), 120);
  });

  async function renderLive(query) {
    const q = query.trim();
    if (!q) {
      live.hidden = true;
      popular.hidden = false;
      status.textContent = '';
      return;
    }
    const results = searchProducts(await loadProducts(), q);
    popular.hidden = true;
    live.hidden = false;
    status.textContent = results.length ? `${results.length} results for ${q}` : `No results for ${q}`;
    const all = pageUrl('search', { q });
    live.innerHTML = results.length
      ? `<ul class="search-live-grid" role="list">${results
          .slice(0, PREVIEW_LIMIT)
          .map(
            (p) => `<li><a class="search-live-item" href="${productUrl(p.slug)}">
              <img src="${asset(smallImage(p.images[0]))}" width="80" height="100" alt="${escapeHtml(imageAlt(p))}" loading="lazy" />
              <span class="min-w-0"><span class="type-micro block text-neutral-600">${escapeHtml(p.brand)}</span>
              <span class="type-body-sm block truncate">${escapeHtml(p.name)}</span>
              <span class="type-body-sm block tabular-nums text-neutral-600">${formatPrice(p.price)}</span></span></a></li>`,
          )
          .join('')}</ul>
        <a class="link-action mt-6" href="${all}">View all ${results.length} results
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>`
      : `<p class="type-body text-neutral-600">No matches for “${escapeHtml(q)}”. Try a brand like <a class="link-editorial" href="${pageUrl('search', { q: 'adidas' })}">adidas</a> or a style like <a class="link-editorial" href="${pageUrl('search', { q: 'running' })}">running</a>.</p>`;
  }

  // Empty queries stay on the page.
  form?.addEventListener('submit', (event) => {
    if (!input.value.trim()) {
      event.preventDefault();
      input.focus();
    }
  });
}
