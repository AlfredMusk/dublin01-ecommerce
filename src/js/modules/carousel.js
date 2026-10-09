/**
 * Editorial carousel ([data-carousel]) — used by the home hero.
 * Cross-fades stacked [data-slide] elements and moves to the next one every
 * INTERVAL ms. The clock keeps its remaining time across holds and pauses.
 *
 * Autoplay holds while the pointer is over the carousel, keyboard focus is in
 * a slide or the tab is hidden, and stops until an explicit Play when keyboard
 * focus enters the carousel or the user prefers reduced motion.
 *
 * No visible control: swipe on touch screens, and a Pause / Play button
 * ([data-carousel-pause]) that only shows on keyboard focus.
 * Slide changes made by hand are announced in [data-carousel-status].
 */

import { qs, qsa } from '../utils/dom.js';

const INTERVAL = 6000;
const SWIPE_DISTANCE = 48;
// On a slow connection, autoplay waits this long for the next image before it
// gives the current slide another cycle; a swipe waits this long at most.
const AUTO_WAIT = 4000;
const MANUAL_WAIT = 1500;

export function initCarousel(root = qs('[data-carousel]')) {
  if (!root) return;
  const slides = qsa('[data-slide]', root);
  if (slides.length < 2) return;

  const status = qs('[data-carousel-status]', root);
  const pauseButton = qs('[data-carousel-pause]', root);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover)');

  let index = 0; // slide on screen
  let wanted = 0; // slide asked for; differs from index while its image loads
  let ticket = 0;
  let autoPending = false; // the clock ran out and the next slide is due
  let userPaused = reducedMotion.matches;
  let started = false; // autoplay waits for the first image

  /**
   * Slides after the first ship with data-src (behind a placeholder) so they
   * load after the page. Returns true when it has just started a real image.
   */
  const hydrate = (slide) => {
    qsa('[data-srcset]', slide).forEach((el) => {
      el.srcset = el.dataset.srcset;
      el.removeAttribute('data-srcset');
    });
    const pending = qsa('[data-src]', slide);
    pending.forEach((el) => {
      // Later campaigns must not compete with the first screen for bandwidth.
      el.fetchPriority = 'low';
      el.src = el.dataset.src;
      el.removeAttribute('data-src');
    });
    return pending.length > 0;
  };

  const imageOf = (slide) => qs('img', slide);

  /**
   * Runs `done(true)` once the slide's image has loaded or failed, or
   * `done(false)` if it is still loading after `wait` ms.
   */
  const whenReady = (slide, done, wait = Infinity) => {
    const swapped = hydrate(slide);
    const img = imageOf(slide);
    // Right after a swap `complete` still describes the placeholder: wait for load or error instead.
    if (!img || (!swapped && img.complete)) return done(true);
    let settled = false;
    let timer;
    const finish = (ready) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      done(ready);
    };
    if (Number.isFinite(wait)) timer = setTimeout(() => finish(false), wait);
    img.addEventListener('load', () => finish(true), { once: true });
    img.addEventListener('error', () => finish(true), { once: true });
  };

  const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1200));

  /** One image at a time: the next slide's once the current is shown, the rest after it. */
  const preloadAround = () => {
    const at = index;
    whenReady(slides[at], () => {
      if (index !== at) return;
      whenReady(slides[(at + 1) % slides.length], () => idle(() => slides.forEach(hydrate)));
    });
  };

  const render = ({ announce = false } = {}) => {
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.toggleAttribute('data-active', active);
      slide.toggleAttribute('inert', !active);
    });
    if (announce && status) {
      const title = qs('h2', slides[index])?.textContent ?? '';
      status.textContent = `Campaign ${index + 1} of ${slides.length}: ${title}`;
    }
  };

  // Temporary hold: pointer over the carousel, keyboard focus inside a slide
  // (rotating would make that slide inert and drop the focus), or tab hidden.
  let hovering = false;
  let focusInSlide = false;
  const held = () => hovering || focusInSlide || document.hidden;

  // Autoplay clock. Stopping it keeps the time left, so a hover or a pause
  // does not grant the slide a full new cycle.
  let remaining = INTERVAL;
  let timer = 0;
  let since = 0;

  const stopClock = () => {
    if (!timer) return;
    clearTimeout(timer);
    timer = 0;
    remaining = Math.max(0, remaining - (performance.now() - since));
  };

  const runClock = () => {
    if (timer || !started || userPaused || autoPending || held()) return;
    since = performance.now();
    timer = setTimeout(() => {
      timer = 0;
      remaining = INTERVAL;
      autoPending = true;
      advance();
    }, remaining);
  };

  const restartClock = () => {
    stopClock();
    remaining = INTERVAL;
    runClock();
  };

  const show = (next, options) => {
    index = wanted = (next + slides.length) % slides.length;
    ticket += 1;
    autoPending = false;
    render(options);
    preloadAround();
    restartClock();
  };

  /** A swipe: the outgoing slide stays until the new image is in. */
  const goTo = (next, options) => {
    wanted = (next + slides.length) % slides.length;
    autoPending = false;
    ticket += 1;
    const mine = ticket;
    whenReady(slides[wanted], () => mine === ticket && show(wanted, options), MANUAL_WAIT);
  };

  /** Autoplay step, retried when a hold lifts. Never moves to a slide without its image. */
  const advance = () => {
    if (!autoPending) return;
    if (userPaused || wanted !== index) {
      autoPending = false;
      return;
    }
    if (held()) return;
    const from = index;
    whenReady(
      slides[(from + 1) % slides.length],
      (ready) => {
        if (!autoPending || index !== from || held()) return;
        if (userPaused || wanted !== index) autoPending = false;
        else if (ready) show(from + 1);
        else {
          // Image still loading: give the current slide another cycle.
          autoPending = false;
          restartClock();
        }
      },
      AUTO_WAIT,
    );
  };

  const syncHold = () => {
    if (held()) return stopClock();
    runClock();
    advance();
  };

  const setPaused = (paused) => {
    userPaused = paused;
    if (paused) {
      autoPending = false;
      stopClock();
    } else runClock();
    if (pauseButton) pauseButton.textContent = paused ? 'Play slideshow' : 'Pause slideshow';
  };

  pauseButton?.addEventListener('click', () => setPaused(!userPaused));

  // Keyboard focus entering the carousel stops autoplay until an explicit Play.
  root.addEventListener('focusin', (event) => {
    const fromOutside = !event.relatedTarget || !root.contains(event.relatedTarget);
    if (fromOutside && event.target.matches(':focus-visible') && !userPaused) setPaused(true);
  });

  root.addEventListener('focusin', (event) => {
    // Keyboard focus only: a mouse click on the link must not freeze the slide.
    focusInSlide = Boolean(event.target.closest('[data-slide]')) && event.target.matches(':focus-visible');
    syncHold();
  });
  root.addEventListener('focusout', (event) => {
    focusInSlide = false;
    syncHold();
  });
  root.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse' || !canHover.matches) return;
    hovering = true;
    syncHold();
  });
  root.addEventListener('pointerleave', () => {
    hovering = false;
    syncHold();
  });
  document.addEventListener('visibilitychange', syncHold);

  // Swipe (touch and pen only).
  let startX = 0;
  let startY = 0;
  root.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    startX = event.clientX;
    startY = event.clientY;
  });
  root.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'mouse') return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(wanted + (dx < 0 ? 1 : -1), { announce: true });
  });

  // Turning reduced motion on pauses; turning it off never overrides a pause.
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) setPaused(true);
  });

  // Start the clock, and fetch the second image, only once the first image is
  // on screen (or failed), so neither competes with the page's first paint.
  const start = () => {
    if (started) return;
    started = true;
    preloadAround();
    runClock();
  };
  const firstImage = qs('img', slides[0]);
  if (!firstImage || firstImage.complete) start();
  else {
    firstImage.addEventListener('load', start, { once: true });
    firstImage.addEventListener('error', start, { once: true });
  }

  render();
  setPaused(userPaused);
}
