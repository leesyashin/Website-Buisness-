import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { faecherAuftritt } from './faecher.js';
import { vergleichAuftritt } from './vergleich.js';

// Ereignis „wegwahl“ (lib/wegwahl.js): Der gewählte Weg ist gerade sichtbar geworden. Szenen neu vermessen
// (er war vorher ausgeblendet) und ihn auftreten lassen: Text und Schritte steigen auf, der Fächer fliegt ein
// bzw. die Vorher/Nachher-Naht fährt durch. Die Farbwelt der ganzen Seite gleitet per CSS mit.
export function initWeg() {
  const auftritt = ({ detail: { ziel } }) => {
    ScrollTrigger.refresh();
    gsap.from(ziel.querySelectorAll('.weg-panel__text > *, .ablauf, .weg-panel__preis'), {
      y: 32,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'expo.out',
      stagger: 0.07,
      delay: 0.2,
      clearProps: 'transform,opacity,visibility',
    });
    const faecher = ziel.querySelector('[data-faecher]');
    if (faecher) faecherAuftritt(faecher);
    const vergleich = ziel.querySelector('[data-vergleich]');
    if (vergleich) vergleichAuftritt(vergleich, 0.5);
  };
  document.addEventListener('wegwahl', auftritt);
  return () => document.removeEventListener('wegwahl', auftritt);
}
