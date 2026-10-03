/**
 * DOM helpers shared by every module.
 */

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Visible, focusable descendants of `root`, in DOM order. */
export const getFocusable = (root) =>
  qsa(FOCUSABLE, root).filter((el) => el.getClientRects().length > 0 && !el.closest('[inert]'));

/** Keeps Tab / Shift+Tab inside `root`. Returns a cleanup function. */
export function trapFocus(root) {
  const onKeydown = (event) => {
    if (event.key !== 'Tab') return;
    const items = getFocusable(root);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  root.addEventListener('keydown', onKeydown);
  return () => root.removeEventListener('keydown', onKeydown);
}

let scrollLocks = 0;

/** Prevents background scrolling, compensating for the scrollbar width. */
export function lockScroll() {
  if (scrollLocks++ > 0) return;
  const root = document.documentElement;
  const scrollbar = window.innerWidth - root.clientWidth;
  root.style.overflow = 'hidden';
  if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
}

export function unlockScroll() {
  if (scrollLocks === 0 || --scrollLocks > 0) return;
  const root = document.documentElement;
  root.style.overflow = '';
  root.style.paddingRight = '';
}

export const mediaDesktop = window.matchMedia('(width >= 64rem)');
