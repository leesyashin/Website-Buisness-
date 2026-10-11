import { site } from '../../site.config.js';
import { normUrl, hostOf } from '../lib/url.js';
import { zeigeWert } from '../motion/messwerte.js';

// Schnell-Check über die Google-PageSpeed-API (mobil). Startet nur auf Klick, nachdem der Hinweis zu Google
// sichtbar war. Kommt die Adresse aus der Weiche der Startseite mit, ist sie schon eingetragen.
const API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const kategorien = ['performance', 'accessibility', 'best-practices', 'seo'];

function stufe(wert) {
  if (wert >= 90) return 'gut';
  if (wert >= 50) return 'mittel';
  return 'schlecht';
}

function deutung(werte, audits) {
  const lcp = audits['largest-contentful-paint'];
  const saetze = [];
  if (werte.performance < 50) {
    saetze.push(`Auf dem Handy lädt Ihre Seite langsam: Der Hauptinhalt steht erst nach ${lcp?.displayValue || 'mehreren Sekunden'} (gut wären unter 2,5 s). Viele Besucher springen vorher ab.`);
  } else if (werte.performance < 90) {
    saetze.push(`Die Ladezeit ist in Ordnung, aber nicht gut: Der Hauptinhalt steht nach ${lcp?.displayValue || 'einigen Sekunden'}.`);
  }
  if (werte.accessibility < 90) saetze.push('Bei Kontrasten, Beschriftungen oder Bedienbarkeit gibt es Lücken, die manche Besucher ausschließen.');
  if (werte.seo < 90) saetze.push('Google findet nicht alles, was es braucht, um Ihre Seite gut einzuordnen.');
  if (werte['best-practices'] < 90) saetze.push('Technisch ist die Seite nicht mehr auf dem neuesten Stand.');
  if (!saetze.length) saetze.push('Technisch steht Ihre Seite gut da. Wenn sie trotzdem keine Anfragen bringt, liegt es eher an Design, Texten oder dem Weg zur Anfrage. Genau da setzen wir an.');
  return saetze.join(' ');
}

export function initCheck(form, { ergebnis, uebernahme }) {
  if (!form) return;
  const input = form.querySelector('input');
  const status = ergebnis.querySelector('[data-check-status]');
  const deut = ergebnis.querySelector('[data-check-deutung]');
  const knopf = form.querySelector('button');
  let laeuft = false;

  async function pruefen(url) {
    if (laeuft) return;
    laeuft = true;
    knopf.disabled = true;
    ergebnis.hidden = false;
    ergebnis.dataset.zustand = 'laeuft';
    status.textContent = `Wir messen ${hostOf(url)} … das dauert bis zu 30 Sekunden.`;
    deut.textContent = '';
    ergebnis.querySelectorAll('[data-wert]').forEach((li) => {
      li.dataset.stufe = '';
      li.querySelector('.werte__zahl').textContent = '';
      li.querySelector('circle.wert').style.strokeDashoffset = '';
    });
    if (uebernahme && !uebernahme.value) uebernahme.value = url;

    const params = new URLSearchParams({ url, strategy: 'mobile', locale: 'de' });
    kategorien.forEach((k) => params.append('category', k));
    if (site.pagespeedKey) params.set('key', site.pagespeedKey);

    try {
      const res = await fetch(`${API}?${params}`);
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      const cats = json.lighthouseResult?.categories || {};
      const werte = {};
      kategorien.forEach((k, i) => {
        werte[k] = Math.round((cats[k]?.score ?? 0) * 100);
        const li = ergebnis.querySelector(`[data-wert="${k}"]`);
        li.dataset.stufe = stufe(werte[k]);
        zeigeWert(li, werte[k], i * 0.12);
      });
      ergebnis.dataset.zustand = 'fertig';
      status.textContent = `Ergebnis für ${hostOf(url)} auf dem Handy (0 bis 100, ab 90 gut):`;
      deut.textContent = deutung(werte, json.lighthouseResult?.audits || {});
    } catch {
      ergebnis.dataset.zustand = 'fehler';
      status.textContent = 'Die Messung hat gerade nicht geklappt: Die Seite war nicht erreichbar oder Google ist ausgelastet. Kein Problem, schicken Sie uns die Adresse unten, wir prüfen sie selbst.';
    } finally {
      laeuft = false;
      knopf.disabled = false;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = normUrl(input.value);
    if (!url) {
      input.setCustomValidity('Bitte eine Webadresse eingeben, z. B. www.ihre-seite.de');
      input.reportValidity();
      return;
    }
    input.value = url;
    pruefen(url);
  });
  input.addEventListener('input', () => input.setCustomValidity(''));

  // Aus der Weiche der Startseite: /renovieren.html?url=… wird eingetragen, der Klick auf „Kostenlos prüfen“
  // startet die Messung (vorher steht der Hinweis zu Google sichtbar darunter).
  const mitgebracht = normUrl(new URLSearchParams(location.search).get('url'));
  if (mitgebracht) {
    input.value = mitgebracht;
    if (uebernahme && !uebernahme.value) uebernahme.value = mitgebracht;
    const hinweis = form.querySelector('[data-check-hinweis]');
    if (hinweis) hinweis.prepend(Object.assign(document.createElement('strong'), { textContent: 'Ihre Adresse ist eingetragen. Ein Klick auf „Kostenlos prüfen“ startet die Messung. ' }));
    knopf.focus({ preventScroll: true });
  }
}
