import { gsap } from 'gsap';

// [data-faecher]   Weg „Neue Seite“: echte Seiten als 3D-Fächer. Erscheinen, sobald der Weg gewählt wird
//                  (motion/weg.js ruft faecherAuftritt), mit feinem Zeiger fächert er beim Zeigen weiter auf.
//                  Ohne JS und bei reduzierter Bewegung steht der Fächer in der Ruhelage aus site.css.
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

export function initFaecher({ finePointer }) {
  const faecher = document.querySelector('[data-faecher]');
  if (!faecher) return;
  const blaetter = gsap.utils.toArray('.faecher__blatt', faecher);
  const handy = faecher.querySelector('.faecher__handy');
  blaetter.forEach((b, i) => gsap.set(b, { x: 0, y: 0, ...ruhe[i] }));
  if (handy) gsap.set(handy, { rotation: 5 });
  if (!finePointer) return;

  const bereich = faecher.parentElement;
  const zu = (posen, handyPose) => () => {
    blaetter.forEach((b, i) => gsap.to(b, { ...posen[i], duration: 0.9, ease: 'expo.out', overwrite: 'auto' }));
    if (handy) gsap.to(handy, { ...handyPose, duration: 0.9, ease: 'expo.out', overwrite: 'auto' });
  };
  const auf = zu(offen, { yPercent: -10, rotation: 1 });
  const ab = zu(ruhe, { yPercent: 0, rotation: 5 });
  bereich.addEventListener('mouseenter', auf);
  bereich.addEventListener('mouseleave', ab);
  return () => {
    bereich.removeEventListener('mouseenter', auf);
    bereich.removeEventListener('mouseleave', ab);
  };
}

export function faecherAuftritt(faecher) {
  const blaetter = gsap.utils.toArray('.faecher__blatt', faecher);
  const handy = faecher.querySelector('.faecher__handy');
  gsap.from(blaetter, { yPercent: '+=60', rotationY: 0, rotation: 0, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.3 });
  if (handy) gsap.from(handy, { yPercent: 40, rotation: 14, autoAlpha: 0, duration: 1.1, ease: 'expo.out', delay: 0.6 });
}
