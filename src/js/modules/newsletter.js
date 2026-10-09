/**
 * Newsletter forms ([data-newsletter]). No mailing provider is connected
 * yet (features.newsletterSignup), so a valid address gets a clear message
 * that it was not saved. Never confirm a subscription that did not happen.
 *
 * The form carries data-state for styling: "valid" while a well-formed
 * address is typed, "invalid" after a failed submit, "done" after a valid one.
 */

import { qsa, qs } from '../utils/dom.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initNewsletter() {
  qsa('[data-newsletter]').forEach((form) => {
    const input = qs('input[type="email"]', form);
    const status = qs('[data-newsletter-status]', form);
    const setState = (state, message = '') => {
      if (state) form.dataset.state = state;
      else delete form.dataset.state;
      if (state === 'invalid') input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      status.textContent = message;
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!EMAIL.test(input.value.trim())) {
        setState('invalid', 'Enter a valid email address, like name@example.ie.');
        input.focus();
        return;
      }
      form.reset();
      setState('done', 'Thanks. This is a demo: the newsletter is not connected, so your address was not saved or sent anywhere.');
    });

    input.addEventListener('input', () => setState(EMAIL.test(input.value.trim()) ? 'valid' : ''));
  });
}
