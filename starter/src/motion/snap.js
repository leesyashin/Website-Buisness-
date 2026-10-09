import { gsap } from 'gsap';

// Einrasten: frei scrollen – sobald die Bewegung ausläuft, gleitet die Seite in Scrollrichtung zum nächsten
// sauberen Haltepunkt. Ein kleiner Schubs geht einen Haltepunkt weiter, ein kräftiger Wisch fährt durch und
// landet sauber. So bleibt keine Szene halb fertig stehen (Dose zwischen zwei Kapiteln, Text halb unter einem Objekt).
//
// [data-snap]              Anfang des Elements ist ein Haltepunkt
// [data-snap="start end"]  zusätzlich das Ende – für Abschnitte, die höher als der Bildschirm sind
// [data-snap-steps="4"]    zusätzlich gleichmäßige Zwischenhalte – z. B. eine angeheftete Seitwärts-Strecke Karte für Karte
// <body data-snap-type="mandatory">   immer einrasten (Produktseiten, Szenen-Abfolgen) – nur am Desktop;
//                                    am Handy sind Abschnitte oft höher als der Bildschirm, dort gilt proximity
// <body data-snap-type="proximity">   nur einrasten, wenn ein Haltepunkt nah ist (Standard; lange Seiten, Seitwärts-Strecken)
//
// Eigene Logik statt lenis/snap: dessen Entscheidung fällt, während die weiche Scrollbewegung noch läuft,
// und springt dann oft zurück statt weiter.
const SETTLE_MS = 140;
const NEAR = 0.35; // proximity: Haltepunkt höchstens 35 % der Bildschirmhöhe entfernt

export function initSnap(lenis) {
  const elements = Array.from(document.querySelectorAll('[data-snap]'));
  if (!lenis || !elements.length) return;

  const mandatory = document.body.dataset.snapType === 'mandatory' && matchMedia('(min-width: 900px)').matches;
  const ease = gsap.parseEase('signature');

  const points = () => {
    const vh = innerHeight;
    const list = elements.flatMap((el) => {
      // Angeheftete Abschnitte: der Platzhalter von ScrollTrigger (pin-spacer) enthält die ganze Pin-Strecke
      const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
      const r = box.getBoundingClientRect();
      const top = r.top + scrollY;
      const end = top + r.height - vh;
      const out = (el.dataset.snap || 'start').split(/\s+/).map((a) => (a === 'end' ? end : top));
      const steps = parseInt(el.dataset.snapSteps, 10);
      for (let i = 1; i < steps; i++) out.push(top + ((end - top) * i) / steps);
      return out;
    });
    list.push(lenis.limit);
    return [...new Set(list.map((v) => Math.round(Math.min(Math.max(v, 0), lenis.limit))))].sort((a, b) => a - b);
  };

  let dir = 1;
  let timer = 0;
  let snapping = false;

  const settle = () => {
    // Weiche Scrollbewegung erst auslaufen lassen
    if (Math.abs(lenis.velocity) > 0.4) {
      timer = setTimeout(settle, 60);
      return;
    }
    const y = lenis.animatedScroll;
    const list = points();
    if (list.some((p) => Math.abs(p - y) < 2)) return;
    const target = dir > 0 ? list.find((p) => p > y) : list.findLast((p) => p < y);
    if (target === undefined) return;
    const dist = Math.abs(target - y);
    if (!mandatory && dist > innerHeight * NEAR) return;

    snapping = true;
    lenis.scrollTo(target, {
      duration: gsap.utils.clamp(0.45, 1.2, (dist / innerHeight) * 1.1),
      easing: ease,
      onComplete: () => (snapping = false),
    });
  };

  const onScroll = () => {
    if (snapping) return;
    if (lenis.direction) dir = lenis.direction;
    clearTimeout(timer);
    timer = setTimeout(settle, SETTLE_MS);
  };
  // Neue Eingabe während des Einrastens übernimmt sofort
  const release = () => (snapping = false);

  lenis.on('scroll', onScroll);
  const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  inputs.forEach((t) => window.addEventListener(t, release, { passive: true }));

  return () => {
    clearTimeout(timer);
    lenis.off('scroll', onScroll);
    inputs.forEach((t) => window.removeEventListener(t, release));
  };
}
