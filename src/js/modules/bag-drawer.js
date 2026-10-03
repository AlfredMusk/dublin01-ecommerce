/**
 * "Added to bag" drawer shown after a successful add.
 */

import { qs } from '../utils/dom.js';
import { openDialog, initDialog } from '../utils/dialog.js';
import { asset, productUrl, escapeHtml } from '../utils/paths.js';
import { formatPrice } from '../utils/format.js';
import { loadProducts } from '../data/catalog.js';
import { cartDetails, FREE_DELIVERY_THRESHOLD } from './cart.js';
import { imageAlt, smallImage } from './product-card.js';

export async function openBagDrawer(product, size, returnFocus) {
  const drawer = qs('[data-bag-drawer]');
  if (!drawer) return;
  initDialog(drawer);
  const { subtotal, count } = cartDetails(await loadProducts());
  qs('[data-bag-drawer-body]', drawer).innerHTML = `
    <div class="flex gap-4">
      <img class="aspect-[4/5] w-24 shrink-0 bg-bone object-cover" src="${asset(smallImage(product.images[0]))}" width="96" height="120" alt="${escapeHtml(imageAlt(product))}" />
      <div class="min-w-0 space-y-1">
        <p class="type-micro text-neutral-600">${escapeHtml(product.brand)}</p>
        <p class="type-body font-medium"><a class="link-editorial" href="${productUrl(product.slug)}">${escapeHtml(product.name)}</a></p>
        <p class="type-body-sm text-neutral-600">${escapeHtml(product.color)}${size !== 'One size' ? ` · Size ${escapeHtml(size)}` : ''}</p>
        <p class="type-body-sm tabular-nums">${formatPrice(product.price)}</p>
      </div>
    </div>
    <p class="type-body-sm mt-6 text-neutral-600">${count} ${count === 1 ? 'item' : 'items'} in your bag.</p>`;
  qs('[data-bag-drawer-subtotal]', drawer).textContent = formatPrice(subtotal);
  qs('[data-bag-drawer-note]', drawer).textContent =
    subtotal >= FREE_DELIVERY_THRESHOLD
      ? 'Free delivery to anywhere in Ireland.'
      : `Spend ${formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery in Ireland.`;
  openDialog(drawer, { returnFocus, initialFocus: qs('[data-dialog-close]', drawer) });
}
