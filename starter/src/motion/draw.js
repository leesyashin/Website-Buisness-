import { gsap } from 'gsap';
import { ease, enter } from './config.js';

// [data-draw]          Linien einer SVG zeichnen sich beim Hereinscrollen (Pfade, Linien, Rechtecke, Kreise)
// [data-draw="scrub"]  an den Scrollweg gekoppelt – die Zeichnung entsteht, während man scrollt
// Gezeichnet werden nur Elemente mit Kontur (stroke). Reihenfolge = Reihenfolge im SVG.
export function initDraw() {
  gsap.utils.toArray('[data-draw]').forEach((svg) => {
    const parts = svg.querySelectorAll('path, line, polyline, polygon, rect, circle, ellipse');
    if (!parts.length) return;
    const scrub = svg.dataset.draw === 'scrub';
    gsap.fromTo(
      parts,
      { drawSVG: '0%' },
      {
        drawSVG: '100%',
        duration: 1.6,
        ease: scrub ? 'none' : ease.inOut,
        stagger: scrub ? 0.2 : 0.06,
        scrollTrigger: scrub
          ? { trigger: svg, start: 'top 80%', end: 'bottom 40%', scrub: true }
          : { trigger: svg, start: enter, once: true },
      },
    );
  });
}
