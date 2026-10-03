/**
 * Global header: sticky state and desktop mega menus.
 * Markup hooks: [data-header], [data-announcement], [data-mega-trigger] (aria-controls → panel id).
 */

import { qs, qsa, mediaDesktop } from '../utils/dom.js';
import { asset, productUrl, escapeHtml } from '../utils/paths.js';
import { formatPrice } from '../utils/format.js';
import { getBySlug } from '../data/catalog.js';

// Hover intent: a short pause before opening, a longer tolerance before closing.
const OPEN_DELAY = 110;
const SWITCH_DELAY = 140;
const CLOSE_DELAY = 260;

export function initHeader() {
  const header = qs('[data-header]');
  if (!header) return;

  initStickyState(header);
  initMegaMenus(header);
}

/** Adds [data-scrolled] once the announcement bar has left the viewport. */
function initStickyState(header) {
  const announcement = qs('[data-announcement]', header);
  if (!announcement) return;
  // -1px: the bar rests exactly at the viewport edge once scrolled away.
  const observer = new IntersectionObserver(
    ([entry]) => header.toggleAttribute('data-scrolled', !entry.isIntersecting),
    { rootMargin: '-1px 0px 0px 0px' },
  );
  observer.observe(announcement);
}

/**
 * Fills a panel's [data-mega-featured="<slug>"] slot from the catalogue the
 * first time it opens. If the product is missing, the typographic fallback stays.
 */
async function fillFeatured(panel) {
  const slot = panel?.querySelector('[data-mega-featured]:not([data-ready])');
  if (!slot) return;
  slot.setAttribute('data-ready', '');
  try {
    const p = await getBySlug(slot.dataset.megaFeatured);
    if (!p) return;
    const image = p.images[0].replace(/\.webp$/, '-sm.webp');
    const title = p.brand === 'DUBLIN/01' ? p.name : `${p.brand} ${p.name}`;
    slot.innerHTML = `<p class="mega-heading">Featured</p>
      <div class="mega-feature-card">
        <a href="${productUrl(p.slug)}" tabindex="-1" aria-hidden="true"><img src="${asset(image)}" width="480" height="600" alt="" loading="lazy" /></a>
        <div>
          <p class="type-micro text-neutral-600">${escapeHtml(p.brand)}</p>
          <p class="type-h3 mt-2">${escapeHtml(p.name)}</p>
          <p class="type-body-sm mt-1 text-neutral-600">${escapeHtml(p.color)} · ${formatPrice(p.price)}</p>
          <a class="link-action mt-3" href="${productUrl(p.slug)}">View <span class="sr-only">${escapeHtml(title)}</span>
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
        </div>
      </div>`;
  } catch {
    /* Keep the fallback copy. */
  }
}

function initMegaMenus(header) {
  const bar = qs('.nav-bar', header);
  const triggers = qsa('[data-mega-trigger]', header);
  if (!bar || !triggers.length) return;

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let current = null;
  let openedAt = 0;
  let timer = 0;

  const panelFor = (trigger) => document.getElementById(trigger.getAttribute('aria-controls'));

  const open = (trigger) => {
    if (current === trigger) return;
    fillFeatured(panelFor(trigger));
    if (current) close({ instant: true });
    current = trigger;
    openedAt = performance.now();
    trigger.setAttribute('aria-expanded', 'true');
    panelFor(trigger)?.setAttribute('data-open', '');
    header.setAttribute('data-mega-open', '');
  };

  function close({ focusTrigger = false } = {}) {
    if (!current) return;
    const trigger = current;
    current = null;
    trigger.setAttribute('aria-expanded', 'false');
    panelFor(trigger)?.removeAttribute('data-open');
    header.removeAttribute('data-mega-open');
    if (focusTrigger) trigger.focus();
  }

  const schedule = (fn, delay) => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      clearTimeout(timer);
      // A click right after a hover-open confirms it rather than closing it.
      if (current === trigger && performance.now() - openedAt > 400) close();
      else open(trigger);
    });
  });

  // Hover intent, only on devices with a real pointer. Opening and switching
  // both need the pointer to rest on a link; brushing past one on the way to
  // the open panel (a diagonal move) cancels the pending change.
  qsa('[data-nav-item]', header).forEach((item) => {
    item.addEventListener('pointerenter', () => {
      if (!canHover.matches) return;
      if (item.matches('[data-mega-trigger]')) {
        if (item === current) clearTimeout(timer);
        else schedule(() => open(item), current ? SWITCH_DELAY : OPEN_DELAY);
      } else if (current) schedule(() => close(), CLOSE_DELAY);
    });
    item.addEventListener('pointerleave', () => canHover.matches && clearTimeout(timer));
  });

  triggers.forEach((trigger) => {
    panelFor(trigger)?.addEventListener('pointerenter', () => clearTimeout(timer));
  });

  bar.addEventListener('pointerleave', () => canHover.matches && schedule(() => close(), CLOSE_DELAY));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && current) close({ focusTrigger: true });
  });

  document.addEventListener('click', (event) => {
    if (current && !bar.contains(event.target)) close();
  });

  bar.addEventListener('focusout', (event) => {
    if (current && event.relatedTarget && !bar.contains(event.relatedTarget)) close();
  });

  mediaDesktop.addEventListener('change', () => close());
}
