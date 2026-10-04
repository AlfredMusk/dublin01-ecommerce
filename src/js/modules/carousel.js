/**
 * Editorial carousel ([data-carousel]) — used by the home hero.
 * Cross-fades stacked [data-slide] elements. Autoplay is driven by the CSS
 * progress animation (one "animationend" per slide), so there is a single
 * clock and pausing is just pausing that animation.
 *
 * Autoplay holds while the pointer is over the carousel or the tab is hidden,
 * and stops until an explicit Play when keyboard focus enters the carousel
 * or the user prefers reduced motion.
 *
 * Hooks: [data-carousel-prev], [data-carousel-next], [data-carousel-pause],
 * [data-carousel-goto="<index>"], [data-carousel-current], [data-carousel-status].
 */

import { qs, qsa } from '../utils/dom.js';

const SWIPE_DISTANCE = 48;
// A real autoplay cycle lasts seconds. Anything shorter is a neutralised
// animation (reduced motion) and must never advance the slide.
const MIN_CYCLE_SECONDS = 1;
// On a slow connection, autoplay waits this long for the next image before it
// gives the current slide another cycle; a click waits this long at most.
const AUTO_WAIT = 4000;
const MANUAL_WAIT = 1500;

export function initCarousel(root = qs('[data-carousel]')) {
  if (!root) return;
  const slides = qsa('[data-slide]', root);
  if (slides.length < 2) return;

  const controls = qs('.hero-controls', root);
  const bars = qsa('[data-carousel-goto]', root);
  const current = qs('[data-carousel-current]', root);
  const status = qs('[data-carousel-status]', root);
  const pauseButton = qs('[data-carousel-pause]', root);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = window.matchMedia('(hover: hover)');

  let index = 0; // slide on screen
  let wanted = 0; // slide asked for; differs from index while its image loads
  let ticket = 0;
  let autoPending = false; // the bar finished and the next slide is due
  let userPaused = reducedMotion.matches;
  let started = false; // autoplay waits for the first image

  /** Slides after the first ship with data-src so they load after the page. */
  const hydrate = (slide) => {
    qsa('[data-srcset]', slide).forEach((el) => {
      el.srcset = el.dataset.srcset;
      el.removeAttribute('data-srcset');
    });
    qsa('[data-src]', slide).forEach((el) => {
      el.src = el.dataset.src;
      el.removeAttribute('data-src');
    });
  };

  const imageOf = (slide) => qs('img', slide);
  const isLoaded = (img) => !img || (img.complete && img.naturalWidth > 0);

  /**
   * Runs `done(true)` once the slide's image has loaded or failed, or
   * `done(false)` if it is still loading after `wait` ms.
   */
  const whenReady = (slide, done, wait = Infinity) => {
    hydrate(slide);
    const img = imageOf(slide);
    if (!img || img.complete) return done(true);
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

  const syncPlaying = () => root.toggleAttribute('data-playing', started && !userPaused);

  const render = ({ announce = false } = {}) => {
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.toggleAttribute('data-active', active);
      slide.toggleAttribute('inert', !active);
    });
    bars.forEach((bar, i) => {
      bar.toggleAttribute('data-done', i < index);
      bar.toggleAttribute('data-current', i === index);
      if (i === index) bar.setAttribute('aria-current', 'true');
      else bar.removeAttribute('aria-current');
    });
    if (current) current.textContent = String(index + 1).padStart(2, '0');
    if (announce && status) {
      const title = qs('h2', slides[index])?.textContent ?? '';
      status.textContent = `Slide ${index + 1} of ${slides.length}: ${title}`;
    }
  };

  const restartBar = () => {
    root.removeAttribute('data-playing');
    void root.offsetWidth;
    syncPlaying();
  };

  const show = (next, options) => {
    index = wanted = (next + slides.length) % slides.length;
    ticket += 1;
    autoPending = false;
    render(options);
    preloadAround();
    restartBar();
  };

  /** A click, key or swipe: the outgoing slide stays until the new image is in. */
  const goTo = (next, options) => {
    wanted = (next + slides.length) % slides.length;
    autoPending = false;
    ticket += 1;
    const mine = ticket;
    whenReady(slides[wanted], () => mine === ticket && show(wanted, options), MANUAL_WAIT);
  };

  // Temporary hold: pointer over the carousel, keyboard focus inside a slide
  // (rotating would make that slide inert and drop the focus), or tab hidden.
  let hovering = false;
  let focusInSlide = false;
  const held = () => hovering || focusInSlide || document.hidden;

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
          restartBar();
        }
      },
      AUTO_WAIT,
    );
  };

  const syncHold = () => {
    root.toggleAttribute('data-holding', held());
    advance();
  };

  const setPaused = (paused) => {
    userPaused = paused;
    syncPlaying();
    if (!pauseButton) return;
    pauseButton.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    qs('[data-icon-pause]', pauseButton)?.toggleAttribute('hidden', paused);
    qs('[data-icon-play]', pauseButton)?.toggleAttribute('hidden', !paused);
  };

  // Autoplay: the progress bar finishing makes the next slide due.
  root.addEventListener('animationend', (event) => {
    if (event.animationName !== 'hero-progress' || userPaused) return;
    if (event.elapsedTime < MIN_CYCLE_SECONDS) return;
    autoPending = true;
    advance();
  });

  qs('[data-carousel-next]', root)?.addEventListener('click', () => goTo(wanted + 1, { announce: true }));
  qs('[data-carousel-prev]', root)?.addEventListener('click', () => goTo(wanted - 1, { announce: true }));
  pauseButton?.addEventListener('click', () => setPaused(!userPaused));
  bars.forEach((bar) => bar.addEventListener('click', () => goTo(Number(bar.dataset.carouselGoto), { announce: true })));

  // Arrow keys work from the controls only: from a slide's link they would
  // make that slide inert and drop focus on <body>.
  controls?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') goTo(wanted + 1, { announce: true });
    else if (event.key === 'ArrowLeft') goTo(wanted - 1, { announce: true });
  });

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

  // Swipe (touch and pen only; mouse users have the buttons).
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
    syncPlaying();
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
