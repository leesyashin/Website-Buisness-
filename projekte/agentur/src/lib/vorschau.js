// Live-Vorschau: „Live ansehen“ öffnet den Prototyp in einem Dialog (iframe, erst beim Öffnen geladen).
// Ohne JavaScript oder ohne <dialog> öffnet der Link den Prototyp einfach in einem neuen Tab.
export function initVorschau() {
  const dialog = document.querySelector('[data-vorschau-dialog]');
  if (!dialog?.showModal) return;
  const rahmen = dialog.querySelector('[data-vorschau-rahmen]');
  const titel = dialog.querySelector('[data-vorschau-titel]');
  const tab = dialog.querySelector('[data-vorschau-tab]');

  document.querySelectorAll('[data-vorschau]').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // bewusst im neuen Tab
      e.preventDefault();
      titel.textContent = `Live-Vorschau: ${link.dataset.vorschauName}`;
      tab.href = link.href;
      rahmen.src = link.href;
      dialog.showModal();
      window.lenis?.stop();
    });
  });

  dialog.querySelector('[data-vorschau-zu]').addEventListener('click', () => dialog.close());
  // Klick auf den abgedunkelten Rand schließt
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    rahmen.src = 'about:blank';
    window.lenis?.start();
  });
}
