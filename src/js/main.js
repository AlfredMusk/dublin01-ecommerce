/**
 * DUBLIN/01 — shared entry point for every page (header, search, bag,
 * wishlist, newsletter). Page-specific code lives in src/js/pages/.
 * Each module no-ops when its markup is absent.
 */

import { initHeader } from './modules/header.js';
import { initMenu } from './modules/menu.js';
import { initSearch } from './modules/search.js';
import { initCart } from './modules/cart.js';
import { initWishlist } from './modules/wishlist.js';
import { initNewsletter } from './modules/newsletter.js';

initHeader();
initMenu();
initSearch();
initCart();
initWishlist();
initNewsletter();

console.info('DUBLIN/01 — environment ready.');
