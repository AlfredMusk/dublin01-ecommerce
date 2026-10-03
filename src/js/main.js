/**
 * DUBLIN/01 — application entry point, shared by every page.
 * Each module no-ops when its markup is absent.
 */

import { initHeader } from './modules/header.js';
import { initMenu } from './modules/menu.js';
import { initSearch } from './modules/search.js';
import { initCart } from './modules/cart.js';

initHeader();
initMenu();
initSearch();
initCart();

console.info('DUBLIN/01 — environment ready.');
