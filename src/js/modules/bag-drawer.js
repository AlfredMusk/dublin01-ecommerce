/**
 * Bag drawer: the bag without leaving the page. Opens after "Add to bag" and
 * from the bag icon in the header; lists every line with its quantity
 * stepper, the subtotal and the way to the bag page and the checkout.
 */

import { qs } from '../utils/dom.js';
import { openDialog, initDialog } from '../utils/dialog.js';
import { pageUrl } from '../utils/paths.js';
import { formatPrice, pluralize } from '../utils/format.js';
import { loadProducts } from '../data/catalog.js';
import { cartDetails, FREE_DELIVERY_THRESHOLD } from './cart.js';
import { lineHtml, bindLines, keepLineFocus } from './bag-lines.js';

const drawer = () => qs('[data-bag-drawer]');

async function render() {
  const el = drawer();
  if (!el) return;
  const { lines, subtotal, count } = cartDetails(await loadProducts());
  qs('[data-bag-drawer-count]', el).textContent = count ? `(${count})` : '';
  qs('[data-bag-drawer-foot]', el).hidden = lines.length === 0;
  qs('[data-bag-drawer-body]', el).innerHTML = lines.length
    ? `<ul class="divide-y divide-neutral-200" role="list">${lines.map(lineHtml).join('')}</ul>`
    : `<div class="py-12 text-center">
        <p class="type-h3">Your bag is empty.</p>
        <p class="type-body mt-3 text-neutral-600">Have a look at what came in this week.</p>
        <a class="btn btn-primary mt-8" href="${pageUrl('new-arrivals')}">Shop new arrivals</a>
      </div>`;
  qs('[data-bag-drawer-subtotal]', el).textContent = formatPrice(subtotal);
  qs('[data-bag-drawer-note]', el).textContent =
    subtotal >= FREE_DELIVERY_THRESHOLD
      ? 'Free standard delivery in Ireland. Prices include VAT.'
      : `Spend ${formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery in Ireland. Prices include VAT.`;
  qs('[data-bag-drawer-status]', el).textContent = `Bag: ${pluralize(count, 'item')}, subtotal ${formatPrice(subtotal)}`;
}

export async function openBagDrawer({ returnFocus } = {}) {
  const el = drawer();
  if (!el) return;
  initDialog(el);
  await render();
  openDialog(el, { returnFocus, initialFocus: qs('[data-dialog-close]', el) });
}

export function initBagDrawer() {
  const el = drawer();
  if (!el) return;
  bindLines(el);
  document.addEventListener(
    'cart:change',
    keepLineFocus(el, async () => el.open && render(), () => qs('[data-dialog-close]', el)),
  );

  // The bag icon opens the drawer; on the bag and checkout pages it stays a plain link.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-bag-link]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    if (['bag', 'checkout'].includes(document.body.dataset.page)) return;
    event.preventDefault();
    openBagDrawer({ returnFocus: link });
  });
}
