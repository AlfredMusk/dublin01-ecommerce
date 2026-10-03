/**
 * DUBLIN/01 — entry point.
 * Phase 01: environment check only (JavaScript + Tailwind CSS).
 */

const setStatus = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

const init = () => {
  setStatus('status-js', 'OK');

  const probe = document.getElementById('tailwind-probe');
  const tailwindOk = probe && getComputedStyle(probe).display === 'none';
  setStatus('status-tailwind', tailwindOk ? 'OK' : 'Failed');

  console.info('DUBLIN/01 — environment ready.');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
