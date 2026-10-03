/**
 * Bag page: line items with quantity steppers, remove, delivery progress and totals.
 */

import { qs } from '../utils/dom.js';
import { asset, productUrl, pageUrl, escapeHtml } from '../utils/paths.js';
import { formatPrice, pluralize } from '../utils/format.js';
import { loadProducts } from '../data/catalog.js';
import { cartDetails, setQuantity, removeFromCart, MAX_QTY, FREE_DELIVERY_THRESHOLD } from '../modules/cart.js';
import { imageAlt, smallImage } from '../modules/product-card.js';
import { toast } from '../modules/toast.js';

const root = qs('[data-bag]');
const minus = '<svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>';
const plus = '<svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>';

function lineHtml({ product: p, size, qty }) {
  const name = escapeHtml(p.brand === 'DUBLIN/01' ? p.name : `${p.brand} ${p.name}`);
  const sizeLabel = size === 'One size' ? 'One size' : `Size ${escapeHtml(size)}`;
  return `<li class="bag-line" data-line data-slug="${p.slug}" data-size="${escapeHtml(size)}">
    <a class="bag-line-media" href="${productUrl(p.slug)}" tabindex="-1" aria-hidden="true">
      <img src="${asset(smallImage(p.images[0]))}" width="480" height="600" alt="${escapeHtml(imageAlt(p))}" loading="lazy" />
    </a>
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="type-micro text-neutral-600">${escapeHtml(p.brand)}</p>
          <h3 class="type-body mt-1 font-medium"><a class="link-editorial" href="${productUrl(p.slug)}">${escapeHtml(p.name)}</a></h3>
          <p class="type-body-sm mt-1 text-neutral-600">${escapeHtml(p.color)} · ${sizeLabel}</p>
        </div>
        <p class="type-body shrink-0 tabular-nums">${formatPrice(p.price * qty)}</p>
      </div>
      <div class="mt-4 flex items-center justify-between gap-4">
        <div class="stepper" role="group" aria-label="Quantity for ${name}, ${sizeLabel}">
          <button type="button" data-qty="-1" aria-label="Decrease quantity">${minus}</button>
          <output aria-live="polite">${qty}</output>
          <button type="button" data-qty="1" aria-label="Increase quantity"${qty >= MAX_QTY ? ' disabled' : ''}>${plus}</button>
        </div>
        <button class="link-subtle type-body-sm underline underline-offset-4" type="button" data-remove>Remove<span class="sr-only"> ${name}, ${sizeLabel}</span></button>
      </div>
    </div>
  </li>`;
}

async function render() {
  const products = await loadProducts();
  const { lines, subtotal, count, delivery, total } = cartDetails(products);
  qs('[data-count]').textContent = pluralize(count, 'item');

  if (!lines.length) {
    root.innerHTML = `<div class="border border-neutral-200 px-6 py-16 text-center lg:py-24">
      <p class="type-h3">Your bag is empty.</p>
      <p class="type-body mt-3 text-neutral-600">Have a look at what came in this week.</p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a class="btn btn-primary" href="${pageUrl('new')}">Shop new arrivals</a>
        <a class="btn btn-secondary" href="${pageUrl('wishlist')}">View wishlist</a>
      </div></div>`;
    return;
  }

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD);
  root.innerHTML = `<div class="grid-site gap-y-10">
    <section class="col-span-full lg:col-span-7" aria-label="Items">
      <ul class="divide-y divide-neutral-200 border-y border-neutral-200" role="list">${lines.map(lineHtml).join('')}</ul>
    </section>
    <aside class="col-span-full lg:col-span-4 lg:col-start-9" aria-label="Order summary">
      <div class="summary">
        <h2 class="type-label">Order summary</h2>
        <div class="mt-6">
          <p class="type-body-sm">${remaining > 0 ? `Spend <strong class="font-medium">${formatPrice(remaining)}</strong> more for free delivery.` : 'Your order qualifies for free delivery in Ireland.'}</p>
          <div class="progress mt-3" aria-hidden="true"><span style="transform: scaleX(${progress})"></span></div>
        </div>
        <dl class="summary-rows mt-6">
          <div><dt>Subtotal</dt><dd>${formatPrice(subtotal)}</dd></div>
          <div><dt>Delivery <span class="text-neutral-600">(standard, Ireland)</span></dt><dd>${delivery ? formatPrice(delivery) : 'Free'}</dd></div>
          <div class="summary-total"><dt>Estimated total</dt><dd>${formatPrice(total)}</dd></div>
        </dl>
        <p class="type-body-sm mt-2 text-neutral-600">Including VAT. Express delivery is chosen at checkout.</p>
        <a class="btn btn-primary btn-block mt-6" href="${pageUrl('checkout')}">Checkout</a>
        <ul class="type-body-sm mt-6 space-y-2 text-neutral-600" role="list">
          <li>Free returns within 30 days</li>
          <li>Secure checkout</li>
        </ul>
      </div>
    </aside>
  </div>`;
}

root?.addEventListener('click', (event) => {
  const line = event.target.closest('[data-line]');
  if (!line) return;
  const { slug, size } = line.dataset;
  const qtyButton = event.target.closest('[data-qty]');
  if (qtyButton) {
    const current = Number(qs('output', line).textContent);
    const next = current + Number(qtyButton.dataset.qty);
    setQuantity(slug, size, next);
    if (next === 0) toast('Removed from bag');
  }
  if (event.target.closest('[data-remove]')) {
    removeFromCart(slug, size);
    toast('Removed from bag');
  }
});

// Keep focus on the stepper after a re-render.
document.addEventListener('cart:change', async () => {
  const focused = document.activeElement?.closest('[data-line]');
  const key = focused && `${focused.dataset.slug}|${focused.dataset.size}`;
  const action = document.activeElement?.dataset.qty;
  await render();
  if (key) {
    const line = [...root.querySelectorAll('[data-line]')].find((el) => `${el.dataset.slug}|${el.dataset.size}` === key);
    const target = line && (action ? line.querySelector(`[data-qty="${action}"]`) : null);
    (target && !target.disabled ? target : line?.querySelector('[data-qty="1"]') ?? qs('h1'))?.focus();
  }
});

render();
