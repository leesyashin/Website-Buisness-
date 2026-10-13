import { gsap } from 'gsap';

// [data-menue]   Handy-Menü (details/summary, öffnet auch ohne JavaScript).
//                Mit Bewegung: Die dunkle Fläche wächst als Kreis aus dem Knopf, die Wörter steigen gestaffelt
//                aus ihrer Maske, Unterzeilen und Knopf folgen. Schließen spielt dasselbe schnell rückwärts.
//                Immer (auch bei reduzierter Bewegung): Escape schließt, ein Link schließt sofort,
//                Lenis steht still, solange das Menü offen ist.
export function initMenue() {
  const menue = document.querySelector('[data-menue]');
  if (!menue) return;
  const knopf = menue.querySelector('summary');
  const flaeche = menue.querySelector('[data-menue-flaeche]');
  const woerter = flaeche.querySelectorAll('.menue__wort');
  const nebensachen = flaeche.querySelectorAll('.menue__nr, .menue__liste small, .menue__liste li, .menue__fuss');
  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');
  let tl = null;
  let offen = false;

  const kreis = (r) => {
    const k = knopf.getBoundingClientRect();
    return `circle(${r} at ${k.left + k.width / 2}px ${k.top + k.height / 2}px)`;
  };

  const aufraeumen = () => {
    tl?.kill();
    tl = null;
    gsap.set([flaeche, woerter, nebensachen], { clearProps: 'all' });
  };

  const oeffnen = () => {
    offen = true;
    menue.open = true;
    window.lenis?.stop();
    if (ruhig.matches) return;
    aufraeumen();
    tl = gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .fromTo(flaeche, { clipPath: kreis('0%') }, { clipPath: kreis('150%'), duration: 0.8, ease: 'power3.inOut' })
      .from(woerter, { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0.25)
      .from(nebensachen, { opacity: 0, duration: 0.6, stagger: 0.03 }, 0.4);
  };

  const schliessen = (sofort = false) => {
    offen = false;
    window.lenis?.start();
    if (sofort || ruhig.matches || !menue.open) {
      aufraeumen();
      menue.open = false;
      return;
    }
    tl?.kill();
    tl = gsap
      .timeline({ onComplete: () => ((menue.open = false), aufraeumen()) })
      .to(woerter, { yPercent: -110, duration: 0.3, stagger: 0.02, ease: 'power2.in' })
      .to(nebensachen, { opacity: 0, duration: 0.2 }, 0)
      .to(flaeche, { clipPath: kreis('0%'), duration: 0.5, ease: 'power3.inOut' }, 0.12);
  };

  knopf.addEventListener('click', (e) => {
    e.preventDefault();
    offen ? schliessen() : oeffnen();
  });

  // Capture: Das Menü schließt, bevor andere Klick-Handler (z. B. die Wegwahl) scrollen.
  flaeche.addEventListener('click', (e) => e.target.closest('a') && schliessen(true), true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && offen) {
      schliessen();
      knopf.focus();
    }
  });

  // Breiter als Handy: Menü zu, Seite wieder frei
  window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => e.matches && schliessen(true));
}
