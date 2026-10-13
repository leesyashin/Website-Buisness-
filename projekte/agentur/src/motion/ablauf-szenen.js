import { gsap } from 'gsap';

// Mini-Szenen des Ablaufs ([data-szene] in .ablauf__schritt). Jede Szene ist eine angehaltene Zeitleiste aus
// from()-Schritten: Der Ruhezustand im HTML/CSS ist das Endbild, die Animation führt nur dorthin.
// ablauf.js spielt sie einmal ab, sobald der Läufer den Schritt erreicht.
const SZENEN = {
  fragebogen(tl, q) {
    tl.from(q('fuellung'), { scaleX: 0, duration: 0.9, ease: 'power2.out' })
      .from(q('zeiger'), { x: 70, y: 40, opacity: 0, duration: 0.7, ease: 'power3.out' }, 0.15)
      .to(q('zeiger'), { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
      .from(q('wahl'), { opacity: 0, scale: 0.6, duration: 0.45, ease: 'back.out(2.2)' }, '<');
  },
  gespraech(tl, q) {
    const [frage, antwort] = q('blase');
    tl.from(frage, { opacity: 0, scale: 0.6, y: 12, transformOrigin: '0% 100%', duration: 0.5, ease: 'back.out(1.7)' })
      .from(antwort, { opacity: 0, scale: 0.6, y: 12, transformOrigin: '100% 100%', duration: 0.5, ease: 'back.out(1.7)' }, '+=0.25')
      .from(q('marke'), { opacity: 0, scale: 1.6, rotation: -14, duration: 0.45, ease: 'back.out(2)' }, '+=0.2');
  },
  entwurf(tl, q) {
    tl.from(q('teil'), { opacity: 0, scaleY: 0.3, transformOrigin: '50% 0%', duration: 0.5, stagger: 0.1, ease: 'power3.out' })
      .from(q('knopf'), { opacity: 0, scale: 0.4, duration: 0.35, ease: 'back.out(2.4)' }, '-=0.15')
      .from(q('zeiger'), { x: 60, y: 30, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.1')
      .to([q('zeiger'), q('knopf')], { scale: 0.85, duration: 0.1, yoyo: true, repeat: 1 });
  },
  start(tl, q, el) {
    tl.from(q('tippen'), { clipPath: 'inset(0 100% 0 0)', duration: 0.8, ease: 'steps(13)' })
      .from(q('online'), { opacity: 0, x: -10, duration: 0.4, ease: 'power2.out' })
      .from(el.querySelectorAll('.sz__saeulen i'), { scaleY: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, '-=0.2');
  },
  pruefen(tl, q) {
    tl.from(q('tippen'), { clipPath: 'inset(0 100% 0 0)', duration: 0.8, ease: 'steps(13)' })
      .from(q('wert'), { scaleX: 0, duration: 1, stagger: 0.15, ease: 'power2.out' }, '+=0.1');
  },
  renovierung(tl, q, el) {
    tl.from(q('neu'), { clipPath: 'inset(0 0 0 100%)', duration: 1.2, ease: 'power3.inOut' }).from(
      q('naht'),
      { x: () => el.clientWidth * 0.55, duration: 1.2, ease: 'power3.inOut' },
      0,
    );
  },
  pflege(tl, q) {
    tl.from(q('kreis'), { rotation: -360, transformOrigin: '50% 50%', duration: 1.3, ease: 'power2.inOut' }).from(
      q('haken'),
      { scale: 0, duration: 0.35, stagger: 0.22, ease: 'back.out(2.6)' },
      0.25,
    );
  },
};

export function szeneZeitleiste(el) {
  const bauen = SZENEN[el.dataset.szene];
  if (!bauen) return null;
  const tl = gsap.timeline({ paused: true });
  const q = (name) => {
    const treffer = el.querySelectorAll(`[data-sz="${name}"]`);
    return treffer.length === 1 ? treffer[0] : Array.from(treffer);
  };
  bauen(tl, q, el);
  return tl;
}
