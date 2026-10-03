/**
 * Account: sign in, create account and password reset forms.
 * There is no authentication backend in V1, so valid submissions explain that
 * nothing was created or checked.
 */

import { qs, qsa } from '../utils/dom.js';
import { validateForm, clearOnInput } from '../utils/forms.js';

const panels = qsa('[data-account-panel]');

function show(name) {
  panels.forEach((panel) => (panel.hidden = panel.dataset.accountPanel !== name));
  const panel = qs(`[data-account-panel="${name}"]`);
  qs('h2', panel)?.focus();
  qsa('[data-account-status]').forEach((el) => (el.hidden = true));
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-show-panel]');
  if (link) {
    event.preventDefault();
    show(link.dataset.showPanel);
  }
  const toggle = event.target.closest('[data-toggle-password]');
  if (toggle) {
    const input = document.getElementById(toggle.getAttribute('aria-controls'));
    const visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    toggle.setAttribute('aria-pressed', String(!visible));
    toggle.textContent = visible ? 'Show' : 'Hide';
  }
});

qsa('[data-account-form]').forEach((form) => {
  clearOnInput(form);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const ok = validateForm(form, {
      password: (v) => (form.dataset.accountForm === 'register' && v.length < 8 ? 'Use at least 8 characters.' : ''),
    });
    const status = qs('[data-account-status]', form);
    status.hidden = !ok;
    if (ok) status.focus();
  });
});
