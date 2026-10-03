/**
 * Cart module. Today: the bag counter in the header.
 * Planned: add/remove items, EUR totals, persistence via utils/storage, cart drawer.
 * Markup hooks: [data-bag-count] (visible number), [data-bag-link] (accessible name),
 * [data-bag-status] (polite live region).
 */

import { qsa } from '../utils/dom.js';

let count = 0;

const label = (n) => `Bag, ${n} ${n === 1 ? 'item' : 'items'}`;

export function setBagCount(next, { announce = true } = {}) {
  count = Math.max(0, Number(next) || 0);
  qsa('[data-bag-count]').forEach((el) => (el.textContent = String(count)));
  qsa('[data-bag-link]').forEach((el) => el.setAttribute('aria-label', label(count)));
  if (announce) qsa('[data-bag-status]').forEach((el) => (el.textContent = label(count)));
}

export const getBagCount = () => count;

export function initCart() {
  setBagCount(0, { announce: false });
}
