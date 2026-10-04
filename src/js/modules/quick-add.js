/**
 * Quick add: pick a size and add to the bag without leaving the product grid.
 * Cards rendered with productCard(p, { quickAdd: true }) carry a
 * [data-quick-add="<slug>"] button.
 *
 * With a mouse on a wide screen (80rem and up) the size picker opens inside
 * the card; everywhere else it opens in the #quick-add sheet.
 * Sizes and availability always come from the catalogue.
 */

import { qs, qsa } from '../utils/dom.js';
import { openDialog, closeDialog, initDialog } from '../utils/dialog.js';
import { asset, pageUrl, productUrl, escapeHtml } from '../utils/paths.js';
import { getBySlug, hasSizes, isSoldOut, sizeLabel } from '../data/catalog.js';
import { addToCart } from './cart.js';
import { toast } from './toast.js';
import { imageAlt, priceHtml, productTitle, smallImage } from './product-card.js';

// Same condition as the CSS that turns the button into a hover bar: below it
// a card is too narrow to hold the size picker.
const inCard = window.matchMedia('(hover: hover) and (pointer: fine) and (width >= 80rem)');

function sizesHtml(p, scope) {
  if (!hasSizes(p)) {
    return `<p class="quick-add-legend">${escapeHtml(p.sizes[0])}</p>
      <input type="radio" name="size" value="${escapeHtml(p.sizes[0])}" checked hidden />`;
  }
  const options = p.sizes
    .map((size) => {
      const available = p.availableSizes.includes(size);
      const id = `${scope}-${p.slug}-${size}`.replace(/[^a-z0-9-]/gi, '-');
      return `<li><input class="size-option-input" type="radio" name="size" id="${id}" value="${escapeHtml(size)}"${available ? '' : ' disabled'} />
        <label class="size-option" for="${id}">${escapeHtml(size)}${available ? '' : '<span class="sr-only"> (unavailable)</span>'}</label></li>`;
    })
    .join('');
  return `<fieldset>
      <legend class="quick-add-legend">Select size${p.sizeSystem === 'EU' ? ' (EU)' : ''}</legend>
      <ul class="size-grid quick-add-sizes" role="list">${options}</ul>
    </fieldset>`;
}

const formHtml = (p, scope) => `<form class="quick-add-form" data-quick-add-form="${p.slug}" novalidate>
    ${sizesHtml(p, scope)}
    <p class="form-error" data-quick-add-error hidden></p>
    <button class="btn btn-primary btn-block" type="submit">Add to bag</button>
  </form>`;

const sheetHtml = (p) => `<div class="flex gap-4">
    <img class="aspect-[4/5] w-24 shrink-0 bg-bone object-cover" src="${asset(smallImage(p.images[0]))}" width="96" height="120" alt="${escapeHtml(imageAlt(p))}" />
    <div class="min-w-0 space-y-1">
      <p class="type-micro text-neutral-600">${escapeHtml(p.brand)}</p>
      <p class="type-body font-medium"><a class="link-editorial" href="${productUrl(p.slug)}">${escapeHtml(p.name)}</a></p>
      <p class="type-body-sm text-neutral-600">${escapeHtml(p.color)}</p>
      <p class="type-body-sm tabular-nums">${priceHtml(p)}</p>
    </div>
  </div>
  <div class="mt-6">${formHtml(p, 'sheet')}</div>`;

function closeInCard(toggle, { focus = false } = {}) {
  const panel = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!panel || panel.hidden) return;
  panel.hidden = true;
  panel.replaceChildren();
  toggle.setAttribute('aria-expanded', 'false');
  if (focus) toggle.focus();
}

const openToggles = () => qsa('[data-quick-add][aria-expanded="true"]');

async function open(toggle, byKeyboard) {
  const product = await getBySlug(toggle.dataset.quickAdd);
  if (!product || isSoldOut(product)) return;

  if (inCard.matches) {
    openToggles().forEach((other) => other !== toggle && closeInCard(other));
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    panel.innerHTML = formHtml(product, 'card');
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (byKeyboard) qs('input:not(:disabled):not([hidden]), button', panel)?.focus();
    return;
  }

  const sheet = qs('[data-quick-add-dialog]');
  if (!sheet) return;
  initDialog(sheet);
  qs('[data-quick-add-body]', sheet).innerHTML = sheetHtml(product);
  openDialog(sheet, { returnFocus: toggle });
}

async function submit(form) {
  const error = qs('[data-quick-add-error]', form);
  const fail = (message) => {
    error.textContent = message;
    error.hidden = false;
  };
  const product = await getBySlug(form.dataset.quickAddForm);
  const size = new FormData(form).get('size');
  if (!size) return fail('Select a size first.');
  // Availability is checked against the catalogue, never trusted from the markup.
  if (!product || isSoldOut(product) || !product.availableSizes.includes(size)) return fail('This size is unavailable.');

  addToCart(product.slug, size, 1);
  const toggle = form.closest('.product-card')?.querySelector('[data-quick-add]');
  if (toggle) closeInCard(toggle);
  else closeDialog(qs('[data-quick-add-dialog]'));
  toast(`Added to bag: ${productTitle(product)}${hasSizes(product) ? `, ${sizeLabel(product, size)}` : ''}`, {
    href: pageUrl('bag'),
    linkLabel: 'View bag',
  });
}

export function initQuickAdd() {
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-quick-add]');
    if (!toggle) return;
    if (toggle.getAttribute('aria-expanded') === 'true') closeInCard(toggle);
    else open(toggle, event.detail === 0);
  });

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-quick-add-form]');
    if (!form) return;
    event.preventDefault();
    submit(form);
  });

  document.addEventListener('change', (event) => {
    const error = event.target.closest('[data-quick-add-form]')?.querySelector('[data-quick-add-error]');
    if (error) error.hidden = true;
  });

  // The in-card picker closes when the pointer or the focus leaves its card, and on Escape.
  const leave = (event) => {
    const card = event.target.closest?.('.product-card');
    if (!card || card.contains(event.relatedTarget)) return;
    const toggle = qs('[data-quick-add][aria-expanded="true"]', card);
    if (toggle) closeInCard(toggle);
  };
  document.addEventListener('pointerout', (event) => event.pointerType === 'mouse' && leave(event));
  // Clicking a disabled size sends focus to <main>: that is not leaving the card.
  document.addEventListener('focusout', (event) => {
    if (event.relatedTarget && !event.target.closest('.product-card:hover')) leave(event);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const toggle = event.target.closest?.('.product-card')?.querySelector('[data-quick-add][aria-expanded="true"]');
    if (toggle) closeInCard(toggle, { focus: true });
  });
  inCard.addEventListener('change', () => openToggles().forEach((toggle) => closeInCard(toggle)));
}
