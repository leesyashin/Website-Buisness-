import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { site, preis, referenzen } from './site.config.js';

const here = (p) => resolve(import.meta.dirname, p);

// Mehrseitig, ohne Framework: Kopf- und Fußzeile stehen einmal in src/partials/ und werden per
// <!-- include:name --> eingesetzt. {{feld}} wird aus site.config.js gefüllt, {{preis:neubau}} mit dem „Ab“-Preis.
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// Galerie der Referenzen (Startseite)
const galerie = () =>
  referenzen
    .map(
      (r) => `
          <li class="ref-karte" id="ref-${r.key}" data-ref="${r.key}">
            <div class="ref-karte__rahmen">
              <img src="/media/referenzen/${r.key}-lang.webp" width="900" height="1688" alt="Seite von ${esc(r.name)}, ${esc(r.branche)}" loading="lazy" decoding="async" />
            </div>
            <div class="ref-karte__text">
              <h3>${esc(r.name)} <span>${esc(r.branche)}</span></h3>
              <p>${esc(r.satz)}</p>
              <p class="ref-karte__links">
                <a class="knopf knopf--klein" href="/beispiele/${r.pfad}/" target="_blank" rel="noopener" data-vorschau="${r.pfad}" data-vorschau-name="${esc(r.name)}">Live ansehen</a>
                <a class="link" href="/neu.html?stil=${r.key}">Stil wählen</a>
              </p>
            </div>
          </li>`,
    )
    .join('');

// Ausblick auf der Startseite: kleine Karten, verlinkt auf die Referenzen-Seite
const ausblick = () =>
  referenzen
    .map(
      (r) => `
          <li class="ausblick__karte">
            <a href="/referenzen.html#ref-${r.key}">
              <img src="/media/referenzen/${r.key}-800.webp" width="800" height="500" alt="" loading="lazy" decoding="async" />
              <span class="ausblick__name">${esc(r.name)}</span>
              <span class="ausblick__branche">${esc(r.branche)}</span>
            </a>
          </li>`,
    )
    .join('');

// Stilkarten im Fragebogen
const stile = () =>
  referenzen
    .map(
      (r) => `
              <label class="stil">
                <input type="radio" name="stil" value="${r.key}" required />
                <img src="/media/referenzen/${r.key}-800.webp" width="800" height="500" alt="" loading="lazy" decoding="async" />
                <span class="stil__name">${esc(r.stil)}</span>
                <span class="stil__satz">${esc(r.stilSatz)} Beispiel: ${esc(r.name)}.</span>
              </label>`,
    )
    .join('');

function partials() {
  const fill = (html) =>
    html
      .replace('<!-- galerie -->', galerie)
      .replace('<!-- stile -->', stile)
      .replace('<!-- ausblick -->', ausblick)
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
        referenzen: here('referenzen.html'),
        impressum: here('impressum.html'),
        datenschutz: here('datenschutz.html'),
      },
    },
  },
});
