/**
 * Mobile menu (< 1024px): full-screen modal dialog.
 * Markup hooks: [data-menu] dialog, [data-menu-trigger] (aria-controls → dialog id).
 */

import { qs, qsa, mediaDesktop } from '../utils/dom.js';
import { initDialog, openDialog, closeDialog } from '../utils/dialog.js';

export function initMenu() {
  const menu = qs('[data-menu]');
  if (!menu) return;
  initDialog(menu);

  qsa('[data-menu-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => openDialog(menu, { returnFocus: trigger }));
  });

  // The menu has no purpose on desktop: close it if the viewport grows.
  mediaDesktop.addEventListener('change', (event) => event.matches && closeDialog(menu));
}
