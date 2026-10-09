import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource-variable/geist-mono';
import '@starter/styles/tokens.css';
import '@starter/styles/base.css';
import '@starter/styles/sections.css';
import '../shared/example.css';
import './dose.css';
import { initMotion } from '@starter/motion/index.js';

initMotion();

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
// three.js (~150 KB gzip) erst nachladen: Text und Layout stehen sofort, die Dose kommt dazu
import('./scene.js').then(({ initCanScene }) => initCanScene(document.querySelector('[data-stage]'), { reduced }));

// Sorten-Reiter zeigen die aktuelle Sorte an
const links = document.querySelectorAll('[data-flavor-link]');
const mark = (name) => links.forEach((a) => a.toggleAttribute('aria-current', a.dataset.flavorLink === name));
document.addEventListener('colorway', (e) => mark(e.detail.name));
mark(document.documentElement.dataset.colorway);
