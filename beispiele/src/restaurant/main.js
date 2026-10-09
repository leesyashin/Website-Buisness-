import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/hanken-grotesk';
import '@starter/styles/tokens.css';
import '@starter/styles/base.css';
import '@starter/styles/sections.css';
import '../shared/example.css';
import './restaurant.css';
import { initMotion } from '@starter/motion/index.js';
import { setColorway } from '@starter/motion/colorway.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initBooking } from './booking.js';

initMotion();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const html = document.documentElement;

// Mittag/Abend: Farbwelt, Karte und Zeitslots wechseln gemeinsam
const getService = () => html.dataset.colorway;
const setService = (name) => {
  setColorway(name);
  document.querySelectorAll('[data-service]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.service === name)));
  // Karte wechselt die Höhe: Scroll-Szenen neu vermessen
  requestAnimationFrame(() => ScrollTrigger.refresh());
};
document.querySelectorAll('[data-service]').forEach((b) => b.addEventListener('click', () => setService(b.dataset.service)));
setService(getService());

// Live-Status im Kopf: geöffnet / öffnet um / Ruhetag
const status = document.querySelector('[data-status]');
const hours = { 0: [[690, 900]], 1: [], 2: [[690, 870], [1050, 1380]], 3: [[690, 870], [1050, 1380]], 4: [[690, 870], [1050, 1380]], 5: [[690, 870], [1050, 1380]], 6: [[1050, 1380]] };
const hhmm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const now = new Date();
const mins = now.getHours() * 60 + now.getMinutes();
const todays = hours[now.getDay()];
const open = todays.find(([a, b]) => mins >= a && mins < b);
const next = todays.find(([a]) => mins < a);
status.textContent = open
  ? `Jetzt geöffnet · bis ${hhmm(open[1])} Uhr`
  : next
    ? `Heute ab ${hhmm(next[0])} Uhr geöffnet`
    : todays.length
      ? 'Für heute geschlossen · morgen wieder da'
      : 'Heute Ruhetag';
status.classList.toggle('is-open', !!open);

// Heutigen Tag in den Öffnungszeiten markieren
document.querySelector(`[data-hours] tr[data-day="${now.getDay()}"]`)?.classList.add('is-today');

initBooking(document.querySelector('[data-booking]'), { reduced, getService, setService });
