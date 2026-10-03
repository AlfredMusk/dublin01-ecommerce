/**
 * Newsletter forms ([data-newsletter]). V1 has no mailing backend, so a valid
 * address gets an honest confirmation that nothing was stored.
 */

import { qsa, qs } from '../utils/dom.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initNewsletter() {
  qsa('[data-newsletter]').forEach((form) => {
    const input = qs('input[type="email"]', form);
    const status = qs('[data-newsletter-status]', form);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!EMAIL.test(input.value.trim())) {
        input.setAttribute('aria-invalid', 'true');
        status.textContent = 'Enter a valid email address, like name@example.ie.';
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      status.textContent = 'Thanks. Sign-ups open with the full launch; this preview did not store your address.';
      form.reset();
    });
    input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
  });
}
