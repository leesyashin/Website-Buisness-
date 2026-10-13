import { gsap } from 'gsap';
import { szeneZeitleiste } from './ablauf-szenen.js';

// [data-ablauf]   Ablauf als S-Kurve. initAblaufKurve() zeichnet die Linie immer (auch bei reduzierter Bewegung):
//                 Handy: Die Spur wechselt von Schritt zu Schritt die Seite, dazwischen schwingt sie als S hinüber.
//                 Desktop: Eine Welle verbindet die versetzten Spalten. Ohne JavaScript bleibt eine gerade Linie (CSS).
//                 initAblauf() (nur mit Bewegung): Die Linie zeichnet sich mit dem Scrollen, ein Läufer wandert mit,
//                 jeder erreichte Schritt leuchtet auf und spielt einmal seine Mini-Szene (ablauf-szenen.js).
const NS = 'http://www.w3.org/2000/svg';
const MITTE = 12; // Mitte der Spur in px, passend zu --spur: 1.5rem in site.css
const breit = window.matchMedia('(min-width: 900px)');

export function initAblaufKurve() {
  document.querySelectorAll('[data-ablauf]').forEach((box) => {
    const bahn = box.querySelector('.ablauf__bahn');
    const schritte = Array.from(box.querySelectorAll('[data-ablauf-schritt]'));
    if (!bahn || schritte.length < 2) return;

    const svg = document.createElementNS(NS, 'svg');
    svg.classList.add('ablauf__kurve');
    svg.setAttribute('aria-hidden', 'true');
    const pfad = (klasse) => {
      const p = document.createElementNS(NS, 'path');
      p.classList.add(klasse);
      return p;
    };
    const spur = pfad('ablauf__spur');
    const strich = pfad('ablauf__strich');
    const punkte = document.createElementNS(NS, 'g');
    svg.append(spur, strich, punkte);
    const laeufer = document.createElement('span');
    laeufer.className = 'ablauf__laeufer';
    laeufer.setAttribute('aria-hidden', 'true');
    bahn.prepend(svg, laeufer);
    box.classList.add('ist-kurve');

    const k = { bahn, schritte, svg, spur, strich, punkte, laeufer, laenge: 0, anteile: [], fortschritt: 1, beimErreichen: null };
    k.setze = (p) => setze(k, p);
    box._kurve = k;
    const bauen = () => kurveBauen(k);
    new ResizeObserver(bauen).observe(bahn);
    breit.addEventListener('change', bauen);
    bauen();
  });
}

function kurveBauen(k) {
  const r = k.bahn.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const lage = (el) => {
    const b = el.getBoundingClientRect();
    return { l: b.left - r.left, r: b.right - r.left, t: b.top - r.top, b: b.bottom - r.top, h: b.height };
  };
  const stuecke = []; // Pfad bis zum jeweiligen Punkt, zum Messen der Anteile
  const punkte = [];
  let d = '';

  if (breit.matches) {
    // Welle: durch einen Punkt über der Mitte jeder Spalte, waagerechte Tangenten. Die Spalten sind versetzt
    // (site.css), die Welle bleibt dabei über den Karten.
    k.schritte.forEach((li, i) => {
      const p = lage(li);
      const x = (p.l + p.r) / 2;
      const y = p.t + MITTE;
      if (i === 0) d = `M${p.l},${y} L${x},${y}`;
      else {
        const v = punkte[i - 1];
        const dx = (x - v.x) / 2;
        d += ` C${v.x + dx},${v.y} ${x - dx},${y} ${x},${y}`;
      }
      punkte.push({ x, y });
      stuecke.push(d);
    });
    d += ` L${lage(k.schritte.at(-1)).r},${punkte.at(-1).y}`;
  } else {
    // S: an der Spur entlang nach unten, im Zwischenraum zur anderen Seite hinüber
    k.schritte.forEach((li, i) => {
      const p = lage(li);
      const szene = li.querySelector('.sz');
      const s = szene ? lage(szene) : p;
      const x = i % 2 === 0 ? p.l + MITTE : p.r - MITTE;
      const y = s.t + s.h / 2;
      if (i === 0) d = `M${x},${p.t}`;
      else {
        const v = lage(k.schritte[i - 1]);
        const vx = punkte[i - 1].x;
        const g = p.t - v.b;
        d += ` L${vx},${v.b} C${vx},${v.b + g * 0.95} ${x},${p.t - g * 0.95} ${x},${p.t}`;
      }
      d += ` L${x},${y}`;
      punkte.push({ x, y });
      stuecke.push(d);
    });
    const letzter = lage(k.schritte.at(-1));
    d += ` L${punkte.at(-1).x},${letzter.b}`;
  }

  k.svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
  k.anteile = stuecke.map((teil) => {
    k.spur.setAttribute('d', teil);
    return k.spur.getTotalLength();
  });
  k.spur.setAttribute('d', d);
  k.strich.setAttribute('d', d);
  k.laenge = k.spur.getTotalLength();
  k.anteile = k.anteile.map((l) => l / k.laenge);
  k.strich.style.strokeDasharray = `${k.laenge} ${k.laenge}`;

  k.punkte.replaceChildren(
    ...punkte.map(({ x, y }) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x);
      c.setAttribute('cy', y);
      c.setAttribute('r', 6);
      c.classList.add('ablauf__punkt');
      return c;
    }),
  );
  setze(k, k.fortschritt);
}

function setze(k, p) {
  k.fortschritt = p;
  if (!k.laenge) return;
  k.strich.style.strokeDashoffset = k.laenge * (1 - p);
  const pt = k.spur.getPointAtLength(k.laenge * p);
  k.laeufer.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
  const kreise = k.punkte.children;
  k.anteile.forEach((a, i) => {
    const an = p >= a - 0.005;
    kreise[i]?.classList.toggle('is-an', an);
    k.schritte[i].classList.toggle('is-an', an);
    if (an) k.beimErreichen?.(i);
  });
}

export function initAblauf() {
  const aufraeumen = [];
  document.querySelectorAll('[data-ablauf]').forEach((box) => {
    const k = box._kurve;
    if (!k) return;
    const szenen = k.schritte.map((li) => {
      const el = li.querySelector('[data-szene]');
      return el ? szeneZeitleiste(el) : null;
    });
    k.beimErreichen = (i) => szenen[i] && !szenen[i].isActive() && szenen[i].progress() === 0 && szenen[i].play();
    const stand = { p: 0 };
    setze(k, 0);
    const tw = gsap.to(stand, {
      p: 1,
      ease: 'none',
      onUpdate: () => setze(k, stand.p),
      scrollTrigger: {
        trigger: k.bahn,
        start: breit.matches ? 'top 75%' : 'top 65%',
        end: breit.matches ? 'bottom 70%' : 'bottom 60%',
        scrub: 0.8,
      },
    });
    aufraeumen.push(() => {
      tw.scrollTrigger?.kill();
      tw.kill();
      szenen.forEach((s) => s?.progress(1).kill());
      k.beimErreichen = null;
      setze(k, 1);
    });
  });
  return () => aufraeumen.forEach((f) => f());
}
