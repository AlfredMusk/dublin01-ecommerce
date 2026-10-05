/** Minimal browser stand-ins so the storefront modules load under node:test. */
const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  },
  addEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {} }),
};
globalThis.document = {
  events: [],
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  dispatchEvent(event) {
    this.events.push(event.type);
  },
};
globalThis.CustomEvent = class {
  constructor(type, init) {
    this.type = type;
    this.detail = init?.detail;
  }
};
export const resetStorage = () => store.clear();
