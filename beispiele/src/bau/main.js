import '@fontsource-variable/archivo/standard.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@starter/styles/tokens.css';
import '@starter/styles/base.css';
import '@starter/styles/sections.css';
import '../shared/example.css';
import './bau.css';
import { initMotion } from '@starter/motion/index.js';

initMotion();

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
// three.js erst nachladen: Text und Layout stehen sofort
import('./building.js').then(({ initBuilding }) => initBuilding(document.querySelector('[data-stage]'), { reduced }));
