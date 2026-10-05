/**
 * Bag line items, shared by the bag page and the bag drawer: markup for one
 * line (thumbnail, name, size, quantity stepper, remove) and the click
 * handling for the stepper and the remove button.
 */

import { qs } from '../utils/dom.js';
import { asset, productUrl, escapeHtml } from '../utils/paths.js';
import { formatPrice } from '../utils/format.js';
import { sizeLabel, hasSizes } from '../data/catalog.js';
import { setQuantity, removeFromCart } from './cart.js';
import { imageAlt, productTitle, smallImage } from './product-card.js';

const minus = '<svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>';
const plus = '<svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>';

export function lineHtml({ product: p, size, qty, max }) {
  const name = escapeHtml(productTitle(p));
  const variant = hasSizes(p) ? `Size ${escapeHtml(sizeLabel(p, size))}` : escapeHtml(size);
  return `<li class="bag-line" data-line data-slug="${p.slug}" data-size="${escapeHtml(size)}" data-max="${max}">
    <a class="bag-line-media" href="${productUrl(p.slug)}" tabindex="-1" aria-hidden="true">
      <img src="${asset(smallImage(p.images[0]))}" width="480" height="600" alt="${escapeHtml(imageAlt(p))}" loading="lazy" />
    </a>
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="type-micro text-neutral-600">${escapeHtml(p.brand)}</p>
          <h3 class="type-body mt-1 font-medium"><a class="link-editorial" href="${productUrl(p.slug)}">${escapeHtml(p.name)}</a></h3>
          <p class="type-body-sm mt-1 text-neutral-600">${escapeHtml(p.color)} · ${variant}</p>
        </div>
        <p class="type-body shrink-0 tabular-nums">${formatPrice(p.price * qty)}</p>
      </div>
      <div class="mt-4 flex items-center justify-between gap-4">
        <div class="stepper" role="group" aria-label="Quantity for ${name}, ${variant}">
          <button type="button" data-qty="-1" aria-label="Decrease quantity">${minus}</button>
          <output aria-live="polite">${qty}</output>
          <button type="button" data-qty="1" aria-label="Increase quantity"${qty >= max ? ' disabled' : ''}>${plus}</button>
        </div>
        <button class="link-subtle type-body-sm underline underline-offset-4" type="button" data-remove>Remove<span class="sr-only"> ${name}, ${variant}</span></button>
      </div>
      ${qty >= max && max < 10 ? `<p class="type-body-sm mt-3 text-neutral-600">That is all we have in this size.</p>` : ''}
    </div>
  </li>`;
}

/** Wires the steppers and remove buttons of every line inside `root`. */
export function bindLines(root, { onRemove } = {}) {
  root.addEventListener('click', (event) => {
    const line = event.target.closest('[data-line]');
    if (!line) return;
    const { slug, size, max } = line.dataset;
    const step = event.target.closest('[data-qty]');
    if (step) {
      const next = Number(qs('output', line).textContent) + Number(step.dataset.qty);
      setQuantity(slug, size, next, Number(max));
      if (next === 0) onRemove?.();
    }
    if (event.target.closest('[data-remove]')) {
      removeFromCart(slug, size);
      onRemove?.();
    }
  });
}

/** After a re-render, puts focus back on the control that was used. */
export function keepLineFocus(root, render, fallback) {
  return async () => {
    const focused = root.contains(document.activeElement) ? document.activeElement.closest('[data-line]') : null;
    const key = focused && `${focused.dataset.slug}|${focused.dataset.size}`;
    const action = document.activeElement?.dataset.qty;
    await render();
    if (!key) return;
    const line = [...root.querySelectorAll('[data-line]')].find((el) => `${el.dataset.slug}|${el.dataset.size}` === key);
    const target = line && action ? line.querySelector(`[data-qty="${action}"]`) : null;
    (target && !target.disabled ? target : line?.querySelector('[data-qty="-1"]') ?? fallback?.())?.focus();
  };
}
