import { gsap } from 'gsap';
import { ease } from './config.js';

// [data-parallax="0.15"]   Element wandert beim Scrollen langsamer/schneller als die Seite.
//                          Positiv = bleibt zurück, negativ = eilt voraus. Sinnvoll: -0.3 … 0.3
// Bei Bildern in einem Rahmen mit overflow:hidden wird das Bild leicht vergrößert, damit keine Kante sichtbar wird.
export function initParallax() {
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax) || 0.15;
    const inFrame = el.tagName === 'IMG' || el.tagName === 'VIDEO';
    if (inFrame) gsap.set(el, { scale: 1 + Math.abs(amount) * 1.2 });
    gsap.fromTo(
      el,
      { yPercent: -amount * 50 },
      {
        yPercent: amount * 50,
        ease: ease.none,
        scrollTrigger: {
          trigger: inFrame ? el.parentElement : el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  });
}
