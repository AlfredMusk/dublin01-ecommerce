/**
 * Checkout UI for Ireland: contact, delivery address, shipping method and a
 * payment step that stops before any transaction. A payment provider
 * (e.g. hosted fields) would mount in [data-payment-mount].
 */

import { qs, qsa } from '../utils/dom.js';
import { asset, pageUrl, escapeHtml } from '../utils/paths.js';
import { formatPrice } from '../utils/format.js';
import { validateForm, clearOnInput, EIRCODE } from '../utils/forms.js';
import { loadProducts } from '../data/catalog.js';
import { cartDetails, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY, EXPRESS_DELIVERY } from '../modules/cart.js';
import { imageAlt, smallImage } from '../modules/product-card.js';

const form = qs('[data-checkout]');
const summary = qs('[data-summary]');

const shippingCost = (method, subtotal) =>
  method === 'express' ? EXPRESS_DELIVERY : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY;

async function renderSummary() {
  const { lines, subtotal } = cartDetails(await loadProducts());
  const method = new FormData(form).get('shipping') ?? 'standard';
  const delivery = shippingCost(method, subtotal);
  qs('[data-standard-price]').textContent = subtotal >= FREE_DELIVERY_THRESHOLD ? 'Free' : formatPrice(STANDARD_DELIVERY);
  summary.innerHTML = `
    <ul class="space-y-4" role="list">${lines
      .map(
        ({ product: p, size, qty }) => `<li class="flex gap-4">
        <span class="relative shrink-0"><img class="aspect-[4/5] w-16 bg-bone object-cover" src="${asset(smallImage(p.images[0]))}" width="64" height="80" alt="${escapeHtml(imageAlt(p))}" />
          <span class="qty-badge" aria-label="Quantity ${qty}">${qty}</span></span>
        <span class="min-w-0 flex-1"><span class="type-micro block text-neutral-600">${escapeHtml(p.brand)}</span>
          <span class="type-body-sm block">${escapeHtml(p.name)}</span>
          <span class="type-body-sm block text-neutral-600">${size === 'One size' ? 'One size' : `Size ${escapeHtml(size)}`}</span></span>
        <span class="type-body-sm tabular-nums">${formatPrice(p.price * qty)}</span></li>`,
      )
      .join('')}</ul>
    <dl class="summary-rows mt-6 border-t border-neutral-200 pt-4">
      <div><dt>Subtotal</dt><dd>${formatPrice(subtotal)}</dd></div>
      <div><dt>Delivery</dt><dd>${delivery ? formatPrice(delivery) : 'Free'}</dd></div>
      <div class="summary-total"><dt>Total</dt><dd>${formatPrice(subtotal + delivery)}</dd></div>
    </dl>
    <p class="type-body-sm mt-2 text-neutral-600">Including VAT.</p>`;
  return lines.length;
}

async function init() {
  if (!form) return;
  const count = await renderSummary();
  if (!count) {
    qs('[data-checkout-layout]').innerHTML = `<div class="col-span-full border border-neutral-200 px-6 py-16 text-center">
      <p class="type-h3">Your bag is empty.</p>
      <p class="type-body mt-3 text-neutral-600">Add something before checking out.</p>
      <a class="btn btn-primary mt-8" href="${pageUrl('new-arrivals')}">Shop new arrivals</a></div>`;
    return;
  }

  clearOnInput(form);
  form.addEventListener('change', (event) => {
    if (event.target.name === 'shipping') renderSummary();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const valid = validateForm(form, {
      eircode: (v) => (EIRCODE.test(v) ? '' : 'Enter a valid Eircode, like D02 X285.'),
      phone: (v) => (/^\+?[\d\s()-]{7,}$/.test(v) ? '' : 'Enter a valid phone number, like 087 123 4567.'),
    });
    const status = qs('[data-payment-status]');
    if (!valid) {
      status.hidden = true;
      return;
    }
    qsa('[data-step]').forEach((el) => el.setAttribute('data-complete', ''));
    status.hidden = false;
    status.focus();
  });
}

init();
