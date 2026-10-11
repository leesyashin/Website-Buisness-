import '../main.js';
import { initPlzCheck } from '../lib/vor-ort.js';
import { initVorschau } from '../lib/vorschau.js';
import { normUrl } from '../lib/url.js';

initPlzCheck(document.querySelector('[data-plz-check]'));
initVorschau();

// Adresse aus der Weiche normalisieren, bevor es zur Renovieren-Seite geht
document.querySelectorAll('.url-feld').forEach((form) => {
  const input = form.querySelector('input');
  form.addEventListener('submit', (e) => {
    const url = normUrl(input.value);
    if (!url) {
      e.preventDefault();
      input.setCustomValidity('Bitte eine Webadresse eingeben, z. B. www.ihre-seite.de');
      input.reportValidity();
      return;
    }
    input.value = url;
  });
  input.addEventListener('input', () => input.setCustomValidity(''));
});
