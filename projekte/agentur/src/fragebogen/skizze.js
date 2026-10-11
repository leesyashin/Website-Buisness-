import { formDaten } from '../lib/anfrage.js';
import { referenzen } from '../../site.config.js';
import { auftauchen, puls } from '../motion/einblenden.js';

// Live-Skizze: Neben dem Fragebogen entsteht aus den Antworten eine erste Skizze der Seite.
// Der gewählte Stil färbt sie in den Farben des Prototyps ein (site.config.js) und gibt ihr dessen Form (data-stil),
// Funktionen erscheinen als Bausteine, der Name steht in der Navigation.
// Reines Schaubild (aria-hidden); die Antworten selbst stehen im Formular und in der Zusammenfassung.

const titel = {
  'Handwerk & Bau': 'Gute Arbeit, fester Termin.',
  Gastronomie: 'Ein Tisch für heute Abend?',
  'Gesundheit & Praxis': 'Termine ohne Warteschleife.',
  'Handel & Laden': 'Vorbeikommen oder online stöbern.',
  'Dienstleistung & Büro': 'Wir kümmern uns darum.',
  'Etwas anderes': 'Schön, dass Sie da sind.',
};

// Reihenfolge der Bausteine auf der skizzierten Seite
const bausteine = [
  ['Galerie', 'galerie', 'Unsere Arbeiten'],
  ['Shop', 'shop', 'Shop'],
  ['Online-Termine', 'termine', 'Termin wählen'],
  ['Reservierung', 'reservierung', 'Tisch reservieren'],
  ['Preisliste', 'preisliste', 'Preise'],
  ['Stellenangebote', 'stellen', 'Wir suchen Verstärkung'],
  ['Neuigkeiten', 'neuigkeiten', 'Neuigkeiten'],
  ['Kontaktformular', 'kontakt', 'Schreiben Sie uns'],
];

const innen = {
  galerie: '<i></i><i></i><i></i>',
  shop: '<i><u></u></i><i><u></u></i><i><u></u></i>',
  termine: '<em></em><em></em><em class="an"></em><em></em><em></em><em></em><em></em><em></em><em class="an"></em><em></em>',
  reservierung: '<em>18:00</em><em class="an">18:30</em><em>19:00</em><em>19:30</em>',
  preisliste: '<s></s><s></s><s></s>',
  stellen: '<s></s><s></s>',
  neuigkeiten: '<i></i><i></i>',
  kontakt: '<s></s><s></s><s class="gross"></s>',
};

function slug(s) {
  return (
    s
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 28) || 'ihr-betrieb'
  );
}

export function initSkizze(form, aside) {
  if (!form || !aside) return;
  aside.hidden = false;
  const seite = aside.querySelector('[data-skizze-seite]');
  const el = (k) => aside.querySelector(`[data-skizze-${k}]`);
  const liste = el('bausteine');
  const vorhanden = new Map();
  const farben = Object.fromEntries(referenzen.map((r) => [r.key, r.farben]));
  let stilVorher = null;

  function cta(d) {
    const f = [].concat(d.funktionen || []);
    if (f.includes('Reservierung')) return 'Tisch reservieren';
    if (f.includes('Online-Termine')) return 'Termin buchen';
    if (f.includes('Shop')) return 'Zum Shop';
    return 'Anfrage senden';
  }

  function render() {
    const d = formDaten(form);
    const name = (d.betrieb || '').trim();
    el('name').textContent = name || 'Ihr Betrieb';
    el('adresse').textContent = `${name ? slug(name) : 'ihr-betrieb'}.de`;
    el('branche').textContent = d.branche && d.branche !== 'Etwas anderes' ? d.branche : 'Ihre Branche';
    el('titel').textContent = titel[d.branche] || 'Willkommen bei Ihrem Betrieb';
    el('cta').textContent = cta(d);
    const stil = d.stil || '';
    seite.dataset.stil = stil;
    const werte = farben[stil] || [];
    ['--sz-bg', '--sz-ink', '--sz-accent'].forEach((name, i) => {
      if (werte[i]) seite.style.setProperty(name, werte[i]);
      else seite.style.removeProperty(name);
    });
    if (stilVorher !== null && stil !== stilVorher) puls(seite);
    stilVorher = stil;
    seite.dataset.umfang = { 'Eine Seite': '1', 'Bis 5 Seiten': '5', '6 bis 15 Seiten': '15' }[d.umfang] || '';
    seite.classList.toggle('hat-logo', [].concat(d.vorhanden || []).includes('Logo'));
    seite.classList.toggle('hat-fotos', !!d.vorOrt || [].concat(d.vorhanden || []).includes('Fotos'));
    seite.classList.toggle('mehrsprachig', [].concat(d.funktionen || []).includes('Mehrsprachig'));

    // Bausteine ergänzen/entfernen, ohne vorhandene neu zu bauen (damit später nur Neues einblendet)
    const gewaehlt = new Set([].concat(d.funktionen || []));
    const neue = [];
    bausteine.forEach(([wert, art, label]) => {
      const da = vorhanden.get(art);
      if (gewaehlt.has(wert) && !da) {
        const b = document.createElement('div');
        b.className = `sz-baustein sz-baustein--${art}`;
        b.innerHTML = `<p>${label}</p><div class="sz-baustein__inhalt">${innen[art]}</div>`;
        vorhanden.set(art, b);
        neue.push(b);
      } else if (!gewaehlt.has(wert) && da) {
        da.remove();
        vorhanden.delete(art);
      }
    });
    // Reihenfolge sicherstellen
    bausteine.forEach(([, art]) => vorhanden.has(art) && liste.append(vorhanden.get(art)));
    liste.dataset.anzahl = vorhanden.size;
    auftauchen(neue);
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  render();
}
