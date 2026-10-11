import { gsap } from 'gsap';
import { setzePos } from './vergleich.js';

// [data-vn]   Renovieren: Vorher/Nachher als angeheftete Scroll-Szene (nur Desktop mit Bewegung).
//   1 Klarer erster Eindruck: die Naht fährt über die alte Seite, die neue kommt zum Vorschein
//   2 Gebaut fürs Handy: beide Seiten als Handy-Ansicht nebeneinander
//   3 Schnell geladen: die neue Seite steht wieder, ein Ladebalken läuft einmal durch
//   4 Ein Weg zur Anfrage: ein Ring legt sich um „Termin anfragen“
//   Die Schritte rechts leuchten passend auf. Sonst: Regler zum Ziehen, Handys und Liste untereinander.
export function initSzene() {
  const szene = document.querySelector('[data-vn]');
  if (!szene) return;
  const innen = szene.querySelector('[data-vn-innen]');
  const vergleich = szene.querySelector('[data-vn-vergleich]');
  const handys = szene.querySelector('[data-vn-handys]');
  const lade = szene.querySelector('[data-vn-lade]');
  const ring = szene.querySelector('[data-vn-ring]');
  const schritte = Array.from(szene.querySelectorAll('[data-vn-schritt]'));

  szene.classList.add('ist-gefuehrt');
  vergleich.setAttribute('data-vergleich-gefuehrt', '');
  const naht = { pos: 100 };
  setzePos(vergleich, 100);
  gsap.set(handys, { autoAlpha: 0, y: 40 });
  gsap.set(lade, { scaleX: 0, autoAlpha: 1 });
  gsap.set(ring, { autoAlpha: 0, scale: 1.25 });

  const marken = [0, 0.27, 0.52, 0.78];
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: innen,
      start: 'center center',
      end: '+=260%',
      pin: true,
      scrub: 0.8,
      onUpdate: ({ progress }) => {
        const aktiv = marken.reduce((a, m, i) => (progress >= m ? i : a), 0);
        schritte.forEach((li, i) => li.classList.toggle('is-an', i === aktiv));
      },
    },
  });

  tl.to(naht, { pos: 0, duration: 1, ease: 'none', onUpdate: () => setzePos(vergleich, naht.pos) })
    .to({}, { duration: 0.2 })
    .to(vergleich, { autoAlpha: 0, y: -20, duration: 0.4 })
    .to(handys, { autoAlpha: 1, y: 0, duration: 0.4 }, '<0.1')
    .to({}, { duration: 0.4 })
    .to(handys, { autoAlpha: 0, y: 30, duration: 0.4 })
    .to(vergleich, { autoAlpha: 1, y: 0, duration: 0.4 }, '<0.1')
    .to(lade, { scaleX: 1, duration: 0.5, ease: 'power1.in' })
    .to(lade, { autoAlpha: 0, duration: 0.15 })
    .to(ring, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' })
    .to({}, { duration: 0.4 });

  schritte[0].classList.add('is-an');
  return () => {
    szene.classList.remove('ist-gefuehrt');
    vergleich.removeAttribute('data-vergleich-gefuehrt');
    schritte.forEach((li) => li.classList.remove('is-an'));
  };
}
