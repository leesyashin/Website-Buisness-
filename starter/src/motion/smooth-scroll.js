import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Weiches Scrollen, an den GSAP-Takt gekoppelt: ScrollTrigger und Lenis rechnen im selben Frame,
// Szenen mit scrub hängen deshalb nicht nach. Gibt eine Aufräumfunktion zurück.
export function initSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  const raf = (t) => lenis.raf(t * 1000);

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  // Sprunglinks (#kontakt) gleiten statt zu springen; Fokus geht danach ans Ziel (Tastatur, Screenreader)
  const onClick = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, {
      offset: -headerOffset(),
      onComplete: () => target.focus({ preventScroll: true }),
    });
    history.pushState(null, '', a.getAttribute('href'));
  };
  document.addEventListener('click', onClick);

  // Elemente mit [data-lenis-prevent] (Modals, Code-Blöcke) scrollen nativ
  window.lenis = lenis;

  return () => {
    document.removeEventListener('click', onClick);
    gsap.ticker.remove(raf);
    lenis.destroy();
    delete window.lenis;
  };
}

const headerOffset = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
