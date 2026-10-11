import { ScrollTrigger } from 'gsap/ScrollTrigger';

// [data-highlight]   Wort oder Satzteil bekommt beim Hereinscrollen eine Markierung, die von links hineinwischt.
// Farbe über --cw-accent bzw. --c-accent. Ohne JavaScript ist die Markierung einfach da (base.css).
export function initHighlight() {
  document.querySelectorAll('[data-highlight]').forEach((el) =>
    ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => el.classList.add('is-on') }),
  );
}
