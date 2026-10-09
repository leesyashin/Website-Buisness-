import { gsap } from 'gsap';
import { enter } from './config.js';

// [data-count-to="250"]   Zahl zählt beim Hereinscrollen hoch. Der Endwert steht bereits im HTML,
//                         ohne JavaScript oder bei reduzierter Bewegung bleibt er einfach stehen.
// [data-count-decimals="1"] Nachkommastellen
export function initCounter() {
  const fmt = (n, d) =>
    n.toLocaleString(document.documentElement.lang || 'de', {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });

  gsap.utils.toArray('[data-count-to]').forEach((el) => {
    const end = parseFloat(el.dataset.countTo);
    const decimals = parseInt(el.dataset.countDecimals || '0', 10);
    const state = { v: 0 };
    el.textContent = fmt(0, decimals);
    gsap.to(state, {
      v: end,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: enter, once: true },
      onUpdate: () => (el.textContent = fmt(state.v, decimals)),
    });
  });
}
