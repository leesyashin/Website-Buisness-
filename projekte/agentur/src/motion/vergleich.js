import { gsap } from 'gsap';

// [data-vergleich]   Vorher/Nachher: das alte Bild liegt über dem neuen, die Naht steht bei --pos.
//                    Ein unsichtbarer Regler (input[type=range]) darüber macht es mit Maus, Finger und Tastatur bedienbar.
//                    Die Bedienung läuft immer (auch bei reduzierter Bewegung), der Auftritt nur mit Bewegung.
// [data-vergleich-gefuehrt]  wird von einer Szene gesteuert (motion/szene.js), kein eigener Auftritt.
export function setzePos(el, wert) {
  el.style.setProperty('--pos', `${wert}%`);
  el.classList.toggle('ist-am-rand', wert <= 1 || wert >= 99);
  const regler = el.querySelector('.vergleich__regler');
  if (regler) regler.value = Math.round(wert);
}

export function initVergleich() {
  document.querySelectorAll('[data-vergleich]').forEach((el) => {
    const regler = el.querySelector('.vergleich__regler');
    regler?.addEventListener('input', () => {
      gsap.killTweensOf(el);
      setzePos(el, Number(regler.value));
    });
  });
}

// Auftritt: Die Naht fährt einmal von „ganz alt“ zur Mitte, sobald der Vergleich ins Bild kommt.
export function initVergleichAuftritt() {
  document.querySelectorAll('[data-vergleich]:not([data-vergleich-gefuehrt])').forEach((el) => {
    const stand = { pos: 100 };
    setzePos(el, 100);
    gsap.to(stand, {
      pos: 50,
      duration: 1.8,
      delay: 0.6,
      ease: 'signature',
      onUpdate: () => setzePos(el, stand.pos),
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}
