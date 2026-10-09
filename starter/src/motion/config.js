// Gemeinsame Bewegungssprache. Dieselben Werte stehen als CSS-Variablen in tokens.css,
// damit CSS-Übergänge (Hover, Fokus) und GSAP-Szenen gleich „klingen“.
export const ease = {
  out: 'expo.out', //      ≈ cubic-bezier(0.22, 1, 0.36, 1): Ankommen, Einblenden
  inOut: 'power3.inOut', // ≈ cubic-bezier(0.65, 0, 0.35, 1): Wechsel zwischen Zuständen
  none: 'none', //         scroll-gekoppelte Szenen (scrub)
};

export const dur = {
  fast: 0.18,
  base: 0.6,
  slow: 1.1,
};

// Ab wann ein Element als „im Bild“ gilt
export const enter = 'top 85%';

export const media = {
  motion: '(prefers-reduced-motion: no-preference)',
  desktop: '(min-width: 900px)',
  finePointer: '(hover: hover) and (pointer: fine)',
};
