/**
 * Modal dialog controller built on the native <dialog> element:
 * top layer + inert page, focus trap, ESC, backdrop click, scroll lock,
 * aria-expanded on every trigger, and focus restored on close.
 */

import { qsa, trapFocus, lockScroll, unlockScroll } from './dom.js';

const state = new WeakMap();

const setExpanded = (dialog, expanded) => {
  qsa(`[aria-controls="${dialog.id}"]`).forEach((el) => el.setAttribute('aria-expanded', String(expanded)));
};

export function openDialog(dialog, { returnFocus = document.activeElement, initialFocus } = {}) {
  if (!dialog || dialog.open) return;
  dialog.showModal();
  lockScroll();
  setExpanded(dialog, true);
  state.set(dialog, { returnFocus, release: trapFocus(dialog) });
  (initialFocus ?? dialog.querySelector('[autofocus]') ?? dialog.querySelector('[data-dialog-close]'))?.focus();
}

export function closeDialog(dialog, { restoreFocus = true } = {}) {
  if (!dialog?.open) return;
  const entry = state.get(dialog);
  if (entry && !restoreFocus) entry.returnFocus = null;
  dialog.close();
}

/** Wires the close button, ESC and backdrop click once per dialog. */
export function initDialog(dialog) {
  if (!dialog || dialog.dataset.dialogReady) return;
  dialog.dataset.dialogReady = 'true';

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog(dialog);
  });

  // ESC always closes, even when a search field would only clear its value.
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    closeDialog(dialog);
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.closest('[data-dialog-close]')) closeDialog(dialog);
  });

  dialog.addEventListener('close', () => {
    const entry = state.get(dialog);
    entry?.release();
    unlockScroll();
    setExpanded(dialog, false);
    if (entry?.returnFocus?.isConnected) entry.returnFocus.focus();
    state.delete(dialog);
  });
}
