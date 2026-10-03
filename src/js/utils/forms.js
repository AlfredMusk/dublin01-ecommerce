/**
 * Inline form validation. Each control can declare data-error="message";
 * extra checks come from `validators` keyed by control name.
 * Errors render below the control (#<id>-error) and are linked with aria-describedby.
 */

import { qsa } from './dom.js';

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Irish Eircode: routing key (e.g. D02, A65) + 4-character unique identifier.
export const EIRCODE = /^(?:D6W|[AC-FHKNPRTV-Y]\d{2})\s?[0-9AC-FHKNPRTV-Y]{4}$/i;

function errorFor(control) {
  const id = `${control.id}-error`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('p');
    el.id = id;
    el.className = 'form-error mt-2';
    (control.closest('.field') ?? control.parentElement).append(el);
  }
  return el;
}

export function setError(control, message) {
  const el = errorFor(control);
  el.textContent = message;
  el.hidden = !message;
  if (message) {
    control.setAttribute('aria-invalid', 'true');
    control.setAttribute('aria-describedby', el.id);
  } else {
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
  }
}

export function validateForm(form, validators = {}) {
  let firstInvalid = null;
  qsa('input, select, textarea', form).forEach((control) => {
    if (!control.id || control.disabled || control.type === 'hidden' || control.closest('[hidden]')) return;
    const value = control.type === 'checkbox' ? control.checked : control.value.trim();
    let message = '';
    if (control.required && !value) message = control.dataset.error ?? 'This field is required.';
    else if (value && control.type === 'email' && !EMAIL.test(value)) message = 'Enter a valid email address, like name@example.ie.';
    else if (value && validators[control.name]) message = validators[control.name](value, form) ?? '';
    setError(control, message);
    if (message && !firstInvalid) firstInvalid = control;
  });
  firstInvalid?.focus();
  return !firstInvalid;
}

/** Clears a control's error as soon as the user edits it. */
export function clearOnInput(form) {
  form.addEventListener('input', (event) => {
    if (event.target.getAttribute('aria-invalid')) setError(event.target, '');
  });
}
