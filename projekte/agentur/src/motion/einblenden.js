import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ease, dur, media } from './config.js';

gsap.registerPlugin(DrawSVGPlugin);

// Bausteine für Zustandswechsel, die Seiten-Skripte auslösen (Fragebogen, Skizze, Danke-Meldung).
// Bei reduzierter Bewegung passiert nichts: der neue Zustand steht sofort da.
const ruhig = () => !matchMedia(media.motion).matches;

// Ein Schritt kommt aus der Richtung, in die man geht; seine Teile folgen kurz versetzt
export function schrittEin(el, richtung = 'vor') {
  if (ruhig() || !el) return;
  const teile = el.querySelectorAll(':scope > *');
  gsap.fromTo(
    teile,
    { x: richtung === 'vor' ? 40 : -40, autoAlpha: 0 },
    { x: 0, autoAlpha: 1, duration: dur.base, ease: ease.out, stagger: 0.05, clearProps: 'transform,opacity,visibility' },
  );
}

// Neue Elemente (Skizzen-Bausteine, Zeilen der Zusammenfassung) tauchen von unten auf
export function auftauchen(els, { stagger = 0.05 } = {}) {
  if (ruhig() || !els || (els.length === 0)) return;
  gsap.fromTo(els, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: dur.base, ease: ease.out, stagger, clearProps: 'transform,opacity,visibility' });
}

// Kurzes Aufleuchten bei einer Änderung (z. B. Skizze wechselt den Stil)
export function puls(el) {
  if (ruhig() || !el) return;
  gsap.fromTo(el, { scale: 0.985 }, { scale: 1, duration: dur.slow, ease: ease.out, clearProps: 'transform' });
}

// Haken zeichnet sich (Danke-Meldung): [data-haken] Kreis und Häkchen
export function hakenZeichnen(root) {
  const teile = root?.querySelectorAll('[data-haken]');
  if (ruhig() || !teile?.length) return;
  gsap.fromTo(teile, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, ease: ease.signature, stagger: 0.25 });
}
