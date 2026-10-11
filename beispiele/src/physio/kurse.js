import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Kursplan: ohne JavaScript steht die ganze Woche nebeneinander. Mit JavaScript zeigt der Plan einen Tag,
// die Tagesknöpfe wechseln ihn (Start: heute, am Wochenende Montag).
export function initKurse(root, { reduced }) {
  const nav = root.querySelector('[data-days]');
  const days = Array.from(root.querySelectorAll('[data-week] [data-day]'));
  if (!nav || !days.length) return;
  const buttons = Array.from(nav.querySelectorAll('button'));

  const show = (day, animate = true) => {
    days.forEach((d) => (d.hidden = d.dataset.day !== day));
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.day === day)));
    const current = days.find((d) => d.dataset.day === day);
    if (animate && !reduced) gsap.from(current.querySelectorAll('li'), { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: 'expo.out' });
    // Höhe ändert sich: Scroll-Szenen weiter unten neu vermessen
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  root.classList.add('is-filtered');
  nav.hidden = false;
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-day]');
    if (b) show(b.dataset.day);
  });

  const today = new Date().getDay();
  show(String(today >= 1 && today <= 5 ? today : 1), false);
}
