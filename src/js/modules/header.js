/**
 * Global header: sticky state and desktop mega menus.
 * Markup hooks: [data-header], [data-announcement], [data-mega-trigger] (aria-controls → panel id).
 */

import { qs, qsa, mediaDesktop } from '../utils/dom.js';

const OPEN_DELAY = 90;
const CLOSE_DELAY = 200;

export function initHeader() {
  const header = qs('[data-header]');
  if (!header) return;

  initStickyState(header);
  initMegaMenus(header);
}

/** Adds [data-scrolled] once the announcement bar has left the viewport. */
function initStickyState(header) {
  const announcement = qs('[data-announcement]', header);
  if (!announcement) return;
  // -1px: the bar rests exactly at the viewport edge once scrolled away.
  const observer = new IntersectionObserver(
    ([entry]) => header.toggleAttribute('data-scrolled', !entry.isIntersecting),
    { rootMargin: '-1px 0px 0px 0px' },
  );
  observer.observe(announcement);
}

function initMegaMenus(header) {
  const bar = qs('.nav-bar', header);
  const triggers = qsa('[data-mega-trigger]', header);
  if (!bar || !triggers.length) return;

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let current = null;
  let openedAt = 0;
  let timer = 0;

  const panelFor = (trigger) => document.getElementById(trigger.getAttribute('aria-controls'));

  const open = (trigger) => {
    if (current === trigger) return;
    if (current) close({ instant: true });
    current = trigger;
    openedAt = performance.now();
    trigger.setAttribute('aria-expanded', 'true');
    panelFor(trigger)?.setAttribute('data-open', '');
    header.setAttribute('data-mega-open', '');
  };

  function close({ focusTrigger = false } = {}) {
    if (!current) return;
    const trigger = current;
    current = null;
    trigger.setAttribute('aria-expanded', 'false');
    panelFor(trigger)?.removeAttribute('data-open');
    header.removeAttribute('data-mega-open');
    if (focusTrigger) trigger.focus();
  }

  const schedule = (fn, delay) => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      clearTimeout(timer);
      // A click right after a hover-open confirms it rather than closing it.
      if (current === trigger && performance.now() - openedAt > 400) close();
      else open(trigger);
    });
  });

  // Hover intent: only on devices with a real pointer.
  qsa('[data-nav-item]', header).forEach((item) => {
    item.addEventListener('pointerenter', () => {
      if (!canHover.matches) return;
      const trigger = item.matches('[data-mega-trigger]') ? item : null;
      if (trigger) schedule(() => open(trigger), current ? 0 : OPEN_DELAY);
      else schedule(() => close(), CLOSE_DELAY);
    });
  });

  bar.addEventListener('pointerleave', () => canHover.matches && schedule(() => close(), CLOSE_DELAY));
  bar.addEventListener('pointerenter', () => current && clearTimeout(timer));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && current) close({ focusTrigger: true });
  });

  document.addEventListener('click', (event) => {
    if (current && !bar.contains(event.target)) close();
  });

  bar.addEventListener('focusout', (event) => {
    if (current && event.relatedTarget && !bar.contains(event.relatedTarget)) close();
  });

  mediaDesktop.addEventListener('change', () => close());
}
