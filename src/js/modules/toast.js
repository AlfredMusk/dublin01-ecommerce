/**
 * Non-blocking notifications in a polite live region ([data-toast-region]).
 * Never use alert(): call toast('Saved to wishlist', { href, linkLabel }).
 */

import { qs } from '../utils/dom.js';
import { escapeHtml } from '../utils/paths.js';

const DURATION = 4000;

export function toast(message, { href, linkLabel } = {}) {
  const region = qs('[data-toast-region]');
  if (!region) return;
  const item = document.createElement('div');
  item.className = 'toast';
  item.innerHTML = `<p>${escapeHtml(message)}</p>${
    href ? `<a class="toast-link" href="${escapeHtml(href)}">${escapeHtml(linkLabel ?? 'View')}</a>` : ''
  }`;
  region.replaceChildren(item);
  requestAnimationFrame(() => item.setAttribute('data-visible', ''));
  setTimeout(() => {
    item.removeAttribute('data-visible');
    setTimeout(() => item.remove(), 400);
  }, DURATION);
}
