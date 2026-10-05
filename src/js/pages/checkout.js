/**
 * Checkout, frontend only: contact → delivery → address → payment → review.
 * One step is open at a time; a finished step collapses to a summary with an
 * Edit button. Nothing typed here is stored or sent anywhere.
 *
 * Payment boundary: a provider's hosted fields mount in [data-payment-mount]
 * and the order is created by the backend (docs/api-contract.md). Until
 * `features.onlineOrdering` is true the final button stays disabled.
 */

import { qs, qsa } from '../utils/dom.js';
import { asset, pageUrl, escapeHtml } from '../utils/paths.js';
import { formatPrice } from '../utils/format.js';
import { validateForm, clearOnInput, EIRCODE } from '../utils/forms.js';
import { loadProducts, hasSizes, sizeLabel } from '../data/catalog.js';
import { cartDetails, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY, EXPRESS_DELIVERY } from '../modules/cart.js';
import { imageAlt, smallImage } from '../modules/product-card.js';
import { features } from '../config.js';

const form = qs('[data-checkout]');
const summary = qs('[data-summary]');
const steps = qsa('[data-step]', form ?? document);

const VALIDATORS = {
  eircode: (v) => (EIRCODE.test(v) ? '' : 'Enter a valid Eircode, like D02 X285.'),
  phone: (v) => (/^\+?[\d\s()-]{7,}$/.test(v) ? '' : 'Enter a valid phone number, like 087 123 4567.'),
};

const shippingCost = (method, subtotal) =>
  method === 'express' ? EXPRESS_DELIVERY : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY;

const value = (name) => String(new FormData(form).get(name) ?? '').trim();

async function renderSummary() {
  const { lines, subtotal } = cartDetails(await loadProducts());
  const delivery = shippingCost(value('shipping') || 'standard', subtotal);
  qs('[data-standard-price]').textContent = subtotal >= FREE_DELIVERY_THRESHOLD ? 'Free' : formatPrice(STANDARD_DELIVERY);
  qs('[data-express-price]').textContent = formatPrice(EXPRESS_DELIVERY);
  summary.innerHTML = `
    <ul class="space-y-4" role="list">${lines
      .map(
        ({ product: p, size, qty }) => `<li class="flex gap-4">
        <span class="relative shrink-0"><img class="aspect-[4/5] w-16 bg-bone object-cover" src="${asset(smallImage(p.images[0]))}" width="64" height="80" alt="${escapeHtml(imageAlt(p))}" />
          <span class="qty-badge" aria-label="Quantity ${qty}">${qty}</span></span>
        <span class="min-w-0 flex-1"><span class="type-micro block text-neutral-600">${escapeHtml(p.brand)}</span>
          <span class="type-body-sm block">${escapeHtml(p.name)}</span>
          <span class="type-body-sm block text-neutral-600">${hasSizes(p) ? `Size ${escapeHtml(sizeLabel(p, size))}` : escapeHtml(size)}</span></span>
        <span class="type-body-sm tabular-nums">${formatPrice(p.price * qty)}</span></li>`,
      )
      .join('')}</ul>
    <dl class="summary-rows mt-6 border-t border-neutral-200 pt-4">
      <div><dt>Subtotal</dt><dd>${formatPrice(subtotal)}</dd></div>
      <div><dt>Delivery</dt><dd>${delivery ? formatPrice(delivery) : 'Free'}</dd></div>
      <div class="summary-total"><dt>Total</dt><dd>${formatPrice(subtotal + delivery)}</dd></div>
    </dl>
    <p class="type-body-sm mt-2 text-neutral-600">Prices and total include VAT.</p>`;
  return lines.length;
}

const SUMMARIES = {
  contact: () => `${value('email')} · ${value('phone')}`,
  delivery: () => (value('shipping') === 'express' ? 'Express delivery' : 'Standard delivery'),
  address: () =>
    [`${value('firstName')} ${value('lastName')}`, value('address1'), value('address2'), value('city'), `Co. ${value('county')}`, value('eircode').toUpperCase(), 'Ireland']
      .filter(Boolean)
      .join(', '),
  payment: () => 'Card payment is not available yet',
};

function open(step, { focus = true } = {}) {
  steps.forEach((el) => {
    const active = el === step;
    const done = steps.indexOf(el) < steps.indexOf(step);
    qs('[data-step-body]', el).hidden = !active;
    el.toggleAttribute('data-current', active);
    el.toggleAttribute('data-complete', done);
    const text = qs('[data-step-summary]', el);
    const edit = qs('[data-step-edit]', el);
    if (text) {
      text.hidden = !done;
      text.textContent = done ? SUMMARIES[el.dataset.step]() : '';
    }
    if (edit) edit.hidden = !done;
  });
  if (step.dataset.step === 'review') {
    qs('[data-review]', step).innerHTML = Object.entries({ Contact: 'contact', Delivery: 'delivery', Address: 'address', Payment: 'payment' })
      .map(([label, key]) => `<div><dt>${label}</dt><dd>${escapeHtml(SUMMARIES[key]())}</dd></div>`)
      .join('');
  }
  qs('[data-step-status]').textContent = `Step ${steps.indexOf(step) + 1} of ${steps.length}: ${qs('h2', step).textContent.replace(/^\d+\s*/, '')}`;
  if (focus) {
    const heading = qs('h2', step);
    heading.tabIndex = -1;
    heading.focus();
  }
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
  open(steps[0], { focus: false });

  form.addEventListener('change', (event) => {
    if (event.target.name === 'shipping') renderSummary();
  });

  form.addEventListener('click', (event) => {
    const step = event.target.closest('[data-step]');
    if (!step) return;
    if (event.target.closest('[data-step-next]') && validateForm(qs('[data-step-body]', step), VALIDATORS)) {
      open(steps[steps.indexOf(step) + 1]);
    }
    if (event.target.closest('[data-step-edit]')) open(step);
  });

  // Enter in a field moves on to the next step instead of submitting the form.
  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || !event.target.matches('input')) return;
    const next = qs('[data-step-next]', event.target.closest('[data-step]'));
    if (next) {
      event.preventDefault();
      next.click();
    }
  });

  const place = qs('[data-place-order]');
  if (features.onlineOrdering) place.removeAttribute('aria-disabled');
  form.addEventListener('submit', (event) => {
    // No payment provider or order service is connected: never pretend an order went through.
    event.preventDefault();
    if (!features.onlineOrdering) qs('#order-note').focus?.();
  });
}

init();
