/**
 * Site-relative URLs. Pages declare their depth on <html data-base>
 * ("" for the home page, "../" inside /pages), so links and assets
 * resolve the same way locally, on a sub-path host or in a preview.
 */

export const base = () => document.documentElement.dataset.base ?? '';

export const asset = (path) => `${base()}${path}`;

export const pageUrl = (name, params) => {
  const query = params ? `?${new URLSearchParams(params)}` : '';
  return `${base()}pages/${name}.html${query}`;
};

export const productUrl = (slug) => pageUrl('product', { slug });

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
