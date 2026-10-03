/**
 * Cart: lines of { slug, size, qty } in LocalStorage ("dublin01:cart").
 * Prices always come from the catalogue, never from storage.
 * Emits "cart:change" on document and keeps the header bag counter in sync.
 * Markup hooks: [data-bag-count], [data-bag-link], [data-bag-status].
 */

import { qsa } from '../utils/dom.js';
import { read, write, onExternalChange } from '../utils/storage.js';

const KEY = 'cart';
export const MAX_QTY = 10;
export const FREE_DELIVERY_THRESHOLD = 100;
export const STANDARD_DELIVERY = 4.95;
export const EXPRESS_DELIVERY = 9.95;

export const getCart = () => read(KEY, []);
export const getBagCount = () => getCart().reduce((sum, line) => sum + line.qty, 0);

function save(lines, { announce = true } = {}) {
  write(KEY, lines);
  setBagCount(getBagCount(), { announce });
  document.dispatchEvent(new CustomEvent('cart:change', { detail: { lines } }));
}

export function addToCart(slug, size, qty = 1) {
  const lines = getCart();
  const line = lines.find((l) => l.slug === slug && l.size === size);
  if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
  else lines.unshift({ slug, size, qty });
  save(lines);
}

export function setQuantity(slug, size, qty) {
  const lines = getCart()
    .map((l) => (l.slug === slug && l.size === size ? { ...l, qty: Math.min(MAX_QTY, qty) } : l))
    .filter((l) => l.qty > 0);
  save(lines);
}

export const removeFromCart = (slug, size) => setQuantity(slug, size, 0);

/** Joins stored lines with catalogue data; drops lines whose product no longer exists. */
export function cartDetails(products) {
  const lines = getCart()
    .map((line) => ({ ...line, product: products.find((p) => p.slug === line.slug) }))
    .filter((line) => line.product);
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY;
  return { lines, subtotal, count, delivery, total: subtotal + delivery };
}

const label = (n) => `Bag, ${n} ${n === 1 ? 'item' : 'items'}`;

export function setBagCount(count, { announce = true } = {}) {
  qsa('[data-bag-count]').forEach((el) => (el.textContent = String(count)));
  qsa('[data-bag-link]').forEach((el) => el.setAttribute('aria-label', label(count)));
  if (announce) qsa('[data-bag-status]').forEach((el) => (el.textContent = label(count)));
}

export function initCart() {
  setBagCount(getBagCount(), { announce: false });
  onExternalChange(KEY, () => {
    setBagCount(getBagCount(), { announce: false });
    document.dispatchEvent(new CustomEvent('cart:change'));
  });
}
