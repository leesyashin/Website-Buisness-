import '@fontsource-variable/figtree';
import './zahnarzt.css';
import { initMotion } from '@starter/motion/index.js';
import { showOpenStatus } from '../shared/oeffnungszeiten.js';
import { initBreathe } from './breathe.js';
import { initTermin } from './termin.js';

initMotion();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Öffnungszeiten in Minuten ab Mitternacht (0 = Sonntag)
const HOURS = { 0: [], 1: [[480, 1080]], 2: [[480, 1080]], 3: [[480, 1080]], 4: [[480, 1080]], 5: [[480, 840]], 6: [] };
showOpenStatus(HOURS, { status: document.querySelector('[data-status]'), table: document.querySelector('[data-hours]') });

initBreathe(document.querySelector('[data-breathe]'), { reduced });
initTermin(document.querySelector('[data-termin]'), { reduced });
