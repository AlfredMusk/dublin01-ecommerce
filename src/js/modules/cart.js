/**
 * Cart: lines of { slug, size, qty } in LocalStorage ("dublin01:cart").
 * Names, prices and stock always come from the catalogue, never from storage.
 * A line can never hold more units than the size has in stock.
 * Emits "cart:change" on document and keeps the header bag counter in sync.
 * Markup hooks: [data-bag-count], [data-bag-link], [data-bag-status].
 */

import { qsa } from '../utils/dom.js';
import { read, write, onExternalChange } from '../utils/storage.js';
import { commerce } from '../config.js';
import { stockFor } from '../data/catalog.js';

const KEY = 'cart';
export const MAX_QTY = commerce.maxLineQuantity;
export const FREE_DELIVERY_THRESHOLD = commerce.freeDeliveryThreshold;
export const STANDARD_DELIVERY = commerce.standardDelivery;
export const EXPRESS_DELIVERY = commerce.expressDelivery;

export const getCart = () => read(KEY, []);
export const getBagCount = () => getCart().reduce((sum, line) => sum + line.qty, 0);

/** Most units of this size one bag may hold. */
export const maxFor = (product, size) => Math.min(MAX_QTY, stockFor(product, size));

function save(lines, { announce = true } = {}) {
  write(KEY, lines);
  setBagCount(getBagCount(), { announce });
  document.dispatchEvent(new CustomEvent('cart:change', { detail: { lines } }));
}

/**
 * Adds units of a product in one size, up to what is in stock.
 * @returns {{ added: number, capped: boolean }} units actually added, and whether stock limited them
 */
export function addToCart(product, size, qty = 1) {
  const max = maxFor(product, size);
  const lines = getCart();
  const line = lines.find((l) => l.slug === product.slug && l.size === size);
  const before = line?.qty ?? 0;
  const after = Math.min(max, before + qty);
  if (after === before) return { added: 0, capped: true };
  if (line) line.qty = after;
  else lines.unshift({ slug: product.slug, size, qty: after });
  save(lines);
  return { added: after - before, capped: after < before + qty };
}

export function setQuantity(slug, size, qty, max = MAX_QTY) {
  const lines = getCart()
    .map((l) => (l.slug === slug && l.size === size ? { ...l, qty: Math.min(max, qty) } : l))
    .filter((l) => l.qty > 0);
  save(lines);
}

export const removeFromCart = (slug, size) => setQuantity(slug, size, 0);

/**
 * Joins stored lines with catalogue data. Lines whose product or size no
 * longer exists, or is out of stock, are left out; quantities are held to stock.
 */
export function cartDetails(products) {
  const lines = getCart()
    .map((line) => {
      const product = products.find((p) => p.slug === line.slug);
      const max = product?.sizes.includes(line.size) ? maxFor(product, line.size) : 0;
      return { ...line, product, max, qty: Math.min(line.qty, max) };
    })
    .filter((line) => line.product && line.max > 0);
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY;
  return { lines, subtotal, count, delivery, total: subtotal + delivery };
}

const label = (n) => `Bag, ${n} ${n === 1 ? 'item' : 'items'}`;

/** Replays the short counter transition (CSS: .bag-count[data-bump]). */
export function bump(el) {
  el.removeAttribute('data-bump');
  void el.offsetWidth;
  el.setAttribute('data-bump', '');
}

export function setBagCount(count, { announce = true } = {}) {
  qsa('[data-bag-count]').forEach((el) => {
    const changed = el.textContent !== String(count);
    el.textContent = String(count);
    el.toggleAttribute('data-empty', count === 0);
    if (announce && changed) bump(el);
  });
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
