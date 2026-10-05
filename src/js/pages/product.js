/**
 * Product detail page: products/<slug>.html
 * Gallery, size selection (required before Add to bag), size guide, wishlist,
 * stock messaging, accordions and related products.
 */

import { qs } from '../utils/dom.js';
import { initDialog, openDialog } from '../utils/dialog.js';
import { asset, pageUrl, productUrl, brandUrl, homeUrl, escapeHtml } from '../utils/paths.js';
import { formatPrice } from '../utils/format.js';
import { commerce } from '../config.js';
import { loadProducts, isSoldOut, isOnSale, brandSlug } from '../data/catalog.js';
import { productCard, productTitle, imageAlt, priceHtml, smallImage } from '../modules/product-card.js';
import { isWishlisted } from '../modules/wishlist.js';
import { addToCart } from '../modules/cart.js';
import { openBagDrawer } from '../modules/bag-drawer.js';
import { trackView } from '../modules/recently-viewed.js';

const root = qs('[data-pdp]');

const heart =
  '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>';

const CATEGORY_PAGE = { sneakers: ['sneakers', 'Sneakers'], clothing: ['clothing', 'Clothing'], accessories: ['accessories', 'Accessories'] };

function stockMessage(p) {
  if (isSoldOut(p)) return 'Sold out in all sizes.';
  if (p.stock === 'low_stock') return 'Low stock: only a few left.';
  return 'In stock.';
}

function galleryHtml(p) {
  const odd = p.images.length % 2 === 1;
  return p.images
    .map(
      (src, i) => `<figure class="pdp-slide${odd && i === 0 ? ' lg:col-span-2' : ''}">
        <img src="${asset(src)}" srcset="${asset(smallImage(src))} 480w, ${asset(src)} 800w"
          sizes="(min-width: 1024px) ${odd && i === 0 ? '58vw' : '29vw'}, 100vw" width="800" height="1000"
          alt="${escapeHtml(imageAlt(p))}${p.images.length > 1 ? `, view ${i + 1} of ${p.images.length}` : ''}"
          ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />
      </figure>`,
    )
    .join('');
}

function sizesHtml(p) {
  if (p.sizes.length === 1) {
    return `<p class="type-body-sm mt-3 text-neutral-600">${escapeHtml(p.sizes[0])}</p>
      <input type="radio" name="size" value="${escapeHtml(p.sizes[0])}" checked hidden />`;
  }
  return `<ul class="size-grid mt-3" role="list">${p.sizes
    .map((size) => {
      const available = p.availableSizes.includes(size);
      const id = `size-${size}`.replace(/[^a-z0-9-]/gi, '-');
      return `<li><input class="size-option-input" type="radio" name="size" id="${id}" value="${escapeHtml(size)}"${available ? '' : ' disabled'} />
        <label class="size-option" for="${id}">${escapeHtml(size)}${available ? '' : '<span class="sr-only"> (sold out)</span>'}</label></li>`;
    })
    .join('')}</ul>`;
}

function sizeGuideHtml(p) {
  if (p.sizeSystem === 'EU') {
    const rows = [['37', '4', '5', '22.5'], ['38', '5', '6', '23.5'], ['39', '6', '7', '24.5'], ['40.5', '7', '8', '25.5'], ['42', '8', '9', '26.5'], ['43', '9', '10', '27.5'], ['44.5', '10', '11', '28.5'], ['46', '11', '12', '29.5'], ['47', '12', '13', '30.5']];
    return `<p class="type-body-sm text-neutral-600">Footwear, unisex. Measure your foot heel to toe and pick the closest length.</p>
      <table class="size-table mt-6"><thead><tr><th scope="col">EU</th><th scope="col">UK</th><th scope="col">US (M)</th><th scope="col">Foot (cm)</th></tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  if (p.sizeSystem === 'Waist') {
    return `<table class="size-table"><thead><tr><th scope="col">Size</th><th scope="col">Waist (cm)</th><th scope="col">Inseam (cm)</th></tr></thead>
      <tbody>${[['28', '72', '78'], ['30', '77', '80'], ['32', '82', '81'], ['34', '87', '82'], ['36', '92', '83']].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  return `<p class="type-body-sm text-neutral-600">Chest measured around the fullest part. Our fits are relaxed: take your usual size.</p>
    <table class="size-table mt-6"><thead><tr><th scope="col">Size</th><th scope="col">Chest (cm)</th><th scope="col">Length (cm)</th></tr></thead>
    <tbody>${[['XS', '84–89', '66'], ['S', '89–96', '68'], ['M', '96–104', '70'], ['L', '104–112', '72'], ['XL', '112–120', '74'], ['XXL', '120–128', '76']].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

/** Other colourways of the same model, as links to their own pages. */
function variantsHtml(p, products) {
  const siblings = products.filter((x) => x.brand === p.brand && x.name === p.name);
  if (siblings.length < 2) return '';
  return `<div class="mt-6">
    <p class="type-label">Colour</p>
    <ul class="mt-3 flex flex-wrap gap-2" role="list">${siblings
      .map((x) =>
        x.slug === p.slug
          ? `<li><span class="chip" aria-current="true">${escapeHtml(x.color)}</span></li>`
          : `<li><a class="chip" href="${productUrl(x.slug)}">${escapeHtml(x.color)}</a></li>`,
      )
      .join('')}</ul>
  </div>`;
}

function notFound() {
  document.title = 'Product not found — DUBLIN/01';
  root.innerHTML = `<div class="container-site py-section">
    <p class="type-label text-neutral-600">404</p>
    <h1 class="type-h1 mt-4">This product isn’t here.</h1>
    <p class="type-body-lg mt-4 max-w-prose text-neutral-600">It may have sold through or the link may be wrong.</p>
    <div class="mt-10 flex flex-wrap gap-4"><a class="btn btn-primary" href="${pageUrl('new-arrivals')}">Shop new arrivals</a><a class="btn btn-secondary" href="${pageUrl('sneakers')}">All sneakers</a></div>
  </div>`;
}

async function init() {
  if (!root) return;
  const slug = root.dataset.slug;
  const products = await loadProducts();
  const p = products.find((item) => item.slug === slug);
  if (!p) return notFound();

  const title = productTitle(p);
  document.title = `${title}, ${p.color} — DUBLIN/01`;
  qs('meta[name="description"]')?.setAttribute('content', `${title} in ${p.color}. ${p.description}`);
  trackView(p.slug);

  const [pageName, pageLabel] = CATEGORY_PAGE[p.category];
  const soldOut = isSoldOut(p);
  const saved = isWishlisted(p.slug);
  const needsSize = p.sizes.length > 1;

  root.innerHTML = `
  <div class="container-site pt-6 lg:pt-8">
    <nav aria-label="Breadcrumb" class="breadcrumb">
      <ol role="list"><li><a href="${homeUrl()}">Home</a></li>
      <li><a href="${pageUrl(pageName)}">${pageLabel}</a></li>
      <li><span aria-current="page">${escapeHtml(p.name)}</span></li></ol>
    </nav>
  </div>
  <div class="container-site grid-site gap-y-8 pb-section-sm pt-6">
    <div class="col-span-full lg:col-span-7">
      <div class="pdp-gallery" data-gallery tabindex="0" aria-label="Product images, scroll for more">${galleryHtml(p)}</div>
      ${p.images.length > 1 ? `<p class="type-micro mt-3 text-neutral-600 lg:hidden" aria-hidden="true"><span data-gallery-index>1</span> / ${p.images.length}</p>` : ''}
    </div>
    <div class="col-span-full lg:col-span-5 lg:col-start-8">
      <div class="pdp-info">
        <p class="type-label text-neutral-600"><a class="link-subtle" href="${brandUrl(brandSlug(p.brand))}">${escapeHtml(p.brand)}</a></p>
        <h1 class="type-h2 mt-3">${escapeHtml(p.name)}</h1>
        <p class="type-body mt-2 text-neutral-600">${escapeHtml(p.color)}</p>
        ${variantsHtml(p, products)}
        <p class="pdp-price mt-6">${priceHtml(p)}</p>
        <p class="type-body-sm mt-1 text-neutral-600">Price includes VAT.${isOnSale(p) ? ' Sale price while stock lasts.' : ''}</p>

        <form class="mt-8" novalidate data-add-form>
          <fieldset ${soldOut ? 'disabled' : ''}>
            <div class="flex items-baseline justify-between">
              <legend class="type-label">${needsSize ? `Size${p.sizeSystem === 'EU' ? ' (EU)' : ''}` : 'Size'}</legend>
              ${needsSize ? '<button class="link-subtle type-body-sm underline underline-offset-4" type="button" data-size-guide-open aria-controls="size-guide">Size guide</button>' : ''}
            </div>
            ${sizesHtml(p)}
          </fieldset>
          <p class="form-error mt-3" id="size-error" data-size-error hidden></p>
          <p class="type-body-sm mt-4 flex items-center gap-2 ${soldOut ? 'text-ink' : 'text-neutral-600'}" data-stock>
            <span class="stock-dot${soldOut ? ' is-out' : p.stock === 'low_stock' ? ' is-low' : ''}" aria-hidden="true"></span>${stockMessage(p)}
          </p>
          <div class="mt-6 flex gap-2">
            <button class="btn btn-primary flex-1" type="submit" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : 'Add to bag'}</button>
            <button class="btn btn-secondary btn-square" type="button" data-wishlist-toggle="${p.slug}" data-product-name="${escapeHtml(title)}"
              aria-pressed="${saved}" aria-label="${saved ? 'Remove' : 'Save'} ${escapeHtml(title)} ${saved ? 'from' : 'to'} wishlist">${heart}</button>
          </div>
        </form>

        <ul class="type-body-sm mt-8 space-y-2 text-neutral-600" role="list">
          <li>Free delivery in Ireland on orders over ${formatPrice(commerce.freeDeliveryThreshold)}</li>
          <li>${commerce.returnsDays}-day returns</li>
        </ul>

        <div class="mt-10 border-t border-neutral-200">
          <details class="accordion" open>
            <summary class="accordion-summary">Description</summary>
            <div class="accordion-body"><p>${escapeHtml(p.description)}</p></div>
          </details>
          <details class="accordion">
            <summary class="accordion-summary">Details</summary>
            <div class="accordion-body"><ul class="list-disc space-y-1 pl-5">${p.details.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
              <p class="mt-3 text-neutral-600">Product code ${escapeHtml(p.id)}</p></div>
          </details>
          <details class="accordion">
            <summary class="accordion-summary">Materials and care</summary>
            <div class="accordion-body"><p>${escapeHtml(p.material)}.</p>
              ${p.care?.length ? `<ul class="mt-3 list-disc space-y-1 pl-5">${p.care.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>` : ''}</div>
          </details>
          <details class="accordion">
            <summary class="accordion-summary">Delivery</summary>
            <div class="accordion-body"><p>Standard delivery across Ireland: ${formatPrice(commerce.standardDelivery)}, free on orders over ${formatPrice(commerce.freeDeliveryThreshold)}. Express delivery: ${formatPrice(commerce.expressDelivery)}. The delivery charge is shown before you pay.</p>
              <a class="link-editorial mt-2 inline-block" href="${pageUrl('delivery')}">Delivery information</a></div>
          </details>
          <details class="accordion">
            <summary class="accordion-summary">Returns</summary>
            <div class="accordion-body"><p>Return unworn items within ${commerce.returnsDays} days of delivery. This is in addition to your legal right to cancel an online order within ${commerce.statutoryCancellationDays} days.</p>
              <a class="link-editorial mt-2 inline-block" href="${pageUrl('returns')}">Returns policy</a></div>
          </details>
        </div>
      </div>
    </div>
  </div>`;

  // Related products: same category first, then same brand.
  const related = products
    .filter((x) => x.slug !== p.slug && !isSoldOut(x))
    .sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category) || Number(b.brand === p.brand) - Number(a.brand === p.brand))
    .slice(0, 4);
  const relatedRoot = qs('[data-related]');
  if (relatedRoot) relatedRoot.innerHTML = related.map((x) => productCard(x, { quickAdd: true })).join('');

  // Size guide
  const guide = qs('#size-guide');
  if (guide) {
    qs('[data-size-guide-body]', guide).innerHTML = sizeGuideHtml(p);
    initDialog(guide);
    qs('[data-size-guide-open]', root)?.addEventListener('click', (e) => openDialog(guide, { returnFocus: e.currentTarget }));
  }

  // Add to bag
  const form = qs('[data-add-form]', root);
  const error = qs('[data-size-error]', root);
  form.addEventListener('change', () => {
    error.hidden = true;
    qs('fieldset', form).removeAttribute('aria-describedby');
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const size = new FormData(form).get('size');
    if (!size) {
      error.textContent = 'Select a size to add this to your bag.';
      error.hidden = false;
      qs('fieldset', form).setAttribute('aria-describedby', 'size-error');
      qs('input[name="size"]:not(:disabled)', form)?.focus();
      return;
    }
    const { added } = addToCart(p, size, 1);
    if (!added) {
      error.textContent = 'You already have every unit we hold in this size in your bag.';
      error.hidden = false;
      return;
    }
    openBagDrawer({ returnFocus: qs('button[type="submit"]', form) });
  });

  // Mobile gallery position
  const gallery = qs('[data-gallery]', root);
  const index = qs('[data-gallery-index]', root);
  if (gallery && index) {
    gallery.addEventListener('scroll', () => {
      index.textContent = String(Math.round(gallery.scrollLeft / gallery.clientWidth) + 1);
    }, { passive: true });
  }

  document.dispatchEvent(new CustomEvent('catalog:rendered'));
}

init();
