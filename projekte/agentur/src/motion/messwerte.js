import { gsap } from 'gsap';
import { media } from './config.js';

// Messwerte des Schnell-Checks: Ring füllt sich bis zum Wert, die Zahl zählt mit. Ohne Bewegung sofort.
// HTML je Wert: .werte__ring > svg > circle.wert (pathLength=100) + .werte__zahl
export function zeigeWert(li, wert, verzoegerung = 0) {
  const ring = li.querySelector('circle.wert');
  const zahl = li.querySelector('.werte__zahl');
  if (!matchMedia(media.motion).matches) {
    ring.style.strokeDashoffset = 100 - wert;
    zahl.textContent = wert;
    return;
  }
  const stand = { v: 0 };
  gsap.fromTo(ring, { strokeDashoffset: 100 }, { strokeDashoffset: 100 - wert, duration: 1.4, delay: verzoegerung, ease: 'signature' });
  gsap.to(stand, {
    v: wert,
    duration: 1.4,
    delay: verzoegerung,
    ease: 'signature',
    onUpdate: () => (zahl.textContent = Math.round(stand.v)),
  });
}
