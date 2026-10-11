// [data-roll]   Link oder Knopf: beim Hover rollt der Text nach oben weg, eine Kopie rollt von unten nach.
// Reines CSS nach dem Umbau hier (base.css); bei reduzierter Bewegung wechselt der Text ohne Rollen.
export function initRoll() {
  document.querySelectorAll('[data-roll]').forEach((el) => {
    if (el.querySelector('.roll')) return;
    const text = el.textContent.trim();
    el.innerHTML = `<span class="roll"><span class="roll__a">${text}</span><span class="roll__b" aria-hidden="true">${text}</span></span>`;
  });
}
