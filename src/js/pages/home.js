/**
 * Home page: fills the product rails from the catalogue.
 * [data-products="new|featured|recent"] containers, [data-brand-count="<slug>"].
 */

import { qs, qsa } from '../utils/dom.js';
import { loadProducts, brandSlug } from '../data/catalog.js';
import { productCard, skeletonCards } from '../modules/product-card.js';
import { getRecentlyViewed } from '../modules/recently-viewed.js';
import { pluralize } from '../utils/format.js';
import { initCarousel } from '../modules/carousel.js';

const byNewest = (a, b) => b.createdAt.localeCompare(a.createdAt);

async function init() {
  const rails = qsa('[data-products]');
  rails.forEach((el) => (el.innerHTML = skeletonCards(el.dataset.products === 'new' ? 8 : 4)));
  const products = await loadProducts();

  const sets = {
    new: products.filter((p) => p.isNew).sort(byNewest).slice(0, 8),
    featured: products.filter((p) => p.isFeatured && !p.isNew).slice(0, 4),
    recent: getRecentlyViewed().map((slug) => products.find((p) => p.slug === slug)).filter(Boolean).slice(0, 4),
  };

  rails.forEach((el) => {
    const list = sets[el.dataset.products] ?? [];
    el.innerHTML = list.map((p) => productCard(p, { quickAdd: el.hasAttribute('data-quick-add') })).join('');
    const section = el.closest('[data-optional]');
    if (section) section.hidden = list.length === 0;
  });

  qsa('[data-brand-count]').forEach((el) => {
    const n = products.filter((p) => brandSlug(p.brand) === el.dataset.brandCount).length;
    el.textContent = pluralize(n, 'style');
  });

  document.dispatchEvent(new CustomEvent('catalog:rendered'));
}

/** Rain campaign: the copy rises once, the first time the section is seen. */
function initRainReveal() {
  const section = qs('[data-rain]');
  if (!section || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  section.setAttribute('data-reveal', '');
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      section.setAttribute('data-inview', '');
      observer.disconnect();
    },
    { threshold: 0.3 },
  );
  observer.observe(section);
}

initCarousel();
initRainReveal();
init();
