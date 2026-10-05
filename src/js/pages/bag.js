/**
 * Bag page: line items with quantity steppers, remove, delivery progress and totals.
 */

import { qs } from '../utils/dom.js';
import { pageUrl } from '../utils/paths.js';
import { formatPrice, pluralize } from '../utils/format.js';
import { loadProducts } from '../data/catalog.js';
import { cartDetails, FREE_DELIVERY_THRESHOLD } from '../modules/cart.js';
import { lineHtml, bindLines, keepLineFocus } from '../modules/bag-lines.js';
import { toast } from '../modules/toast.js';

const root = qs('[data-bag]');

async function render() {
  const products = await loadProducts();
  const { lines, subtotal, count, delivery, total } = cartDetails(products);
  qs('[data-count]').textContent = pluralize(count, 'item');

  if (!lines.length) {
    root.innerHTML = `<div class="border border-neutral-200 px-6 py-16 text-center lg:py-24">
      <p class="type-h3">Your bag is empty.</p>
      <p class="type-body mt-3 text-neutral-600">Have a look at what came in this week.</p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a class="btn btn-primary" href="${pageUrl('new-arrivals')}">Shop new arrivals</a>
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
          <li>30-day returns</li>
          <li>14-day legal right to cancel</li>
        </ul>
      </div>
    </aside>
  </div>`;
}

if (root) {
  bindLines(root, { onRemove: () => toast('Removed from bag') });
  document.addEventListener('cart:change', keepLineFocus(root, render, () => qs('h1')));
  render();
}
