/**
 * LocalStorage wrapper. Keys are namespaced under "dublin01:"; every access is
 * guarded so private windows or blocked storage never break the page.
 */

const PREFIX = 'dublin01:';

export function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* Storage unavailable: state lives for this page view only. */
  }
}

/** Calls `fn` when another tab changes `key`. */
export function onExternalChange(key, fn) {
  window.addEventListener('storage', (event) => {
    if (event.key === PREFIX + key) fn();
  });
}
