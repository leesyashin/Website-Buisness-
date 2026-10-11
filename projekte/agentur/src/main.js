// Gemeinsamer Einstieg aller Seiten: Schriften (selbst gehostet), Stile, Bewegungssystem.
import '@fontsource-variable/mona-sans/wdth.css';
import '@fontsource-variable/bodoni-moda/opsz.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/site.css';
import { initMotion } from './motion/index.js';

initMotion();
