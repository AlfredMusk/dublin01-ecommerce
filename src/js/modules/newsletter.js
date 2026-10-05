/**
 * Newsletter forms ([data-newsletter]). No mailing provider is connected
 * yet (features.newsletterSignup), so a valid address gets a clear message
 * that it was not saved. Never confirm a subscription that did not happen.
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
      status.textContent = 'The newsletter is not open yet, so your address was not saved. Please try again soon.';
      form.reset();
    });
    input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
  });
}
