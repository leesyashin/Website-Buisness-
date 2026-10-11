import '@fontsource-variable/host-grotesk';
import './architektur.css';
import { initMotion } from '@starter/motion/index.js';
import { initRail } from './rail.js';

// Startseite und Projektseiten teilen sich dieses Skript. Der Seitenwechsel selbst ist reines CSS
// (View Transitions in base.css + gleiche view-transition-names auf Karte und Projektseite).
initMotion();

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rail = document.querySelector('[data-rail]');
if (rail) initRail(rail, { reduced });
