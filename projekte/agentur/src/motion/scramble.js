import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { enter } from './config.js';

// [data-scramble]           Text entschlüsselt sich beim Hereinscrollen (Zeichen flackern, dann steht das Wort)
// [data-scramble="hover"]   zusätzlich bei jedem Hover erneut
// Gut für technische Labels, Koordinaten, Kennzahlen – nicht für Fließtext.
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/–·';

export function initScramble() {
  gsap.utils.toArray('[data-scramble]').forEach((el) => {
    const text = el.textContent;
    const play = () =>
      gsap.to(el, {
        duration: Math.min(1.4, 0.4 + text.length * 0.03),
        scrambleText: { text, chars, revealDelay: 0.15, speed: 0.6 },
        ease: 'none',
        overwrite: true,
      });
    ScrollTrigger.create({ trigger: el, start: enter, once: true, onEnter: play });
    if (el.dataset.scramble === 'hover') el.addEventListener('pointerenter', play);
  });
}
