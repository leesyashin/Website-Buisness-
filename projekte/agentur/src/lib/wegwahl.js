import { media } from '../motion/config.js';

// Wegwahl der Startseite: „Ich brauche eine neue Seite“ / „Ich habe schon eine Seite“.
// Die Anzeige läuft rein über CSS (:has auf den Radio-Knöpfen, siehe site.css), damit sie ohne JavaScript geht.
// Hier: Adresse #neu / #renovieren merken und beim Laden auswerten, zum gewählten Weg springen und das Ereignis
// „wegwahl“ melden (motion/weg.js lässt den Weg darauf erscheinen).
const WEGE = ['neu', 'renovieren'];

function springeZu(ziel) {
  const ruhig = !matchMedia(media.motion).matches;
  requestAnimationFrame(() => {
    if (window.lenis && !ruhig) {
      const kopf = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) * 16 || 72;
      window.lenis.resize();
      window.lenis.scrollTo(ziel, { offset: -kopf, duration: 1.2 });
    } else {
      ziel.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    }
  });
}

export function initWegwahl() {
  const knoepfe = document.querySelectorAll('.wahl__eingabe');
  if (!knoepfe.length) return;

  function waehle(weg, { springen = true } = {}) {
    const knopf = document.getElementById(`wahl-${weg}`);
    const ziel = document.getElementById(weg);
    if (!knopf || !ziel) return;
    knopf.checked = true;
    history.replaceState(null, '', `#${weg}`);
    document.dispatchEvent(new CustomEvent('wegwahl', { detail: { weg, ziel } }));
    if (springen) springeZu(ziel);
  }

  knoepfe.forEach((k) => k.addEventListener('change', () => waehle(k.value)));

  // Links auf dieselbe Seite (Kopfzeile, Abschluss) wählen den Weg, statt nur zu springen
  document.querySelectorAll('[data-wahl-link]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      waehle(a.dataset.wahlLink);
    }),
  );

  const start = location.hash.slice(1);
  if (WEGE.includes(start)) waehle(start);
}
