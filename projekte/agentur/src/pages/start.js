import '../main.js';
import { initPlzCheck } from '../lib/vor-ort.js';
import { normUrl } from '../lib/url.js';

initPlzCheck(document.querySelector('[data-plz-check]'));

// Adresse aus der Weiche normalisieren, bevor es zur Renovieren-Seite geht (dort startet die Messung)
document.querySelectorAll('.url-feld').forEach((form) => {
  form.addEventListener('submit', (e) => {
    const input = form.querySelector('input');
    const url = normUrl(input.value);
    if (!url) {
      e.preventDefault();
      input.setCustomValidity('Bitte eine Webadresse eingeben, z. B. www.ihre-seite.de');
      input.reportValidity();
      return;
    }
    input.value = url;
  });
  form.querySelector('input').addEventListener('input', (e) => e.target.setCustomValidity(''));
});
