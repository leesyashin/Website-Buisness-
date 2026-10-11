// Erzeugt die Bilder der Referenzen und des Vorher/Nachher (public/media/referenzen, public/media/vorher).
// Voraussetzung: Prototypen laufen (cd beispiele && npm run build && npx vite preview --port 4175),
// Playwright aus tools/analyze ist installiert, ffmpeg ist vorhanden.
//   node tools/aufnehmen.mjs [http://localhost:4175]
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '../../../tools/analyze/node_modules/playwright/index.mjs';

const basis = process.argv[2] || 'http://localhost:4175';
const here = (p) => resolve(import.meta.dirname, p);
const tmp = here('../.aufnahmen');
const ref = here('../public/media/referenzen');
const vorher = here('../public/media/vorher');
[tmp, ref, vorher].forEach((d) => mkdirSync(d, { recursive: true }));

export const prototypen = {
  perle: 'dose',
  ruland: 'bau',
  mara: 'restaurant',
  hagedorn: 'schreinerei',
  rosenplatz: 'zahnarzt',
  achse: 'physio',
  kessler: 'architektur',
};

const webp = (src, out, vf = null, q = 78) =>
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', src, ...(vf ? ['-vf', vf] : []), '-quality', String(q), out]);

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const verstecken = '.back-to-hub{display:none!important}';

async function aufnahme(url, datei, { breite, hoehe, mobil = false, ganz = false, ruhig = false, warten = 3500 }) {
  const ctx = await browser.newContext({
    viewport: { width: breite, height: hoehe },
    deviceScaleFactor: mobil ? 2 : 1,
    isMobile: mobil,
    hasTouch: mobil,
    reducedMotion: ruhig ? 'reduce' : 'no-preference',
  });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: verstecken });
  await p.waitForTimeout(warten);
  await p.screenshot({ path: datei, fullPage: ganz });
  await ctx.close();
}

for (const [key, pfad] of Object.entries(prototypen)) {
  const url = `${basis}/${pfad}/`;
  await aufnahme(url, `${tmp}/${key}.png`, { breite: 1440, hoehe: 900 });
  await aufnahme(url, `${tmp}/${key}-mobil.png`, { breite: 390, hoehe: 844, mobil: true });
  await aufnahme(url, `${tmp}/${key}-lang.png`, { breite: 1440, hoehe: 900, ganz: true, ruhig: true, warten: 2500 });
  webp(`${tmp}/${key}.png`, `${ref}/${key}.webp`);
  webp(`${tmp}/${key}.png`, `${ref}/${key}-800.webp`, 'scale=800:-1');
  webp(`${tmp}/${key}-mobil.png`, `${ref}/${key}-mobil.webp`, 'scale=480:-1');
  webp(`${tmp}/${key}-lang.png`, `${ref}/${key}-lang.webp`, 'crop=1440:min(ih\\,2700):0:0,scale=900:-1', 72);
  console.log('✓', key);
}

// Vorher: die absichtlich veraltete Seite der Zahnarztpraxis
const alt = pathToFileURL(here('vorher/rosenplatz-alt.html')).href;
await aufnahme(alt, `${tmp}/alt.png`, { breite: 1440, hoehe: 900, warten: 500 });
await aufnahme(alt, `${tmp}/alt-mobil.png`, { breite: 390, hoehe: 844, mobil: true, warten: 500 });
webp(`${tmp}/alt.png`, `${vorher}/rosenplatz-alt.webp`);
webp(`${tmp}/alt.png`, `${vorher}/rosenplatz-alt-800.webp`, 'scale=800:-1');
webp(`${tmp}/alt-mobil.png`, `${vorher}/rosenplatz-alt-mobil.webp`, 'scale=480:-1');
console.log('✓ vorher');
await browser.close();
