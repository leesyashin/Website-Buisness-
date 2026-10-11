// Projektleiste: eine native Wischleiste mit scroll-snap – funktioniert ohne JavaScript, mit Touch, Trackpad und Tastatur.
// Obendrauf: Pfeile (eine Karte weiter), Ziehen mit der Maus und eine Linie, die zeigt, wie viel man gesehen hat.
//
// HTML: [data-rail] (ul), [data-rail-nav] mit [data-rail-prev]/[data-rail-next] (ohne JS versteckt), [data-rail-progress] > span
export function initRail(rail, { reduced }) {
  const nav = document.querySelector('[data-rail-nav]');
  const prev = nav?.querySelector('[data-rail-prev]');
  const next = nav?.querySelector('[data-rail-next]');
  const bar = document.querySelector('[data-rail-progress] span');
  if (!nav || !prev || !next) return;
  nav.hidden = false;

  const step = () => {
    const cards = rail.children;
    return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : rail.clientWidth;
  };
  const go = (dir) => rail.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' });
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? (rail.scrollLeft + rail.clientWidth) / rail.scrollWidth : 1})`;
    prev.disabled = rail.scrollLeft <= 2;
    next.disabled = rail.scrollLeft >= max - 2;
  };
  rail.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(rail);
  update();

  // Maus: ziehen statt nur scrollen. Während des Ziehens kein Einrasten, danach rastet die Leiste auf die nächste Karte.
  let startX = 0;
  let startLeft = 0;
  let moved = false;
  let dragging = false;
  rail.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    startLeft = rail.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) {
      moved = true;
      rail.classList.add('is-dragging');
    }
    if (moved) rail.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    rail.classList.remove('is-dragging');
  });
  // Nach dem Ziehen keinen Link öffnen
  rail.addEventListener('click', (e) => moved && e.preventDefault(), true);
  rail.addEventListener('dragstart', (e) => e.preventDefault());
}
