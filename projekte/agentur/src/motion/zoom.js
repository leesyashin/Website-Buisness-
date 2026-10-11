import { gsap } from 'gsap';
import { ease } from './config.js';

// [data-zoom]          Bild in einem Rahmen (overflow: hidden) startet leicht vergrößert und zoomt beim Scrollen
//                      auf Normalgröße zurück – wie eine Kamera, die langsam aufzieht. Gut für große Projekt- und Hero-Bilder.
// [data-zoom="1.2"]    Startgröße (Standard 1.12)
export function initZoom() {
  gsap.utils.toArray('[data-zoom]').forEach((el) => {
    const from = parseFloat(el.dataset.zoom) || 1.12;
    gsap.fromTo(
      el,
      { scale: from },
      {
        scale: 1,
        ease: ease.none,
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}
