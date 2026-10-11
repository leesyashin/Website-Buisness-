import { gsap } from 'gsap';

// [data-ablauf]   Ablauf: Die Linie füllt sich mit dem Scrollen, jeder Schritt leuchtet auf, sobald sie ihn erreicht.
//                 Desktop waagerecht (scaleX), Handy senkrecht (scaleY). Ohne Bewegung stehen alle Schritte voll da.
export function initAblauf({ desktop }) {
  const box = document.querySelector('[data-ablauf]');
  const linie = box?.querySelector('[data-ablauf-linie]');
  if (!linie) return;
  const schritte = Array.from(box.querySelectorAll('[data-ablauf-schritt]'));
  const achse = desktop ? 'scaleX' : 'scaleY';
  const n = schritte.length;

  gsap.fromTo(
    linie,
    { [achse]: 0 },
    {
      [achse]: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: box.querySelector('.ablauf__bahn'),
        start: desktop ? 'top 75%' : 'top 70%',
        end: desktop ? 'bottom 50%' : 'bottom 60%',
        scrub: 0.6,
        onUpdate: ({ progress }) =>
          schritte.forEach((li, i) => li.classList.toggle('is-an', progress > 0.01 && progress >= (i / (n - 1)) * 0.94)),
      },
    },
  );
}
