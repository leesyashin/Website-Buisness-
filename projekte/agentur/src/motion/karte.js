import { gsap } from 'gsap';

// [data-karte-kreis]   Köln-Karte: Der Umkreis „Anfahrt inklusive“ wächst aus der Stadtmitte, sobald die Karte
//                      ins Bild kommt. Der Rhein zeichnet sich über data-draw="scrub" (motion/draw.js).
export function initKarte() {
  document.querySelectorAll('[data-karte-kreis]').forEach((kreis) => {
    gsap.from(kreis, {
      scale: 0.2,
      autoAlpha: 0,
      transformOrigin: '50% 50%',
      duration: 1.4,
      ease: 'signature',
      scrollTrigger: { trigger: kreis, start: 'top 80%', once: true },
    });
  });
}
