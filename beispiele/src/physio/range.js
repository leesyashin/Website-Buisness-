import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Bewegungsfigur: Die Strichfigur hebt den Arm seitlich an, gekoppelt an den Scrollweg. Der Abschnitt wird
// angeheftet und hält an drei Stellen (Woche 1 · 4 · 8 = 60° · 120° · 170°), dort rastet die Seite ein (data-snap-steps="2").
// Nur Desktop mit Bewegung. Sonst (Handy, reduzierte Bewegung, ohne JS) zeigt die Figur alle drei Stellungen auf einmal.
//
// HTML: [data-range] mit [data-range-arm] (Arm, CSS-Variable --a = Drehwinkel), [data-range-arc] (Bogen),
//       [data-range-deg] (Gradzahl am Arm), [data-range-step] (Texte je Woche)
const R = 200; // Abstand der Gradzahl vom Schultergelenk (SVG-Einheiten), knapp außerhalb der Hand
const SHOULDER = [250, 142];
const MAX = 170;

// Scrollfortschritt der Anheftung → Winkel: halten, heben, halten, heben, halten
const STOPS = [
  [0, 60],
  [0.12, 60],
  [0.4, 120],
  [0.6, 120],
  [0.88, 170],
  [1, 170],
];
const angleAt = (p) => {
  const i = STOPS.findIndex(([q]) => q >= p);
  if (i <= 0) return STOPS[0][1];
  const [p0, a0] = STOPS[i - 1];
  const [p1, a1] = STOPS[i];
  return a0 + (a1 - a0) * gsap.parseEase('power1.inOut')((p - p0) / (p1 - p0));
};

export function initRange(section) {
  const arm = section.querySelector('[data-range-arm]');
  const arc = section.querySelector('[data-range-arc]');
  const deg = section.querySelector('[data-range-deg]');
  const steps = Array.from(section.querySelectorAll('[data-range-step]'));
  if (!arm || !arc || !deg) return;

  const set = (a) => {
    arm.style.setProperty('--a', `${-a}deg`);
    gsap.set(arc, { drawSVG: `0% ${(a / MAX) * 100}%` });
    const rad = (a * Math.PI) / 180;
    deg.setAttribute('transform', `translate(${SHOULDER[0] + Math.sin(rad) * R} ${SHOULDER[1] + Math.cos(rad) * R})`);
    deg.textContent = `${Math.round(a)}°`;
    const active = a < 90 ? 0 : a < 150 ? 1 : 2;
    steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
  };

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-live');
    set(0);
    // Hereinscrollen: Arm hebt sich von 0° auf 60°
    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      end: 'top top',
      scrub: true,
      onUpdate: (self) => set(60 * gsap.parseEase('power2.out')(self.progress)),
    });
    // Angeheftet: Woche 1 → 4 → 8
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => set(angleAt(self.progress)),
    });
    // Anheftung entsteht nach den Auslösern des Starters: in Seitenreihenfolge bringen
    ScrollTrigger.sort();
    return () => {
      section.classList.remove('is-live');
      arm.style.removeProperty('--a');
      gsap.set(arc, { clearProps: 'all' });
      steps.forEach((s) => s.classList.remove('is-active'));
    };
  });
}
