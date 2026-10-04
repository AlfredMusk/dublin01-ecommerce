/**
 * Account forms: sign in, create account and password reset.
 * They validate locally. There is no authentication service yet, so a valid
 * submission explains that accounts are not open and sends nothing anywhere.
 * To connect one: replace the body of `submit` with the API call
 * (docs/api-contract.md, "Authentication").
 */

import { qs, qsa } from '../utils/dom.js';
import { validateForm, clearOnInput } from '../utils/forms.js';

document.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-toggle-password]');
  if (!toggle) return;
  const input = document.getElementById(toggle.getAttribute('aria-controls'));
  const visible = input.type === 'text';
  input.type = visible ? 'password' : 'text';
  toggle.setAttribute('aria-pressed', String(!visible));
  toggle.textContent = visible ? 'Show' : 'Hide';
});

function submit(form) {
  const status = qs('[data-account-status]', form);
  status.hidden = false;
  status.focus();
}

qsa('[data-account-form]').forEach((form) => {
  clearOnInput(form);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const valid = validateForm(form, {
      password: (value) => (form.dataset.accountForm === 'register' && value.length < 8 ? 'Use at least 8 characters.' : ''),
    });
    qs('[data-account-status]', form).hidden = true;
    if (valid) submit(form);
  });
});
