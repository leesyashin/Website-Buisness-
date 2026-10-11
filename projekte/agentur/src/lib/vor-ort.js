import { site } from '../../site.config.js';

// Liegt eine Postleitzahl im Umkreis für Foto- und Videoaufnahmen vor Ort?
// 'inklusive' | 'anfrage' | 'nein' | null (keine gültige PLZ)
export function vorOrtStatus(plz) {
  const p = (plz || '').trim();
  if (!/^\d{5}$/.test(p)) return null;
  const pre = p.slice(0, 2);
  if (site.vorOrt.inklusive.includes(pre)) return 'inklusive';
  if (site.vorOrt.aufAnfrage.includes(pre)) return 'anfrage';
  return 'nein';
}

const texte = {
  inklusive: (p) => `${p} liegt im Umkreis. Foto- und Videoaufnahmen vor Ort sind möglich, die Anfahrt ist inklusive.`,
  anfrage: (p) => `${p} liegt etwas weiter weg. Aufnahmen vor Ort sind auf Anfrage möglich.`,
  nein: (p) => `${p} liegt außerhalb unseres Umkreises. Ihre Webseite bauen wir trotzdem gern, Bilder dann aus Ihrem Bestand.`,
};

// Abschnitt „Vor Ort“ auf der Startseite: kleine PLZ-Prüfung
export function initPlzCheck(form) {
  if (!form) return;
  const input = form.querySelector('input');
  const out = form.querySelector('[role="status"]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = vorOrtStatus(input.value);
    form.dataset.status = status || 'ungueltig';
    if (!status) {
      out.textContent = 'Bitte eine fünfstellige Postleitzahl eingeben.';
      return;
    }
    out.textContent = texte[status](input.value.trim());
    if (status !== 'nein') {
      const a = Object.assign(document.createElement('a'), { href: `/neu.html?plz=${input.value.trim()}`, textContent: 'Im Fragebogen gleich mit anfragen →' });
      out.append(' ', a);
    }
  });
}

// In Formularen: PLZ-Feld steuert, ob die Option „Fotos und Videos vor Ort“ erscheint.
// Ohne JavaScript ist die Option immer sichtbar.
export function bindPlz(form) {
  const input = form?.querySelector('[data-plz]');
  if (!input) return;
  const hinweis = form.querySelector('[data-plz-hinweis]');
  const option = form.querySelector('[data-vor-ort]');
  const standard = hinweis?.textContent;
  const update = () => {
    const status = vorOrtStatus(input.value);
    const zeigen = status === 'inklusive' || status === 'anfrage';
    option.hidden = !zeigen;
    if (!zeigen) option.querySelector('input').checked = false;
    if (hinweis) hinweis.textContent = status ? texte[status](input.value.trim()) : standard;
    form.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const fromUrl = new URLSearchParams(location.search).get('plz');
  if (fromUrl && !input.value) input.value = fromUrl;
  input.addEventListener('input', update);
  update();
}
