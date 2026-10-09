// Kopfzeile: verschwindet beim Herunterscrollen, kommt beim Hochscrollen zurück.
// Läuft auch bei reduzierter Bewegung (nur Zustand per Klasse, der Übergang steht im CSS).
export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  let last = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    header.classList.toggle('is-hidden', y > last && y > 240);
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
