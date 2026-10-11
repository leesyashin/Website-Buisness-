import '@fontsource-variable/funnel-display';
import '@fontsource-variable/funnel-sans';
import '@fontsource/fragment-mono/400.css';
import './schreinerei.css';
import { initMotion } from '@starter/motion/index.js';

initMotion();

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
// three.js erst nachladen: Text und Layout stehen sofort, der Stuhl kommt dazu
import('./scene.js').then(({ initChairScene }) => initChairScene(document.querySelector('[data-stage]'), { reduced }));
