import { site } from '../../site.config.js';
import { hakenZeichnen } from '../motion/einblenden.js';

// Formulardaten als Objekt; Mehrfachauswahl wird zur Liste
export function formDaten(form) {
  const daten = {};
  for (const [k, v] of new FormData(form)) {
    if (v === '') continue;
    if (k in daten) daten[k] = [].concat(daten[k], v);
    else daten[k] = form.querySelectorAll(`[name="${k}"][type="checkbox"]`).length > 1 ? [v] : v;
  }
  return daten;
}

const etiketten = {
  betrieb: 'Betrieb', branche: 'Branche', ziel: 'Ziel', stil: 'Stil', funktionen: 'Funktionen', umfang: 'Umfang',
  vorhanden: 'Vorhanden', plz: 'PLZ', vorOrt: 'Fotos/Videos vor Ort', zeit: 'Zeitrahmen', url: 'Webseite',
  probleme: 'Was stört', name: 'Name', email: 'E-Mail', telefon: 'Telefon', nachricht: 'Nachricht',
};

// Einfache Textfassung für E-Mail und Fallback
export function formText(form) {
  const d = formDaten(form);
  return Object.entries(d)
    .filter(([k]) => k !== 'einwilligung')
    .map(([k, v]) => `${etiketten[k] || k}: ${[].concat(v).join(', ')}`)
    .join('\n');
}

// Absenden: mit Endpunkt per POST (JSON), sonst als vorbereitete E-Mail im Mailprogramm.
// Validierung über die eingebauten Browser-Regeln (required, type=email).
export function initAnfrage(form, { betreff, text }) {
  const danke = form.querySelector('[data-danke]');
  form.addEventListener('submit', async (e) => {
    if (e.defaultPrevented) return; // Fragebogen hat den Schritt weitergeschaltet
    e.preventDefault();
    if (!form.reportValidity()) return;

    const knopf = form.querySelector('[type="submit"]');
    knopf.disabled = true;
    const art = form.dataset.anfrage;
    const inhalt = text();
    let ok = false;
    let perMail = false;

    if (site.anfrageEndpunkt) {
      try {
        const res = await fetch(site.anfrageEndpunkt, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ art, daten: formDaten(form), text: inhalt }),
        });
        ok = res.ok;
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      const mail = `mailto:${site.email}?subject=${encodeURIComponent(`Anfrage: ${betreff}`)}&body=${encodeURIComponent(inhalt)}`;
      window.location.href = mail;
      ok = true;
      perMail = true;
    }

    knopf.disabled = false;
    if (ok && danke) {
      if (perMail) {
        const p = danke.querySelector('p');
        p.textContent = 'Ihr E-Mail-Programm hat sich mit allen Angaben geöffnet. Bitte dort noch auf „Senden“ klicken, dann melden wir uns persönlich.';
      }
      form.dispatchEvent(new CustomEvent('anfrage:gesendet'));
      Array.from(form.children).forEach((el) => {
        if (el !== danke) el.hidden = true;
      });
      danke.hidden = false;
      danke.focus();
      hakenZeichnen(danke);
    }
  });
}
