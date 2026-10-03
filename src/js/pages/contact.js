/**
 * Contact form. V1 has no messaging backend: a valid form explains that the
 * message was not sent.
 */

import { qs } from '../utils/dom.js';
import { validateForm, clearOnInput } from '../utils/forms.js';

const form = qs('[data-contact]');
if (form) {
  clearOnInput(form);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = qs('[data-contact-status]', form);
    const ok = validateForm(form);
    status.hidden = !ok;
    if (ok) status.focus();
  });
}
