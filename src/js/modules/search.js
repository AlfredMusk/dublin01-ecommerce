/**
 * Search UI: the inline field in the navigation bar (desktop) and the overlay
 * (tablet and mobile). Both render instant results from the search source
 * adapter; pressing Enter goes to search.html?q= for the full grid.
 *
 * Hooks — field: [data-nav-search], [data-nav-search-panel], [data-nav-search-results],
 * [data-nav-search-status]. Overlay: [data-search], [data-search-trigger],
 * [data-search-live], [data-search-popular], [data-search-status].
 */

import { qs, qsa, mediaDesktop } from '../utils/dom.js';
import { initDialog, openDialog, closeDialog } from '../utils/dialog.js';
import { search, prepareSearch } from '../data/search-source.js';
import { asset, pageUrl, productUrl, escapeHtml } from '../utils/paths.js';
import { formatPrice, pluralize } from '../utils/format.js';
import { smallImage } from './product-card.js';

const PREVIEW_LIMIT = 4;
const RENDER_DELAY = 120;
// Screen readers hear the result count once typing settles, not on every key.
const ANNOUNCE_DELAY = 700;

const ARROW = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>';
const UNAVAILABLE = '<p class="type-body text-neutral-600">Search is unavailable right now. Try again in a moment.</p>';

const shortcutsHtml = (shortcuts) =>
  shortcuts.length
    ? `<p class="mega-heading">Brands and categories</p>
    <ul class="mb-6 flex flex-wrap gap-2" role="list">${shortcuts
      .map((s) => `<li><a class="chip" href="${asset(s.href)}"><span class="text-neutral-600">${s.kind}</span> ${escapeHtml(s.label)}</a></li>`)
      .join('')}</ul>`
    : '';

/** Shared markup for instant results: matching brands and categories, then products. */
function resultsHtml({ query, total, results, shortcuts }) {
  if (!total) {
    return `${shortcutsHtml(shortcuts)}<p class="type-body text-neutral-600">No products match “${escapeHtml(query)}”. Check the spelling, or try a brand like <a class="link-editorial" href="${pageUrl('search', { q: 'adidas' })}">adidas</a> or a style like <a class="link-editorial" href="${pageUrl('search', { q: 'running' })}">running</a>.</p>`;
  }
  // Thumbnails are decorative here: the product name follows in the same link.
  return `${shortcutsHtml(shortcuts)}<p class="mega-heading">Products</p>
    <ul class="search-live-grid" role="list">${results
      .map(
        (p) => `<li><a class="search-live-item" href="${productUrl(p.slug)}">
          <img src="${asset(smallImage(p.images[0]))}" width="80" height="100" alt="" loading="lazy" />
          <span class="min-w-0"><span class="type-micro block text-neutral-600">${escapeHtml(p.brand)}</span>
          <span class="type-body-sm block truncate">${escapeHtml(p.name)}</span>
          <span class="type-body-sm block truncate text-neutral-600">${escapeHtml(p.color)}</span>
          <span class="type-body-sm block tabular-nums text-neutral-600">${formatPrice(p.price)}</span></span></a></li>`,
      )
      .join('')}</ul>
    <a class="link-action mt-6" href="${pageUrl('search', { q: query })}">${total === 1 ? 'View 1 result' : `View all ${total} results`} ${ARROW}</a>`;
}

/** Up and down arrows move through the suggestions; up from the first returns to the field. */
function arrowNavigation(container, input) {
  container.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = qsa('a', container);
    const i = links.indexOf(document.activeElement);
    if (i < 0) return;
    event.preventDefault();
    const next = links[i + (event.key === 'ArrowDown' ? 1 : -1)];
    if (next) next.focus();
    else if (event.key === 'ArrowUp') input.focus();
  });
}

const statusText = ({ query, total }) => (total ? `${pluralize(total, 'result')} for ${query}` : `No results for ${query}`);

/** Debounced text for a polite live region. */
function announcer(element) {
  let timer;
  return (text) => {
    clearTimeout(timer);
    if (!text) element.textContent = '';
    else timer = setTimeout(() => (element.textContent = text), ANNOUNCE_DELAY);
  };
}

const blockEmptySubmit = (form, input) =>
  form?.addEventListener('submit', (event) => {
    if (!input.value.trim()) {
      event.preventDefault();
      input.focus();
    }
  });

/** Inline field in the navigation bar, with a results panel under the header. */
function initNavSearch() {
  const form = qs('[data-nav-search]');
  const panel = qs('[data-nav-search-panel]');
  if (!form || !panel) return;
  const header = form.closest('[data-header]');
  const bar = form.closest('.nav-bar');
  const input = qs('input', form);
  const results = qs('[data-nav-search-results]', panel);
  const announce = announcer(qs('[data-nav-search-status]'));
  let latest = 0;
  let timer;

  // Closing also cancels a pending keystroke and any search still in flight,
  // so the panel cannot reopen by itself.
  const close = () => {
    clearTimeout(timer);
    latest += 1;
    panel.hidden = true;
    header.removeAttribute('data-search-open');
    announce('');
  };

  const render = async () => {
    const ticket = ++latest;
    let html;
    let found;
    try {
      found = await search(input.value, { limit: PREVIEW_LIMIT });
      html = found.query ? resultsHtml(found) : '';
    } catch {
      html = UNAVAILABLE;
    }
    // A newer keystroke, a close, or focus leaving the form wins.
    if (ticket !== latest || !form.contains(document.activeElement)) return;
    if (!html) return close();
    results.innerHTML = html;
    announce(found ? statusText(found) : 'Search is unavailable.');
    panel.hidden = false;
    header.setAttribute('data-search-open', '');
    document.dispatchEvent(new CustomEvent('header:search-open'));
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(render, RENDER_DELAY);
  };

  // Focusing a field that already holds a query shows its results again,
  // except when the focus comes straight back from an Escape.
  let dismissed = false;
  input.addEventListener('focus', () => {
    prepareSearch();
    if (input.value.trim() && panel.hidden && !dismissed) schedule();
    dismissed = false;
  });
  input.addEventListener('input', schedule);
  input.addEventListener('keydown', (event) => {
    // Arrow down jumps from the field to the first result.
    if (event.key === 'ArrowDown' && !panel.hidden) {
      event.preventDefault();
      qs('a', results)?.focus();
    }
  });
  // Escape always closes the panel. From the field or a result, focus returns to the field.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || panel.hidden) return;
    const inside = form.contains(document.activeElement);
    close();
    if (!inside) return;
    event.preventDefault();
    dismissed = document.activeElement !== input;
    input.focus();
  });
  blockEmptySubmit(form, input);
  arrowNavigation(results, input);

  // Any click outside the form closes it, including empty areas of the navigation bar.
  document.addEventListener('click', (event) => {
    if (!panel.hidden && !form.contains(event.target)) close();
  });
  bar.addEventListener('focusout', (event) => {
    if (event.relatedTarget && !form.contains(event.relatedTarget)) close();
  });
  document.addEventListener('header:mega-open', close);
  // Below 1280px the field is hidden: never leave its panel behind.
  mediaDesktop.addEventListener('change', close);
}

/** Overlay opened from the search icon (tablet, mobile) or the mobile menu. */
function initSearchOverlay() {
  const dialog = qs('[data-search]');
  if (!dialog) return;
  initDialog(dialog);

  const input = qs('input[type="search"]', dialog);
  const live = qs('[data-search-live]', dialog);
  const popular = qs('[data-search-popular]', dialog);
  const announce = announcer(qs('[data-search-status]', dialog));
  const menu = qs('[data-menu]');
  const menuTrigger = qs('[data-menu-trigger]');
  let latest = 0;
  let timer;

  qsa('[data-search-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      let returnFocus = trigger;
      // Opened from the mobile menu: close it and return focus to the menu button.
      if (menu?.open && menu.contains(trigger)) {
        closeDialog(menu, { restoreFocus: false });
        returnFocus = menuTrigger;
      }
      openDialog(dialog, { returnFocus, initialFocus: input });
      prepareSearch();
    });
  });

  const render = async () => {
    const ticket = ++latest;
    let html;
    let found;
    try {
      found = await search(input.value, { limit: PREVIEW_LIMIT });
      html = found.query ? resultsHtml(found) : '';
    } catch {
      html = UNAVAILABLE;
    }
    if (ticket !== latest) return;
    live.hidden = !html;
    popular.hidden = Boolean(html);
    live.innerHTML = html;
    announce(!html ? '' : found ? statusText(found) : 'Search is unavailable.');
  };

  input?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(render, RENDER_DELAY);
  });
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' && !live.hidden) {
      event.preventDefault();
      qs('a', live)?.focus();
    }
  });
  arrowNavigation(live, input);

  blockEmptySubmit(qs('form', dialog), input);
}

export function initSearch() {
  initNavSearch();
  initSearchOverlay();
}
