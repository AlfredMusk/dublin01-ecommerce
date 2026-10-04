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
 * Page template front matter (first HTML comment), one "key: value" per line:
 *   title, description, script (src/js/pages/<name>.js), robots, ogType
 *
 * src/pages/index.html → index.html, 404.html → 404.html, others → pages/<name>.html.
 */

import { readFileSync, writeFileSync, readdirSync, watch } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://dublin01.example'; // Replace with the production domain on deploy.
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
  const dots = campaigns
    .map((c, i) => `<button class="hero-dot" type="button" aria-label="Go to slide ${i + 1}: ${esc(c.title)}" data-carousel-goto="${i}"><span><i></i></span></button>`)
    .join('');
  // The page's <h1> stays outside the slides (inactive slides are inert), and
  // the controls come first in the DOM so Pause is reached early by keyboard.
  return `<section class="hero" aria-roledescription="carousel" aria-label="Campaigns" data-carousel>
  <h1 class="sr-only">DUBLIN/01 — sneakers and streetwear, Dublin</h1>
  <div class="hero-controls">
    <div class="container-site hero-controls-row">
      <div class="hero-progress">${dots}</div>
      <p class="hero-counter" aria-hidden="true"><span data-carousel-current>01</span> / ${String(total).padStart(2, '0')}</p>
      <div class="hero-buttons">
        <button class="hero-btn" type="button" aria-label="Pause slideshow" data-carousel-pause>
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" data-icon-pause><path d="M9 6v12M15 6v12" /></svg>
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" data-icon-play hidden><path d="M8 6l10 6-10 6z" /></svg>
        </button>
        <button class="hero-btn" type="button" aria-label="Previous slide" data-carousel-prev>
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        </button>
        <button class="hero-btn" type="button" aria-label="Next slide" data-carousel-next>
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
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

function outputFor(name) {
  if (name === 'index') return { file: 'index.html', base: '', path: '' };
  if (name === '404') return { file: '404.html', base: '/', path: '404.html' };
  return { file: `pages/${name}.html`, base: '../', path: `pages/${name}.html` };
}

function build() {
  const site = readJson('src/data/site.json');
  const campaigns = readJson('src/data/campaigns.json');
  const layout = read('src/partials/layout.html');
  const footer = read('src/partials/footer.html');
  const header = read('src/partials/header.html')
    .replace('{{announcement}}', () => announcementHtml(site))
    .replace('{{navDesktop}}', () => desktopNavHtml(site))
    .replace('{{navMobile}}', () => mobileNavHtml(site));
  const pages = readdirSync(join(ROOT, 'src/pages')).filter((f) => f.endsWith('.html'));

  for (const file of pages) {
    const name = file.replace(/\.html$/, '');
    const parsed = parsePage(read(`src/pages/${file}`));
    const { meta } = parsed;
    // <!-- @include partial key='value' --> inlines src/partials/<partial>.html, filling {{key}}.
    const content = parsed.content
      .replace(/<!--\s*@include\s+([\w-]+)([^>]*?)-->/g, (_, partial, args) => {
        let html = read(`src/partials/${partial}.html`);
        for (const [, key, value] of args.matchAll(/([\w-]+)='([^']*)'/g)) html = html.replaceAll(`{{${key}}}`, value);
        return html;
      })
      .replace(/<!--\s*@hero\s*-->/, () => heroHtml(campaigns));
    const out = outputFor(name);
    const home = out.base === '' ? './' : out.base;
    const script = meta.script
      ? `<script type="module" src="${out.base}src/js/pages/${meta.script}.js"></script>`
      : '';
    const robots = meta.robots ? `<meta name="robots" content="${meta.robots}" />` : '';

    let html = layout
      .replace('{{header}}', () => header)
      .replace('{{footer}}', () => footer)
      .replace('{{content}}', () => content.trim())
      .replaceAll('{{title}}', meta.title ?? 'DUBLIN/01')
      .replaceAll('{{description}}', meta.description ?? '')
      .replaceAll('{{ogType}}', meta.ogType ?? 'website')
      .replaceAll('{{canonical}}', `${SITE_URL}/${out.path}`)
      .replaceAll('{{siteUrl}}', SITE_URL)
      .replace('{{robots}}', robots)
      .replace('{{pageScript}}', script)
      .replaceAll('{{page}}', name)
      .replaceAll('{{base}}', out.base)
      .replaceAll('{{home}}', home);

    // Mark links to the current page for assistive tech and styling. Links that
    // carry a query string (Men, Women, Sale) are matched at runtime in header.js.
    if (name === 'index') html = html.replace(/data-home-link/g, 'aria-current="page"');
    else {
      html = html.replace(/ data-home-link/g, '');
      html = html.replaceAll(`href="${out.base}pages/${name}.html"`, `href="${out.base}pages/${name}.html" aria-current="page"`);
      // Section pages also mark their mega-menu trigger (a button, so aria-current="true").
      html = html.replace(`aria-controls="mega-${name}"`, `aria-controls="mega-${name}" aria-current="true"`);
    }

    writeFileSync(join(ROOT, out.file), html);
  }
  console.log(`[html] built ${pages.length} pages`);
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
}
