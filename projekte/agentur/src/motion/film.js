import { gsap } from 'gsap';

// [data-film]   Startseite: „So läuft es ab“ in drei Bildern, läuft beim Laden einmal durch (etwa 5 Sekunden).
//   1 Zeiger tippt „Neue Seite“ an, der Knopf füllt sich   2 Fortschritt läuft, drei Haken erscheinen
//   3 Angebot mit Stempel. Das jeweils aktive Bild ist hell, die anderen treten zurück; am Ende stehen alle.
// Ruhezustand im HTML/CSS ist das Endbild: ohne Bewegung ist alles sofort vollständig.
export function initFilm() {
  const film = document.querySelector('[data-film]');
  if (!film) return;
  const q = (s) => film.querySelector(s);
  const bilder = gsap.utils.toArray('.film__bild', film);
  const pille = q('[data-film-pille]');
  const aktiv = (i) => () => bilder.forEach((b, j) => gsap.to(b, { opacity: i === j || i < 0 ? 1 : 0.4, duration: 0.4 }));

  pille.classList.remove('ist-an');
  const tl = gsap.timeline({ delay: 0.8, defaults: { ease: 'expo.out' } });
  tl.from(bilder, { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.1 })
    .call(aktiv(0))
    .from(q('[data-film-zeiger]'), { x: '5em', y: '3em', autoAlpha: 0, duration: 0.8 })
    .from(q('[data-film-fuellung]'), { scaleX: 0, duration: 0.5, ease: 'power2.inOut' })
    .call(() => pille.classList.add('ist-an'))
    .call(aktiv(1), null, '+=0.3')
    .from(q('[data-film-balken]'), { scaleX: 0, duration: 1.1, ease: 'none' })
    .from(film.querySelectorAll('[data-film-haken]'), { scale: 0, duration: 0.4, ease: 'back.out(2.5)', stagger: 0.32 }, '<0.1')
    .call(aktiv(2), null, '+=0.3')
    .from(q('[data-film-stempel]'), { scale: 1.8, autoAlpha: 0, duration: 0.5, ease: 'back.out(2)' }, '+=0.2')
    .call(aktiv(-1), null, '+=0.5');

  return () => {
    tl.kill();
    pille.classList.add('ist-an');
  };
}
