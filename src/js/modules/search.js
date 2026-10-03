/**
 * Search overlay. Product filtering over src/data/products.json will plug into
 * [data-search-results]; for now the form submits to /pages/search.html?q=.
 * Markup hooks: [data-search] dialog, [data-search-trigger] buttons.
 */

import { qs, qsa } from '../utils/dom.js';
import { initDialog, openDialog, closeDialog } from '../utils/dialog.js';

export function initSearch() {
  const dialog = qs('[data-search]');
  if (!dialog) return;
  initDialog(dialog);

  const input = qs('input[type="search"]', dialog);
  const form = qs('form', dialog);
  const menu = qs('[data-menu]');
  const menuTrigger = qs('[data-menu-trigger]');

  qsa('[data-search-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      let returnFocus = trigger;
      // Opened from the mobile menu: close it and return focus to the menu button.
      if (menu?.open && menu.contains(trigger)) {
        closeDialog(menu, { restoreFocus: false });
        returnFocus = menuTrigger;
      }
      openDialog(dialog, { returnFocus, initialFocus: input });
    });
  });

  // Empty queries stay on the page.
  form?.addEventListener('submit', (event) => {
    if (!input.value.trim()) {
      event.preventDefault();
      input.focus();
    }
  });
}
