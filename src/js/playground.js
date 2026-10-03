/**
 * TEMPORARY — design system playground behaviour.
 * Delete together with the playground markup when the real Home is built.
 */

const motionDemo = document.querySelector('[data-motion-demo]');
const motionToggle = document.querySelector('[data-motion-toggle]');

if (motionDemo && motionToggle) {
  motionToggle.addEventListener('click', () => {
    const active = motionDemo.toggleAttribute('data-active');
    motionToggle.setAttribute('aria-pressed', String(active));
  });
}
