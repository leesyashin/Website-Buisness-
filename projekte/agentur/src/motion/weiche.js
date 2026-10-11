import { gsap } from 'gsap';

// [data-weiche]   Startseite: die zwei Wege. Auftritt beim Laden: Flächen öffnen sich von unten, Texte folgen,
//                 die echten Seiten im Fächer [data-faecher] fliegen nacheinander auf ihre Plätze.
//                 Mit feinem Zeiger fächert sich der Stapel beim Zeigen auf „Neu bauen“ weiter auf.
//                 Ohne JS und bei reduzierter Bewegung steht der Fächer in der Ruhelage aus site.css.
const ruhe = [
  { xPercent: -88, yPercent: -6, rotationY: 24, rotation: -3, scale: 1 },
  { xPercent: -14, yPercent: -10, rotationY: -24, rotation: 3, scale: 1 },
  { xPercent: -50, yPercent: 6, rotationY: 0, rotation: 0, scale: 1 },
];
const offen = [
  { xPercent: -106, yPercent: -12, rotationY: 32, rotation: -6, scale: 1 },
  { xPercent: 4, yPercent: -16, rotationY: -32, rotation: 6, scale: 1 },
  { xPercent: -50, yPercent: -2, rotationY: 0, rotation: 0, scale: 1.04 },
];

export function initWeiche({ finePointer }) {
  const weiche = document.querySelector('[data-weiche]');
  if (!weiche) return;
  const wege = weiche.querySelectorAll('.weg');
  const blaetter = gsap.utils.toArray('.faecher__blatt', weiche);
  const handy = weiche.querySelector('.faecher__handy');

  // Ruhelage in GSAP übernehmen (ersetzt die CSS-Transformation), dann von unten hereinfliegen lassen
  blaetter.forEach((b, i) => gsap.set(b, { x: 0, y: 0, ...ruhe[i] }));
  if (handy) gsap.set(handy, { rotation: 5 });

  const tl = gsap.timeline({ delay: 0.25 });
  tl.from(wege, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.1, ease: 'signature', stagger: 0.12 })
    .from(weiche.querySelectorAll('.weg__text > *'), { y: 24, autoAlpha: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, '-=0.55')
    .from(blaetter, { yPercent: '+=60', rotationY: 0, rotation: 0, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12 }, '-=0.9');
  if (handy) tl.from(handy, { yPercent: 40, rotation: 14, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, '-=0.8');

  if (!finePointer) return () => tl.kill();

  const neu = weiche.querySelector('.weg--neu');
  const zu = (posen, handyPose) => () => {
    blaetter.forEach((b, i) => gsap.to(b, { ...posen[i], duration: 0.9, ease: 'expo.out', overwrite: 'auto' }));
    if (handy) gsap.to(handy, { ...handyPose, duration: 0.9, ease: 'expo.out', overwrite: 'auto' });
  };
  const auf = zu(offen, { yPercent: -10, rotation: 1 });
  const ab = zu(ruhe, { yPercent: 0, rotation: 5 });
  neu.addEventListener('mouseenter', auf);
  neu.addEventListener('mouseleave', ab);
  return () => {
    tl.kill();
    neu.removeEventListener('mouseenter', auf);
    neu.removeEventListener('mouseleave', ab);
  };
}
