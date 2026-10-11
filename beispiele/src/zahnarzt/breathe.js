import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Atemübung für Angstpatienten: Kreis wird beim Einatmen größer (4 s), beim Ausatmen kleiner (6 s).
// Startet nur auf Knopfdruck und endet nach einer Minute: keine Dauerbewegung, die man nicht anhalten kann (WCAG 2.2.2).
// Bei reduzierter Bewegung bleibt der Kreis stehen, nur Anweisung und Sekunden wechseln.
//
// HTML: [data-breathe] > [data-breathe-core] (Kreis), [data-breathe-label], [data-breathe-start] (Knopf, ohne JS versteckt)
const IN = 4;
const OUT = 6;
const ROUNDS = 6;
const SMALL = 0.62;

export function initBreathe(root, { reduced }) {
  const core = root.querySelector('[data-breathe-core]');
  const label = root.querySelector('[data-breathe-label]');
  const button = root.querySelector('[data-breathe-start]');
  if (!core || !label || !button) return;
  const idleLabel = label.innerHTML;
  const idleButton = button.textContent;
  button.hidden = false;
  let tl = null;

  const say = (word, seconds) => (label.innerHTML = `${word}<br /><b>${seconds}</b>`);
  const phase = (word, duration, scale) => ({
    ...(reduced ? {} : { scale }),
    duration,
    ease: 'sine.inOut',
    onStart: () => say(word, duration),
    onUpdate() {
      say(word, Math.max(1, Math.ceil(duration * (1 - this.progress()))));
    },
  });

  const stop = (finished) => {
    tl?.kill();
    tl = null;
    root.classList.remove('is-running');
    button.textContent = idleButton;
    label.innerHTML = finished ? 'Gut gemacht.' : idleLabel;
    gsap.to(core, { scale: SMALL, duration: reduced ? 0 : 1.2, ease: 'expo.out' });
  };

  const start = () => {
    root.classList.add('is-running');
    button.textContent = 'Anhalten';
    tl = gsap.timeline({ repeat: ROUNDS - 1, onComplete: () => stop(true) });
    tl.to(core, phase('Einatmen', IN, 1)).to(core, phase('Ausatmen', OUT, SMALL));
  };

  button.addEventListener('click', () => (tl ? stop(false) : start()));
  // Wer weiterscrollt, will nicht mehr mitatmen
  ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onToggle: (self) => !self.isActive && tl && stop(false) });
}
