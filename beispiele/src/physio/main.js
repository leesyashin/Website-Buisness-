import '@fontsource-variable/mona-sans/standard.css';
import './physio.css';
import { initMotion } from '@starter/motion/index.js';
import { showOpenStatus } from '../shared/oeffnungszeiten.js';
import { initRange } from './range.js';
import { initKurse } from './kurse.js';

initMotion();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Öffnungszeiten in Minuten ab Mitternacht (0 = Sonntag)
const HOURS = { 0: [], 1: [[420, 1260]], 2: [[420, 1260]], 3: [[420, 1260]], 4: [[420, 1260]], 5: [[420, 1260]], 6: [[540, 780]] };
showOpenStatus(HOURS, { status: document.querySelector('[data-status]') });

initRange(document.querySelector('[data-range]'));
initKurse(document.querySelector('#kurse'), { reduced });
