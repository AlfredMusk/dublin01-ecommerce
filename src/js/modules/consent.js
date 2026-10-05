/**
 * Cookie consent: a banner until a choice is made, and a settings dialog that
 * can be reopened at any time from [data-consent-open] (footer, cookie page).
 *
 * Categories: necessary (always on), analytics and marketing (off until the
 * visitor accepts). The choice is stored in LocalStorage ("dublin01:consent")
 * and announced with a "consent:change" event on document.
 *
 * No analytics or marketing script ships with the site. One added later must
 * be loaded only after `hasConsent('analytics' | 'marketing')` is true, and
 * re-checked on "consent:change".
 */

import { qs, qsa } from '../utils/dom.js';
import { read, write } from '../utils/storage.js';
import { initDialog, openDialog, closeDialog } from '../utils/dialog.js';

const KEY = 'consent';
const OPTIONAL = ['analytics', 'marketing'];

/** @returns {{ necessary: true, analytics: boolean, marketing: boolean, decidedAt: string } | null} */
export const getConsent = () => read(KEY, null);
export const hasConsent = (category) => category === 'necessary' || getConsent()?.[category] === true;

function decide(choice) {
  const consent = { necessary: true, analytics: Boolean(choice.analytics), marketing: Boolean(choice.marketing), decidedAt: new Date().toISOString() };
  write(KEY, consent);
  document.dispatchEvent(new CustomEvent('consent:change', { detail: consent }));
}

export function initConsent() {
  const banner = qs('[data-consent-banner]');
  const dialog = qs('[data-consent-dialog]');
  if (!banner || !dialog) return;
  initDialog(dialog);
  const form = qs('[data-consent-form]', dialog);

  const finish = (choice) => {
    decide(choice);
    banner.hidden = true;
    closeDialog(dialog);
  };

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-consent-open]');
    if (opener) {
      const current = getConsent();
      OPTIONAL.forEach((name) => (form.elements[name].checked = current?.[name] === true));
      openDialog(dialog, { returnFocus: opener.isConnected && !banner.contains(opener) ? opener : undefined });
    }
    if (event.target.closest('[data-consent-accept]')) finish({ analytics: true, marketing: true });
    if (event.target.closest('[data-consent-reject]')) finish({ analytics: false, marketing: false });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    finish(Object.fromEntries(OPTIONAL.map((name) => [name, form.elements[name].checked])));
  });

  // Nothing is decided on the visitor's behalf: the banner stays until they choose.
  banner.hidden = getConsent() !== null;
}
