import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ease, dur, enter } from './config.js';

// [data-reveal]            Einblenden beim Hereinscrollen. Werte: up (Standard) · fade · scale · clip
// [data-reveal-stagger]    Eltern-Element: direkte Kinder erscheinen nacheinander
const from = {
  up: { y: 40, autoAlpha: 0 },
  fade: { autoAlpha: 0 },
  scale: { scale: 0.94, autoAlpha: 0 },
  clip: { clipPath: 'inset(100% 0% 0% 0%)' },
};
const to = {
  up: { y: 0, autoAlpha: 1 },
  fade: { autoAlpha: 1 },
  scale: { scale: 1, autoAlpha: 1 },
  clip: { clipPath: 'inset(0% 0% 0% 0%)' },
};

export function initReveal() {
  const single = gsap.utils.toArray('[data-reveal]');
  single.forEach((el) => {
    const kind = from[el.dataset.reveal] ? el.dataset.reveal : 'up';
    gsap.fromTo(el, from[kind], {
      ...to[kind],
      duration: kind === 'clip' ? dur.slow : dur.base,
      ease: ease.out,
      scrollTrigger: { trigger: el, start: enter, once: true },
    });
  });

  // Gruppen: ScrollTrigger.batch fasst Elemente zusammen, die im selben Moment ins Bild kommen
  gsap.utils.toArray('[data-reveal-stagger]').forEach((group) => {
    const items = Array.from(group.children);
    gsap.set(items, from.up);
    ScrollTrigger.batch(items, {
      start: enter,
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { ...to.up, duration: dur.base, ease: ease.out, stagger: 0.08 }),
    });
  });
}
