import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// [data-galerie] + [data-galerie-spur]   Referenzen: Die Galerie wird angeheftet, senkrechtes Scrollen fährt die Spur
//   seitwärts. Verlässt eine Karte das Bild nach links, scrollt ihre lange Ansicht durch den Rahmen, so sieht man
//   mehr als nur den Anfang. Nur Desktop mit Bewegung; sonst ist die Galerie eine native Wischleiste (scroll-snap).
export function initGalerie() {
  const galerie = document.querySelector('[data-galerie]');
  const spur = galerie?.querySelector('[data-galerie-spur]');
  if (!spur) return;

  galerie.classList.add('ist-gefuehrt');
  const distanz = () => Math.max(0, spur.scrollWidth - document.documentElement.clientWidth);

  const fahrt = gsap.to(spur, {
    x: () => -distanz(),
    ease: 'none',
    scrollTrigger: {
      trigger: galerie,
      start: 'center 52%',
      end: () => `+=${distanz()}`,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  spur.querySelectorAll('.ref-karte').forEach((karte) => {
    const rahmen = karte.querySelector('.ref-karte__rahmen');
    const bild = rahmen.querySelector('img');
    gsap.to(bild, {
      y: () => -Math.max(0, bild.offsetHeight - rahmen.offsetHeight),
      ease: 'none',
      scrollTrigger: {
        trigger: karte,
        containerAnimation: fahrt,
        start: 'left left',
        end: 'right left',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    // Lange Bilder laden träge; danach Wege neu vermessen
    if (!bild.complete) bild.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });

  return () => galerie.classList.remove('ist-gefuehrt');
}
