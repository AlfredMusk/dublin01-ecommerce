/**
 * Assembles static pages from src/pages/*.html with the shared partials
 * (layout, header, footer) and the site data. No dependencies.
 *
 *   node scripts/build-html.mjs           build once
 *   node scripts/build-html.mjs --watch   rebuild on change
 *
 * Data-driven parts (rendered here, so every page ships plain HTML):
 *   src/data/site.json       announcement bar + navigation (desktop bar, mega menus, mobile menu)
 *   src/data/campaigns.json  home hero campaigns (<!-- @hero --> in a page template)
 *
 *   src/data/products.json   one page per product (products/<slug>.html) and per brand (brands/<slug>.html)
 *   src/js/config.js         company details and the production origin
 *
 * Page template front matter (first HTML comment), one "key: value" per line:
 *   title, description, script (src/js/pages/<name>.js), robots, ogType,
 *   breadcrumb ("Brands > Nike", for structured data)
 *
 * Output: src/pages/<name>.html → <name>.html at the site root;
 * src/templates/product.html and brand.html → products/ and brands/;
 * pages/<old-name>.html are small stubs that forward old addresses.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, watch } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const { company, commerce, siteUrl } = await import('../src/js/config.js');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const readJson = (path) => JSON.parse(read(path));

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (value) => String(value ?? '').replace(/[&<>"]/g, (c) => ESCAPES[c]);

const ARROW = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>';
const CHEVRON = '<svg class="icon nav-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 7 7 7-7" /></svg>';
const PLUS = '<svg class="icon menu-entry-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>';
const ARROW_MARK = '<svg class="icon menu-entry-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>';

/* ---------- Announcement bar ---------- */

function announcementHtml({ announcement }) {
  const [message] = announcement.messages;
  const { left, right } = announcement;
  return `<div class="container-site announcement-grid">
      ${left ? `<a class="announcement-link announcement-side" href="{{base}}${left.href}">${esc(left.text)}</a>` : '<span class="announcement-side"></span>'}
      <a class="announcement-link announcement-main" href="{{base}}${message.href}" data-announcement-message="${esc(message.id)}">${esc(message.text)}</a>
      ${right ? `<p class="announcement-side announcement-locale"><span class="sr-only">${esc(right.label)}: </span><span aria-hidden="true">${esc(right.text)}</span></p>` : ''}
    </div>`;
}

/* ---------- Navigation: one config, two renderings ---------- */

const linkList = (links) =>
  links.map((link) => `<li><a class="link-menu" href="{{base}}${link.href}">${esc(link.label)}</a></li>`).join('\n');

function megaPanelHtml(item) {
  // The panel's footer already links to the whole section ("All sneakers"),
  // so that link is left out of the columns here. The mobile menu keeps it.
  const columns = item.groups
    .map((group) => {
      const links = group.links.filter((link) => link.href !== item.href);
      return `<div class="mega-col"><p class="mega-heading">${esc(group.title)}</p><ul role="list">\n${linkList(links)}\n</ul></div>`;
    })
    .join('\n');
  return `<div class="mega-panel" id="mega-${item.id}">
  <div class="container-site">
    <div class="mega-grid">
${columns}
      <div class="mega-feature" data-mega-featured="${esc(item.featured ?? '')}">
        <p class="mega-heading">Featured</p>
        <p class="type-h3 max-w-[18ch]">${esc(item.fallback ?? '')}</p>
      </div>
    </div>
    <div class="mega-foot">
      <a class="link-action" href="{{base}}${item.href}">${esc(item.allLabel ?? item.label)} ${ARROW}</a>
      <p class="type-micro text-neutral-600">Free delivery in Ireland over €100 · 30-day returns</p>
    </div>
  </div>
</div>`;
}

function desktopNavHtml({ navigation }) {
  const items = navigation
    .filter((item) => item.bar !== false)
    .map((item) =>
      item.groups
        ? `<li>
  <button class="link-nav" type="button" aria-expanded="false" aria-controls="mega-${item.id}" data-mega-trigger data-nav-item data-nav-id="${item.id}">
    <span>${esc(item.label)}</span>${CHEVRON}
  </button>
${megaPanelHtml(item)}
</li>`
        : `<li><a class="link-nav" href="{{base}}${item.href}" data-nav-item data-nav-id="${item.id}">${esc(item.label)}</a></li>`,
    )
    .join('\n');
  return `<ul class="nav-list" role="list">\n${items}\n</ul>`;
}

function mobileNavHtml({ navigation }) {
  const items = navigation
    .map((item) =>
      item.groups
        ? `<li>
  <details class="menu-group">
    <summary class="menu-entry">${esc(item.label)}${PLUS}</summary>
    <div class="menu-group-body">
      <div class="menu-group-grid">
${item.groups.map((group) => `<div><p class="mega-heading">${esc(group.title)}</p><ul role="list">\n${linkList(group.links)}\n</ul></div>`).join('\n')}
      </div>
    </div>
  </details>
</li>`
        : `<li><a class="menu-entry" href="{{base}}${item.href}" data-nav-id="${item.id}">${esc(item.label)}${ARROW_MARK}</a></li>`,
    )
    .join('\n');
  return `<ul class="menu-list" role="list">\n${items}\n</ul>`;
}

/* ---------- Home hero: campaigns ---------- */

function heroHtml(campaigns) {
  const total = campaigns.length;
  const slides = campaigns
    .map((c, i) => {
      const first = i === 0;
      // Only the first campaign loads with the page; the others ship as data-src
      // and are hydrated by src/js/modules/carousel.js.
      const srcset = first ? 'srcset' : 'data-srcset';
      const src = first ? 'src' : 'data-src';
      return `    <article class="hero-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${total}" data-slide data-campaign="${esc(c.id)}"${first ? ' data-active' : ' inert'}>
      <picture style="--hero-pos-tall: ${esc(c.objectPosition.tall)}; --hero-pos-wide: ${esc(c.objectPosition.wide)}">
        <source media="(min-width: 64rem), (orientation: landscape)" ${srcset}="{{base}}${c.image.wide}" width="1920" height="1080" />
        <img class="hero-media" ${src}="{{base}}${c.image.tall}" width="1080" height="1350"
          ${first ? 'fetchpriority="high"' : 'decoding="async"'} alt="${esc(c.imageAlt)}" />
      </picture>
      <div class="hero-content">
        <div class="container-site">
          <p class="type-label">${esc(c.eyebrow)}</p>
          <h2 class="hero-title" style="max-width: ${esc(c.titleWidth ?? '12ch')}">${esc(c.title)}</h2>
          <p class="hero-description">${esc(c.description)}</p>
          <a class="btn btn-inverse hero-cta" href="{{base}}${c.ctaHref}">${esc(c.ctaLabel)}<span class="sr-only">: ${esc(c.title)}</span></a>
        </div>
      </div>
    </article>`;
    })
    .join('\n');
  // The page's <h1> stays outside the slides (inactive slides are inert), and
  // the controls come first in the DOM so Pause is reached early by keyboard.
  // Pause is only shown on keyboard focus: the carousel has no visible control.
  return `<section class="hero" aria-roledescription="carousel" aria-label="Campaigns" data-carousel>
  <h1 class="sr-only">DUBLIN/01 — sneakers and streetwear, Dublin</h1>
  <div class="hero-controls">
    <div class="container-site">
      <button class="hero-pause" type="button" data-carousel-pause>Pause slideshow</button>
    </div>
  </div>
  <div class="hero-slides" data-carousel-slides>
${slides}
  </div>
  <p class="sr-only" aria-live="polite" data-carousel-status></p>
</section>`;
}

/* ---------- Pages ---------- */

function parsePage(source) {
  const match = source.match(/^<!--([\s\S]*?)-->\s*/);
  const meta = {};
  if (match) {
    for (const line of match[1].split('\n')) {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, content: match ? source.slice(match[0].length) : source };
}

/** Output file for a page name: everything sits at the site root except products/ and brands/. */
function outputFor(path) {
  const depth = path.split('/').length - 1;
  return { file: path, base: path === '404.html' ? '/' : '../'.repeat(depth), path };
}

/** Public URL of a generated file: clean (no .html) once a production origin is configured, relative before. */
const publicUrl = (path, base) => {
  const clean = path === 'index.html' ? '' : path.replace(/\.html$/, '');
  return siteUrl ? `${siteUrl}/${clean}` : `${base}${path === 'index.html' ? '' : path}` || './';
};

const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

const organisationLd = (base) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: company.tradingName,
  url: publicUrl('index.html', base),
  ...(company.legalName && { legalName: company.legalName }),
  ...(company.email && { email: company.email }),
  ...(company.phone && { telephone: company.phone }),
  ...(company.vatNumber && { vatID: company.vatNumber }),
});

const websiteLd = (base) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: company.tradingName,
  url: publicUrl('index.html', base),
  potentialAction: {
    '@type': 'SearchAction',
    target: `${publicUrl('search.html', base)}?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

/** "Brands > Nike" → BreadcrumbList. `trail` maps a crumb label to its page. */
function breadcrumbLd(labels, out, trail = {}) {
  const items = [['Home', 'index.html'], ...labels.map((label, i) => [label, i === labels.length - 1 ? out.path : trail[label]])];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      ...(path && { item: publicUrl(path, out.base) }),
    })),
  };
}

const productTitle = (p) => (p.brand === 'DUBLIN/01' ? p.name : `${p.brand} ${p.name}`);
const CATEGORY_PAGES = { sneakers: ['Sneakers', 'sneakers.html'], clothing: ['Clothing', 'clothing.html'], accessories: ['Accessories', 'accessories.html'] };

/** Product structured data: price and availability straight from the catalogue; no ratings or reviews. */
function productLd(p, out) {
  const units = Object.values(p.inventory).reduce((sum, n) => sum + n, 0);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productTitle(p),
    sku: p.id,
    brand: { '@type': 'Brand', name: p.brand },
    color: p.color,
    description: p.description,
    image: p.images.map((image) => (siteUrl ? `${siteUrl}/${image}` : `${out.base}${image}`)),
    offers: {
      '@type': 'Offer',
      price: p.price.toFixed(2),
      priceCurrency: p.currency,
      availability: `https://schema.org/${units > 0 ? 'InStock' : 'OutOfStock'}`,
      url: publicUrl(out.path, out.base),
    },
  };
}

const BRAND_BLURBS = {
  Nike: 'Air Force 1, Dunk, Cortez, Air Max 90 and trail running.',
  adidas: 'Samba, Gazelle and Handball Spezial.',
  'New Balance': 'The 990v6 and 997H in grey, the 327, and Fresh Foam for the road and the trail.',
  ASICS: 'The GEL-Kayano 14, in two colourways.',
  Salomon: 'Trail shoes that work as well in the city.',
  'DUBLIN/01': 'Our own label: hoodies, tees, outerwear and accessories designed in Dublin.',
};
const brandSlug = (brand) => brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const euro = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

/**
 * Company and commerce values from src/js/config.js.
 *   {{company.email}}                      value, HTML-escaped
 *   {{commerce.standardDelivery}}          amounts are formatted as euro
 *   {{#if company.email}} … {{/if}}        kept only when the value is set
 * A company detail that is not configured never reaches the page.
 */
function fillConfig(html) {
  const scope = { company: { ...company, footerName: company.legalName ?? company.tradingName }, commerce };
  const lookup = (path) => path.split('.').reduce((value, key) => value?.[key], scope);
  const block = /\{\{#if ([\w.]+)\}\}((?:(?!\{\{#if )[\s\S])*?)\{\{\/if\}\}/g;
  while (block.test(html)) html = html.replace(block, (_, path, inner) => (lookup(path) ? inner : ''));
  return html.replace(/\{\{((?:company|commerce)\.[\w.]+)\}\}/g, (_, path) => {
    const value = lookup(path);
    const money = /Delivery|Threshold/.test(path) && typeof value === 'number';
    return esc(money ? euro.format(value).replace(/\.00$/, '') : value ?? '');
  });
}

/** Old addresses (pages/*.html, with ?slug= or filter queries) forward to the new ones. */
const LEGACY_PAGES = ['about', 'account', 'bag', 'brands', 'checkout', 'clothing', 'contact', 'cookies', 'delivery', 'faq', 'new', 'privacy', 'product', 'returns', 'search', 'shop', 'sneakers', 'terms', 'wishlist'];
const LEGACY_SLUGS = { 'new-balance-2002r-rain-cloud': 'new-balance-997h-grey', 'asics-gel-kayano-14-white-blue': 'asics-gel-kayano-14-pure-silver', 'salomon-xt-6-black': 'salomon-xa-pro-3d-gtx-black' };

function legacyStub(name) {
  const fallback = { new: 'new-arrivals', product: 'new-arrivals', account: 'login' }[name] ?? name;
  return `<!doctype html>
<!-- Generated by scripts/build-html.mjs: forwards an old address to its new one. -->
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting — DUBLIN/01</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${siteUrl ? `${siteUrl}/${fallback === 'index' ? '' : fallback}` : `../${fallback}.html`}" />
    <script>
      (function () {
        var q = new URLSearchParams(location.search), name = ${JSON.stringify(name)}, renamed = ${JSON.stringify(LEGACY_SLUGS)}, target;
        var has = function (key, value) { return (q.get(key) || '').split(',').indexOf(value) > -1; };
        if (name === 'product' && q.get('slug')) target = 'products/' + encodeURIComponent(renamed[q.get('slug')] || q.get('slug')) + '.html';
        else if (name === 'shop' && has('gender', 'men')) target = 'men.html';
        else if (name === 'shop' && has('gender', 'women')) target = 'women.html';
        else if (name === 'shop' && has('collection', 'sale')) target = 'sale.html';
        else if (name === 'clothing' && has('type', 'accessories')) target = 'accessories.html';
        else if (name === 'sneakers' && has('style', 'running') && has('style', 'trail')) target = 'running-trail.html';
        else target = ${JSON.stringify(fallback)} + '.html' + (name === 'product' ? '' : location.search);
        location.replace('../' + target);
      })();
    </script>
    <noscript><meta http-equiv="refresh" content="0; url=../${fallback}.html" /></noscript>
  </head>
  <body><p><a href="../${fallback}.html">This page has moved.</a></p></body>
</html>
`;
}

function build() {
  const site = readJson('src/data/site.json');
  const campaigns = readJson('src/data/campaigns.json');
  const products = readJson('src/data/products.json');
  const layout = read('src/partials/layout.html');
  const footer = read('src/partials/footer.html');
  const header = read('src/partials/header.html')
    .replace('{{announcement}}', () => announcementHtml(site))
    .replace('{{navDesktop}}', () => desktopNavHtml(site))
    .replace('{{navMobile}}', () => mobileNavHtml(site));

  /** Renders one page. `vars` fills {{name}} placeholders of a template; `ld` adds structured data. */
  const render = (source, path, { vars = {}, ld = [], ogImage } = {}) => {
    for (const [key, value] of Object.entries(vars)) source = source.replaceAll(`{{${key}}}`, value);
    const parsed = parsePage(source);
    const { meta } = parsed;
    // <!-- @include partial key='value' --> inlines src/partials/<partial>.html, filling {{key}}.
    const content = parsed.content
      .replace(/<!--\s*@include\s+([\w-]+)([^>]*?)-->/g, (_, partial, args) => {
        let html = read(`src/partials/${partial}.html`);
        for (const [, key, value] of args.matchAll(/([\w-]+)='([^']*)'/g)) html = html.replaceAll(`{{${key}}}`, value);
        return html;
      })
      .replace(/<!--\s*@hero\s*-->/, () => heroHtml(campaigns));
    const out = outputFor(path);
    const home = out.base === '' ? './' : out.base;
    const script = meta.script ? `<script type="module" src="${out.base}src/js/pages/${meta.script}.js"></script>` : '';
    const robots = meta.robots ? `<meta name="robots" content="${meta.robots}" />` : '';
    const structured = [...ld];
    if (path === 'index.html') structured.push(organisationLd(out.base), websiteLd(out.base));
    if (meta.breadcrumb) structured.push(breadcrumbLd(meta.breadcrumb.split('>').map((label) => label.trim()), out, { Brands: 'brands.html' }));
    const image = ogImage ?? 'public/images/editorial/hero-wide.webp';

    let html = layout
      .replace('{{header}}', () => header)
      .replace('{{footer}}', () => footer)
      .replace('{{content}}', () => content.trim())
      .replaceAll('{{title}}', esc(meta.title ?? 'DUBLIN/01'))
      .replaceAll('{{description}}', esc(meta.description ?? ''))
      .replaceAll('{{ogType}}', meta.ogType ?? 'website')
      .replaceAll('{{canonical}}', publicUrl(out.path, out.base))
      .replaceAll('{{ogImage}}', siteUrl ? `${siteUrl}/${image}` : `${out.base}${image}`)
      .replace('{{robots}}', robots)
      .replace('{{structuredData}}', structured.map(jsonLd).join('\n    '))
      .replace('{{pageScript}}', script)
      .replaceAll('{{page}}', path.replace(/\.html$/, '').replace(/\//g, '-'))
      .replaceAll('{{year}}', String(new Date().getFullYear()))
      .replaceAll('{{base}}', out.base)
      .replaceAll('{{home}}', home);
    html = fillConfig(html);

    // Mark links to the current page for assistive tech and styling.
    if (path === 'index.html') html = html.replace(/data-home-link/g, 'aria-current="page"');
    else {
      html = html.replace(/ data-home-link/g, '');
      html = html.replaceAll(`href="${out.base}${path}"`, `href="${out.base}${path}" aria-current="page"`);
      // Section pages also mark their mega-menu trigger (a button, so aria-current="true").
      html = html.replace(`aria-controls="mega-${path.replace(/\.html$/, '')}"`, `aria-controls="mega-${path.replace(/\.html$/, '')}" aria-current="true"`);
    }

    mkdirSync(dirname(join(ROOT, out.file)), { recursive: true });
    writeFileSync(join(ROOT, out.file), html);
  };

  const written = [];
  const emit = (source, path, options) => {
    render(source, path, options);
    written.push(path);
  };

  for (const file of readdirSync(join(ROOT, 'src/pages')).filter((f) => f.endsWith('.html'))) {
    emit(read(`src/pages/${file}`), file);
  }

  // One static page per product: its own title, description, canonical and structured data.
  const productTemplate = read('src/templates/product.html');
  for (const p of products) {
    const path = `products/${p.slug}.html`;
    const [categoryLabel, categoryPath] = CATEGORY_PAGES[p.category];
    const out = outputFor(path);
    emit(productTemplate, path, {
      vars: {
        productSlug: p.slug,
        productTitle: esc(`${productTitle(p)}, ${p.color}`),
        productDescription: esc(`${productTitle(p)} in ${p.color}. ${p.description}`),
        productName: esc(productTitle(p)),
      },
      ld: [productLd(p, out), breadcrumbLd([categoryLabel, productTitle(p)], out, { [categoryLabel]: categoryPath })],
      ogImage: p.images[0],
    });
  }

  // One catalogue page per brand that has products.
  const brandTemplate = read('src/templates/brand.html');
  for (const name of [...new Set(products.map((p) => p.brand))]) {
    emit(brandTemplate, `brands/${brandSlug(name)}.html`, {
      vars: { brandName: name, brandSlug: brandSlug(name), brandBlurb: BRAND_BLURBS[name] ?? `Everything from ${name} currently in the shop.` },
    });
  }

  mkdirSync(join(ROOT, 'pages'), { recursive: true });
  for (const name of LEGACY_PAGES) writeFileSync(join(ROOT, `pages/${name}.html`), legacyStub(name));

  // The sitemap needs absolute URLs, so it waits for a production origin.
  if (siteUrl) {
    const noindex = new Set(['404.html', 'search.html', 'bag.html', 'checkout.html', 'wishlist.html', 'login.html', 'register.html', 'forgot-password.html', 'account.html']);
    const urls = written.filter((path) => !noindex.has(path)).map((path) => `  <url><loc>${publicUrl(path, '')}</loc></url>`);
    writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  }
  console.log(`[html] built ${written.length} pages (${products.length} products)`);
}

build();

if (process.argv.includes('--watch')) {
  let timer;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build();
      } catch (error) {
        console.error('[html]', error.message);
      }
    }, 50);
  };
  watch(join(ROOT, 'src/partials'), rebuild);
  watch(join(ROOT, 'src/pages'), rebuild);
  watch(join(ROOT, 'src/data'), rebuild);
  watch(join(ROOT, 'src/templates'), rebuild);
}
