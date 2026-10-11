import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Farbwelten (Colorways): Abschnitte mit [data-colorway="name"] färben beim Hereinscrollen die ganze Seite um.
// Die Farben selbst stehen im CSS des Projekts, je Colorway ein Block:
//   html[data-colorway="nacht"], html:not(.colorway-live) [data-colorway="nacht"] { --cw-bg: …; --cw-ink: …; --cw-accent: … }
// Die Variablen sind per @property als <color> registriert (siehe base.css) und gleiten deshalb per CSS-Übergang.
// Ohne JavaScript malt jeder Abschnitt seine eigene Farbe, mit JavaScript wechselt die Seite als Ganzes.
// Andere Skripte (z. B. 3D-Szenen) hören auf das Ereignis „colorway“ auf document.
export function initColorway() {
  const html = document.documentElement;
  const sections = Array.from(document.querySelectorAll('body [data-colorway]'));
  if (!sections.length) return;

  html.classList.add('colorway-live');
  if (!html.dataset.colorway) setColorway(sections[0].dataset.colorway);

  sections.forEach((section) =>
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => self.isActive && setColorway(section.dataset.colorway),
    }),
  );
}

export function setColorway(name) {
  const html = document.documentElement;
  if (html.dataset.colorway === name) return;
  html.dataset.colorway = name;
  document.dispatchEvent(new CustomEvent('colorway', { detail: { name } }));
}
