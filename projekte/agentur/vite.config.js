import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { site, preis } from './site.config.js';

const here = (p) => resolve(import.meta.dirname, p);

// Mehrseitig, ohne Framework: Kopf- und Fußzeile stehen einmal in src/partials/ und werden per
// <!-- include:name --> eingesetzt. {{feld}} wird aus site.config.js gefüllt, {{preis:neubau}} mit dem „Ab“-Preis.
function partials() {
  const fill = (html) =>
    html
      .replace(/<!--\s*include:([\w-]+)\s*-->/g, (_, name) => readFileSync(here(`src/partials/${name}.html`), 'utf8'))
      .replace(/\{\{preis:(\w+)\}\}/g, (_, key) => preis(key))
      .replace(/\{\{(\w+)\}\}/g, (m, key) => (key in site ? site[key] : m));
  return {
    name: 'agentur-partials',
    transformIndexHtml: { order: 'pre', handler: (html) => fill(fill(html)) },
    handleHotUpdate({ file, server }) {
      if (file.includes('/src/partials/') || file.endsWith('site.config.js')) server.ws.send({ type: 'full-reload' });
    },
  };
}

// Die Prototypen aus beispiele/ werden unverändert mit Basis /beispiele/ nach public/beispiele gebaut
// (npm run beispiele) und sind so auf der Agenturseite live verlinkt.
export default defineConfig({
  plugins: [partials()],
  build: {
    rollupOptions: {
      input: {
        index: here('index.html'),
        neu: here('neu.html'),
        renovieren: here('renovieren.html'),
        impressum: here('impressum.html'),
        datenschutz: here('datenschutz.html'),
      },
    },
  },
});
