/**
 * Catalogue listing (New, Sneakers, Clothing). Filters and sort live in the URL
 * (?brand=nike,adidas&size=8&sort=price-asc) so mega-menu links, back/forward
 * and shared links all restore the same view.
 *
 * Markup: [data-catalog] with data-preset (JSON: category | isNew), containing
 * [data-filters="desktop"], [data-filters="mobile"] (inside the filter dialog),
 * [data-results], [data-count], [data-sort], [data-active-filters], [data-filter-count].
 */

import { qs, qsa } from '../utils/dom.js';
import { initDialog, openDialog, closeDialog } from '../utils/dialog.js';
import { escapeHtml } from '../utils/paths.js';
import { pluralize } from '../utils/format.js';
import { loadProducts, isOnSale, isSoldOut, brandSlug, BRAND_ORDER } from '../data/catalog.js';
import { productCard, skeletonCards } from '../modules/product-card.js';

const root = qs('[data-catalog]');

const LABELS = {
  category: { sneakers: 'Sneakers', clothing: 'Clothing', accessories: 'Accessories' },
  type: { jackets: 'Jackets', hoodies: 'Hoodies & sweats', 't-shirts': 'T-Shirts', trousers: 'Trousers', accessories: 'Accessories' },
  style: { running: 'Running', lifestyle: 'Lifestyle', skate: 'Skate', trail: 'Trail' },
  gender: { men: 'Men', women: 'Women', unisex: 'Unisex' },
  price: { 'under-100': 'Under €100', '100-150': '€100–€150', '150-200': '€150–€200', 'over-200': 'Over €200' },
  collection: { new: 'New in', sale: 'Sale', limited: 'Limited' },
  stock: { in: 'In stock only' },
};

const GROUPS = [
  ['category', 'Category'],
  ['type', 'Type'],
  ['style', 'Style'],
  ['gender', 'Gender'],
  ['brand', 'Brand'],
  ['size', 'Size'],
  ['price', 'Price'],
  ['collection', 'Collection'],
  ['stock', 'Availability'],
];

const SORTS = {
  featured: (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.createdAt.localeCompare(a.createdAt),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
};

const PRICE_TEST = {
  'under-100': (p) => p.price < 100,
  '100-150': (p) => p.price >= 100 && p.price < 150,
  '150-200': (p) => p.price >= 150 && p.price < 200,
  'over-200': (p) => p.price >= 200,
};

/** Value(s) a product contributes to each filter group. */
const valuesOf = {
  category: (p) => [p.category],
  type: (p) => [p.type],
  style: (p) => (p.style ? [p.style] : []),
  gender: (p) => [p.gender],
  brand: (p) => [brandSlug(p.brand)],
  size: (p) => p.availableSizes,
  price: (p) => Object.keys(PRICE_TEST).filter((k) => PRICE_TEST[k](p)),
  collection: (p) => [p.isNew && 'new', isOnSale(p) && 'sale', p.isLimited && 'limited'].filter(Boolean),
  stock: (p) => (isSoldOut(p) ? [] : ['in']),
};

function readState() {
  const params = new URLSearchParams(location.search);
  const state = { sort: SORTS[params.get('sort')] ? params.get('sort') : 'featured' };
  for (const [key] of GROUPS) state[key] = (params.get(key) ?? '').split(',').filter(Boolean);
  return state;
}

function writeState(state) {
  const params = new URLSearchParams();
  for (const [key] of GROUPS) if (state[key].length) params.set(key, state[key].join(','));
  if (state.sort !== 'featured') params.set('sort', state.sort);
  const query = params.toString().replaceAll('%2C', ',');
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

const matches = (p, state) =>
  GROUPS.every(([key]) => !state[key].length || valuesOf[key](p).some((v) => state[key].includes(v)));

function optionsFor(products, key) {
  const counts = new Map();
  products.forEach((p) => valuesOf[key](p).forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1)));
  let values = [...counts.keys()];
  if (key === 'brand') values = BRAND_ORDER.map(brandSlug).filter((v) => counts.has(v));
  else if (key === 'size') {
    // Numeric sizes in ascending order, then lettered sizes as the catalogue lists them.
    const all = [...new Set(products.flatMap((p) => p.sizes))];
    const numeric = (v) => /^\d+(\.\d+)?$/.test(v);
    values = [...all.filter(numeric).sort((a, b) => a - b), ...all.filter((v) => !numeric(v))].filter((v) => counts.has(v));
  } else if (LABELS[key]) values = Object.keys(LABELS[key]).filter((v) => counts.has(v));
  const brandNames = Object.fromEntries(products.map((p) => [brandSlug(p.brand), p.brand]));
  return values.map((value) => ({
    value,
    count: counts.get(value),
    label: key === 'brand' ? brandNames[value] : key === 'size' ? value : LABELS[key]?.[value] ?? value,
  }));
}

function filtersHtml(products, state, prefix) {
  let shown = 0;
  return GROUPS.map(([key, title]) => {
    const options = optionsFor(products, key);
    if (options.length < (key === 'stock' ? 1 : 2)) return '';
    const index = shown++;
    const isSize = key === 'size';
    const items = options
      .map(({ value, label, count }) => {
        const id = `${prefix}-${key}-${value}`.replace(/[^a-z0-9-]/gi, '-');
        const checked = state[key].includes(value) ? ' checked' : '';
        return isSize
          ? `<li><input class="size-option-input" type="checkbox" id="${id}" name="${key}" value="${escapeHtml(value)}"${checked} /><label class="size-option" for="${id}">${escapeHtml(label)}</label></li>`
          : `<li><label class="check" for="${id}"><input type="checkbox" id="${id}" name="${key}" value="${escapeHtml(value)}"${checked} /><span>${escapeHtml(label)}</span><span class="check-count">${count}</span></label></li>`;
      })
      .join('');
    const open = index < 4 || state[key].length ? ' open' : '';
    return `<details class="filter-group"${open}>
      <summary class="filter-summary">${title}${state[key].length ? ` <span class="text-neutral-600">(${state[key].length})</span>` : ''}</summary>
      <ul class="${isSize ? 'size-grid size-grid-compact' : 'space-y-0.5'} pb-5" role="list">${items}</ul>
    </details>`;
  }).join('');
}

async function init() {
  if (!root) return;
  const preset = JSON.parse(root.dataset.preset ?? '{}');
  const results = qs('[data-results]', root);
  results.innerHTML = skeletonCards(6);
  results.setAttribute('aria-busy', 'true');

  let state = readState();

  // The generic shop route names itself after its gender or collection filter.
  // "Men" and "Women" include unisex products, so the name comes from the
  // non-unisex value. Runs before the catalogue loads to avoid a title flash.
  const heading = qs('h1', root);
  const crumb = qs('[data-catalog-crumb]', root);
  const intro = qs('[data-catalog-intro]', root);
  const baseHeading = heading?.textContent;
  const baseCrumb = crumb?.textContent;
  const baseIntro = intro?.textContent;
  const baseTitle = document.title;
  const INTROS = {
    Men: 'Sneakers, clothing and accessories in men’s and unisex fits.',
    Women: 'Sneakers, clothing and accessories in women’s and unisex fits.',
    Unisex: 'Everything cut and sized to be worn by anyone.',
    Sale: 'Reduced while stock lasts. Same delivery and 30-day returns as everything else.',
    'New in': 'The latest arrivals across sneakers, clothing and accessories.',
    Limited: 'Small runs that will not be restocked.',
  };
  const retitle = () => {
    if (preset.category || preset.isNew || !heading) return;
    const only = (values) => (values.length === 1 ? values[0] : null);
    const gender = only(state.gender.filter((value) => value !== 'unisex')) ?? only(state.gender);
    const label = { men: 'Men', women: 'Women', unisex: 'Unisex' }[gender] ?? { sale: 'Sale', new: 'New in', limited: 'Limited' }[only(state.collection)];
    heading.textContent = label ?? baseHeading;
    if (crumb) crumb.textContent = label ?? baseCrumb;
    if (intro) intro.textContent = (label && INTROS[label]) ?? baseIntro;
    document.title = label ? `${label} — DUBLIN/01` : baseTitle;
  };
  retitle();

  let products;
  try {
    products = (await loadProducts()).filter(
      (p) =>
        (!preset.category || [].concat(preset.category).includes(p.category)) && (!preset.isNew || p.isNew),
    );
  } catch {
    results.innerHTML = '<p class="type-body text-neutral-600">The catalogue could not be loaded. Refresh the page to try again.</p>';
    return;
  }

  const desktop = qs('[data-filters="desktop"]', root);
  const mobile = qs('[data-filters="mobile"]');
  const dialog = qs('[data-filter-dialog]');
  const sort = qs('[data-sort]', root);
  if (dialog) initDialog(dialog);

  const renderFilters = () => {
    if (desktop) desktop.innerHTML = filtersHtml(products, state, 'd');
    if (mobile) mobile.innerHTML = filtersHtml(products, state, 'm');
  };

  const render = () => {
    const list = products.filter((p) => matches(p, state)).sort(SORTS[state.sort]);
    results.removeAttribute('aria-busy');
    results.innerHTML = list.length
      ? list.map((p, i) => productCard(p, { eager: i < 4 })).join('')
      : `<div class="col-span-full border border-neutral-200 px-6 py-16 text-center">
          <p class="type-h3">Nothing matches these filters.</p>
          <p class="type-body mt-3 text-neutral-600">Try removing a size or brand.</p>
          <button class="btn btn-secondary mt-8" type="button" data-clear-filters>Clear filters</button>
        </div>`;
    const label = pluralize(list.length, 'product');
    qsa('[data-count]').forEach((el) => (el.textContent = label));
    const active = GROUPS.flatMap(([key]) => state[key].map((value) => ({ key, value })));
    qsa('[data-filter-count]').forEach((el) => (el.textContent = active.length ? `(${active.length})` : ''));
    const chips = qs('[data-active-filters]', root);
    chips.hidden = active.length === 0;
    chips.innerHTML = active.length
      ? active
          .map(({ key, value }) => {
            const label = optionsFor(products, key).find((o) => o.value === value)?.label ?? value;
            return `<button class="chip" type="button" data-remove-filter="${key}" data-value="${escapeHtml(value)}" aria-label="Remove filter ${escapeHtml(label)}">${escapeHtml(key === 'size' ? `Size ${label}` : label)}<svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" /></svg></button>`;
          })
          .join('') + '<button class="link-subtle type-body-sm" type="button" data-clear-filters>Clear all</button>'
      : '';
    document.dispatchEvent(new CustomEvent('catalog:rendered'));
  };

  const update = () => {
    writeState(state);
    retitle();
    render();
  };

  const onChange = (event) => {
    const input = event.target;
    if (!input.matches('input[type="checkbox"]')) return;
    const { name, value, checked } = input;
    state[name] = checked ? [...new Set([...state[name], value])] : state[name].filter((v) => v !== value);
    // Mirror the change in the other filter panel without re-rendering this one.
    qsa(`input[name="${name}"][value="${CSS.escape(value)}"]`).forEach((el) => (el.checked = checked));
    update();
  };

  desktop?.addEventListener('change', onChange);
  mobile?.addEventListener('change', onChange);

  sort.value = state.sort;
  sort.addEventListener('change', () => {
    state.sort = sort.value;
    update();
  });

  document.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-remove-filter]');
    if (remove) {
      const key = remove.dataset.removeFilter;
      state[key] = state[key].filter((v) => v !== remove.dataset.value);
      renderFilters();
      update();
    }
    if (event.target.closest('[data-clear-filters]')) {
      state = { ...readState(), ...Object.fromEntries(GROUPS.map(([key]) => [key, []])) };
      renderFilters();
      update();
    }
    const opener = event.target.closest('[data-filter-open]');
    if (opener && dialog) openDialog(dialog, { returnFocus: opener });
    if (event.target.closest('[data-filter-apply]') && dialog) closeDialog(dialog);
  });

  renderFilters();
  retitle();
  render();
}

init();
