import { formDaten } from '../lib/anfrage.js';

const stilNamen = {
  plakativ: 'Kräftig & plakativ',
  handfest: 'Klar & handfest',
  editorial: 'Warm & persönlich',
  zeitlos: 'Ruhig & zeitlos',
};

// Zusammenfassung des Fragebogens: Zeilen (mit Schritt zum Ändern) und Textfassung für die E-Mail
export function zusammenfassung(form) {
  const d = formDaten(form);
  const liste = (v) => [].concat(v || []).join(', ');
  const zeilen = [
    { schritt: 1, name: 'Betrieb', wert: [d.betrieb, d.branche].filter(Boolean).join(' · ') },
    { schritt: 1, name: 'Ziel', wert: liste(d.ziel) },
    { schritt: 2, name: 'Stil', wert: stilNamen[d.stil] || '' },
    { schritt: 3, name: 'Funktionen', wert: liste(d.funktionen) },
    { schritt: 4, name: 'Umfang', wert: d.umfang || '' },
    { schritt: 4, name: 'Schon da', wert: liste(d.vorhanden) },
    { schritt: 4, name: 'Standort', wert: [d.plz, d.vorOrt ? 'Fotos & Videos vor Ort gewünscht' : ''].filter(Boolean).join(' · ') },
    { schritt: 4, name: 'Zeitrahmen', wert: d.zeit || '' },
  ];
  const kontakt = [d.name, d.email, d.telefon].filter(Boolean).join(' · ');
  const text = [
    ...zeilen.map((z) => `${z.name}: ${z.wert || 'keine Angabe'}`),
    `Kontakt: ${kontakt || 'keine Angabe'}`,
    d.nachricht ? `Nachricht: ${d.nachricht}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  return { zeilen, text };
}
