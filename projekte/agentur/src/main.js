// Gemeinsamer Einstieg aller Seiten: Schriften (selbst gehostet), Stile, Bewegungssystem.
import '@fontsource-variable/schibsted-grotesk/wght.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/site.css';
import { initMotion } from './motion/index.js';

initMotion();
