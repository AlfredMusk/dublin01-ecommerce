/**
 * Product card markup shared by the home page, catalogue, search, wishlist and PDP.
 */

import { asset, productUrl, escapeHtml } from '../utils/paths.js';
import { formatPrice } from '../utils/format.js';
import { isOnSale, isSoldOut } from '../data/catalog.js';
import { isWishlisted } from './wishlist.js';

const heart =
  '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>';

export const smallImage = (path) => path.replace(/\.webp$/, '-sm.webp');

export const productTitle = (p) => (p.brand === 'DUBLIN/01' ? p.name : `${p.brand} ${p.name}`);

export const imageAlt = (p) => `${productTitle(p)} in ${p.color}`;

export function priceHtml(p) {
  if (isOnSale(p)) {
    return `<span class="price-sale">${formatPrice(p.price)}</span> <del class="price-was"><span class="sr-only">Was </span>${formatPrice(p.compareAtPrice)}</del>`;
  }
  return formatPrice(p.price);
}

function badge(p) {
  if (isSoldOut(p)) return 'Sold out';
  if (isOnSale(p)) return `−${Math.round((1 - p.price / p.compareAtPrice) * 100)}%`;
  if (p.isLimited) return 'Limited';
  if (p.isNew) return 'New';
  return '';
}

export function productCard(p, { eager = false } = {}) {
  const url = productUrl(p.slug);
  const [first, second] = p.images;
  const loading = eager ? 'eager' : 'lazy';
  const tag = badge(p);
  const saved = isWishlisted(p.slug);
  const title = productTitle(p);
  return `
<article class="product-card${isSoldOut(p) ? ' is-sold-out' : ''}">
  <div class="product-card-media">
    <img src="${asset(smallImage(first))}" srcset="${asset(smallImage(first))} 480w, ${asset(first)} 800w"
      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" width="480" height="600"
      alt="${escapeHtml(imageAlt(p))}" loading="${loading}" decoding="async" />
    ${second ? `<img class="product-card-alt" src="${asset(smallImage(second))}" width="480" height="600" alt="" loading="lazy" decoding="async" />` : ''}
    ${tag ? `<span class="product-badge">${tag}</span>` : ''}
  </div>
  <button class="product-card-wish" type="button" data-wishlist-toggle="${p.slug}" data-product-name="${escapeHtml(title)}"
    aria-pressed="${saved}" aria-label="${saved ? 'Remove' : 'Save'} ${escapeHtml(title)} ${saved ? 'from' : 'to'} wishlist">${heart}</button>
  <div class="product-card-info">
    <p class="type-micro text-neutral-600">${escapeHtml(p.brand)}</p>
    <h3 class="product-card-name"><a class="product-card-link" href="${url}">${escapeHtml(p.name)}</a></h3>
    <p class="product-card-color">${escapeHtml(p.color)}</p>
    <p class="product-card-price">${priceHtml(p)}</p>
  </div>
</article>`;
}

export const skeletonCards = (count) =>
  Array.from({ length: count }, () => '<div class="product-skeleton" aria-hidden="true"><div></div><span></span><span></span></div>').join('');
