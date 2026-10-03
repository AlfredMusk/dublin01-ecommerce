/**
 * Recently viewed products (slugs, newest first) in LocalStorage.
 */

import { read, write } from '../utils/storage.js';

const KEY = 'recent';
const LIMIT = 8;

export const getRecentlyViewed = () => read(KEY, []);

export function trackView(slug) {
  write(KEY, [slug, ...getRecentlyViewed().filter((s) => s !== slug)].slice(0, LIMIT));
}
