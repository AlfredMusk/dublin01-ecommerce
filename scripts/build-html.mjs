/**
 * Assembles static pages from src/pages/*.html with the shared partials
 * (layout, header, footer). No dependencies.
 *
 *   node scripts/build-html.mjs           build once
 *   node scripts/build-html.mjs --watch   rebuild on change
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
  const layout = read('src/partials/layout.html');
  const header = read('src/partials/header.html');
  const footer = read('src/partials/footer.html');
  const pages = readdirSync(join(ROOT, 'src/pages')).filter((f) => f.endsWith('.html'));

  for (const file of pages) {
    const name = file.replace(/\.html$/, '');
    const parsed = parsePage(read(`src/pages/${file}`));
    const { meta } = parsed;
    // <!-- @include partial key="value" --> inlines src/partials/<partial>.html, filling {{key}}.
    const content = parsed.content.replace(/<!--\s*@include\s+([\w-]+)([^>]*?)-->/g, (_, partial, args) => {
      let html = read(`src/partials/${partial}.html`);
      for (const [, key, value] of args.matchAll(/([\w-]+)='([^']*)'/g)) html = html.replaceAll(`{{${key}}}`, value);
      return html;
    });
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

    // Mark links to the current page for assistive tech and styling.
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
}
