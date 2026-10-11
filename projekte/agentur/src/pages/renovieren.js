import '../main.js';
import { initCheck } from '../renovieren/check.js';
import { bindPlz } from '../lib/vor-ort.js';
import { initAnfrage, formText } from '../lib/anfrage.js';

const anfrage = document.querySelector('form[data-anfrage="renovieren"]');
bindPlz(anfrage);
initCheck(document.querySelector('[data-check]'), {
  ergebnis: document.querySelector('[data-check-ergebnis]'),
  uebernahme: anfrage.querySelector('[data-url-uebernahme]'),
});
initAnfrage(anfrage, { betreff: 'Webseite renovieren', text: () => formText(anfrage) });
