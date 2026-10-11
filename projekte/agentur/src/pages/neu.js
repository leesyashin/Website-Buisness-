import '../main.js';
import { initFragebogen } from '../fragebogen/schritte.js';
import { initSkizze } from '../fragebogen/skizze.js';
import { bindPlz } from '../lib/vor-ort.js';
import { initAnfrage } from '../lib/anfrage.js';
import { zusammenfassung } from '../fragebogen/zusammenfassung.js';

const form = document.querySelector('[data-fragebogen] form');
bindPlz(form);
initSkizze(form, document.querySelector('[data-skizze]'));
initFragebogen(form, { zusammenfassung });
initAnfrage(form, { betreff: 'Neue Webseite', text: () => zusammenfassung(form).text });
