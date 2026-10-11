// Baut die Agenturseite als Claude-Artifact (mehrteilig): relative Pfade überall, die Startseite ohne eigenes
// Dokumentgerüst (das setzt der Artifact-Rahmen), die Prototypen aus beispiele/ ebenfalls mit relativen Pfaden.
//   node tools/artefakt.mjs   →  artefakt/ (index.html = Seite, alles andere = Dateien daneben)
import { execSync } from 'node:child_process';
import { cpSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const here = (p) => resolve(import.meta.dirname, '..', p);
const ziel = here('artefakt');
const proto = here('.aufnahmen/beispiele-relativ');
const vite = (args) => execSync(`npx vite build ${args}`, { cwd: here('.'), stdio: 'inherit' });

vite(`../../beispiele --base ./ --outDir "${proto}" --emptyOutDir`);
vite(`--base ./ --outDir "${ziel}" --emptyOutDir`);
rmSync(`${ziel}/beispiele`, { recursive: true, force: true });
cpSync(proto, `${ziel}/beispiele`, { recursive: true });

// Seitenlinks: "/" → index.html, "/#x" → index.html#x, "/beispiele/dose/" → beispiele/dose/index.html, "/neu.html" → neu.html
const relativ = (pfad) => {
  if (pfad === '' || pfad.startsWith('#')) return `index.html${pfad}`;
  if (pfad.endsWith('/')) return `${pfad}index.html`;
  return pfad;
};

for (const datei of readdirSync(ziel).filter((d) => d.endsWith('.html'))) {
  let html = readFileSync(`${ziel}/${datei}`, 'utf8');
  html = html.replace(/(href|action)="\/(?!\/)([^"]*)"/g, (_, attr, pfad) => `${attr}="${relativ(pfad)}"`);
  if (datei === 'index.html') {
    html = html
      .replace(/<!doctype html>/i, '')
      .replace(/<\/?html[^>]*>|<\/?head>|<\/?body[^>]*>/gi, '')
      .replace(/<title>[^<]*<\/title>\s*/, '');
    html = `<title>Agenturseite Köln</title>\n${html}`;
    // Der Artifact-Rahmen setzt Zeichensatz und Viewport selbst
    html = html.replace(/href="index\.html#/g, 'href="#');
    html = html.replace(/<meta charset="utf-8" \/>\s*/, '').replace(/<meta name="viewport"[^>]*>\s*/, '');
  }
  writeFileSync(`${ziel}/${datei}`, html.trim() + '\n');
}
console.log('✓ artefakt/ bereit');
