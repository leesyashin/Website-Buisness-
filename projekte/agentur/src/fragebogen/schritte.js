// Fragebogen Schritt für Schritt. Ohne JavaScript ist er ein langes, vollständiges Formular;
// mit JavaScript zeigt er eine Frage-Gruppe pro Bildschirm, Fortschritt und Zurück/Weiter.
export function initFragebogen(form, { zusammenfassung }) {
  const schritte = Array.from(form.querySelectorAll('[data-schritt]'));
  const marken = Array.from(form.querySelectorAll('[data-schritt-marke]'));
  const steuerung = form.querySelector('[data-steuerung]');
  const zurueck = steuerung.querySelector('[data-zurueck]');
  const weiter = steuerung.querySelector('[data-weiter]');
  const ausgabe = form.querySelector('[data-zusammenfassung]');
  const letzter = schritte.length;
  let aktuell = 1;

  form.classList.add('fb--schritte');
  form.querySelector('.fb__fortschritt').hidden = false;
  steuerung.hidden = false;
  schritte.forEach((s) => s.querySelector(':scope > legend')?.setAttribute('tabindex', '-1'));

  // Vorauswahl aus der Adresse, z. B. /neu.html?stil=handfest (aus den Referenzen)
  const stil = new URLSearchParams(location.search).get('stil');
  const stilFeld = stil && form.querySelector(`[name="stil"][value="${CSS.escape(stil)}"]`);
  if (stilFeld) stilFeld.checked = true;

  function zeige(n, { fokus = true } = {}) {
    const richtung = n > aktuell ? 'vor' : 'zurueck';
    aktuell = n;
    schritte.forEach((s) => {
      const an = Number(s.dataset.schritt) === n;
      s.hidden = !an;
      if (an) s.dataset.richtung = richtung;
    });
    marken.forEach((m) => {
      const nr = Number(m.dataset.schrittMarke);
      m.classList.toggle('is-fertig', nr < n);
      if (nr === n) m.setAttribute('aria-current', 'step');
      else m.removeAttribute('aria-current');
      m.querySelector('button').disabled = nr >= n;
    });
    zurueck.hidden = n === 1;
    weiter.hidden = n === letzter;
    form.dataset.schritt = n;
    if (n === letzter) zeigeZusammenfassung();
    form.dispatchEvent(new CustomEvent('fragebogen:schritt', { detail: { schritt: n } }));
    if (fokus) {
      const legend = schritte[n - 1].querySelector(':scope > legend');
      form.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      legend?.focus({ preventScroll: true });
    }
  }

  // Nur die Pflichtfelder des aktuellen Schritts prüfen
  function schrittGueltig(n) {
    const felder = Array.from(schritte[n - 1].querySelectorAll('input, textarea, select'));
    const falsch = felder.find((f) => !f.checkValidity());
    if (falsch) {
      falsch.reportValidity();
      return false;
    }
    return true;
  }

  function zeigeZusammenfassung() {
    const { zeilen } = zusammenfassung(form);
    ausgabe.replaceChildren();
    const h = Object.assign(document.createElement('h3'), { className: 'zusammenfassung__titel', textContent: 'Ihre Angaben' });
    const dl = document.createElement('dl');
    zeilen.forEach((z) => {
      const reihe = document.createElement('div');
      const dt = Object.assign(document.createElement('dt'), { textContent: z.name });
      const dd = Object.assign(document.createElement('dd'), { textContent: z.wert || '–' });
      const aendern = Object.assign(document.createElement('button'), { type: 'button', className: 'link', textContent: 'Ändern' });
      aendern.setAttribute('aria-label', `${z.name} ändern`);
      aendern.addEventListener('click', () => zeige(z.schritt));
      reihe.append(dt, dd, aendern);
      dl.append(reihe);
    });
    ausgabe.append(h, dl);
    ausgabe.hidden = false;
  }

  weiter.addEventListener('click', () => {
    if (schrittGueltig(aktuell)) zeige(aktuell + 1);
  });
  zurueck.addEventListener('click', () => zeige(aktuell - 1));

  // Enter in einem Textfeld schickt nicht ab, sondern geht einen Schritt weiter
  form.addEventListener('submit', (e) => {
    if (aktuell < letzter) {
      e.preventDefault();
      if (schrittGueltig(aktuell)) zeige(aktuell + 1);
    }
  });

  // Fortschrittsleiste: zu bereits erledigten Schritten zurückspringen
  marken.forEach((m) => {
    m.addEventListener('click', () => {
      const nr = Number(m.dataset.schrittMarke);
      if (nr < aktuell) zeige(nr);
    });
  });

  zeige(1, { fokus: false });
}
