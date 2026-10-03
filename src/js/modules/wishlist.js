/**
 * Wishlist: product slugs saved in LocalStorage ("dublin01:wishlist").
 * Any [data-wishlist-toggle="<slug>"] button on any page toggles its product.
 * Emits "wishlist:change" on document.
 */

import { qsa } from '../utils/dom.js';
import { read, write, onExternalChange } from '../utils/storage.js';
import { pageUrl } from '../utils/paths.js';
import { toast } from './toast.js';

const KEY = 'wishlist';

export const getWishlist = () => read(KEY, []);
export const isWishlisted = (slug) => getWishlist().includes(slug);

function save(list) {
  write(KEY, list);
  document.dispatchEvent(new CustomEvent('wishlist:change', { detail: { list } }));
}

export function toggleWishlist(slug) {
  const list = getWishlist();
  const added = !list.includes(slug);
  save(added ? [slug, ...list] : list.filter((s) => s !== slug));
  return added;
}

export function removeFromWishlist(slug) {
  save(getWishlist().filter((s) => s !== slug));
}

/** Syncs every toggle button and the header counters with the stored list. */
function render() {
  const list = getWishlist();
  qsa('[data-wishlist-toggle]').forEach((button) => {
    const saved = list.includes(button.dataset.wishlistToggle);
    button.setAttribute('aria-pressed', String(saved));
    const name = button.dataset.productName ?? 'item';
    button.setAttribute('aria-label', saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`);
  });
  qsa('[data-wishlist-count]').forEach((el) => {
    el.textContent = String(list.length);
    el.hidden = list.length === 0;
  });
  qsa('[data-wishlist-link]').forEach((el) =>
    el.setAttribute('aria-label', `Wishlist, ${list.length} ${list.length === 1 ? 'item' : 'items'}`),
  );
}

export function initWishlist() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-wishlist-toggle]');
    if (!button) return;
    event.preventDefault();
    const added = toggleWishlist(button.dataset.wishlistToggle);
    toast(added ? 'Saved to wishlist' : 'Removed from wishlist', added ? { href: pageUrl('wishlist'), linkLabel: 'View wishlist' } : {});
  });
  document.addEventListener('wishlist:change', render);
  document.addEventListener('catalog:rendered', render);
  onExternalChange(KEY, () => document.dispatchEvent(new CustomEvent('wishlist:change')));
  render();
}
