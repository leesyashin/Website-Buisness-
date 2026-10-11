import { continueRender, delayRender, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';

// Dieselben Tokens wie starter/src/styles/tokens.css – Video und Website sehen aus einem Guss aus.
// Pro Kunde: Werte hier und in tokens.css gemeinsam ändern.
export const color = {
  bg: 'oklch(0.975 0.006 85)',
  surface: 'oklch(0.945 0.008 85)',
  ink: 'oklch(0.2 0.012 60)',
  inkSoft: 'oklch(0.45 0.012 60)',
  accent: 'oklch(0.62 0.19 38)',
  dark: 'oklch(0.17 0.01 60)',
  onDark: 'oklch(0.94 0.008 85)',
};

export const font = {
  sans: '"Instrument Sans", system-ui, sans-serif',
  display: '"Instrument Serif", Georgia, serif',
};

// Schriften lokal (public/fonts) statt Google Fonts: rendert offline und ohne Datenabfluss
const handle = delayRender('Schriften laden');
Promise.all([
  loadFont({ family: 'Instrument Sans', url: staticFile('fonts/instrument-sans-latin-wght-normal.woff2'), weight: '400 700' }),
  loadFont({ family: 'Instrument Serif', url: staticFile('fonts/instrument-serif-latin-400-normal.woff2') }),
  loadFont({ family: 'Instrument Serif', url: staticFile('fonts/instrument-serif-latin-400-italic.woff2'), style: 'italic' }),
]).then(() => continueRender(handle));
