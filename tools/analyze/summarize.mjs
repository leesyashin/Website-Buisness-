// Fasst alle referenzen/*/report.json zu referenzen/VERGLEICH.md zusammen:
// eine Vergleichstabelle und Häufigkeiten (was haben die Seiten gemeinsam?).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { libs } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = join(root, 'referenzen');

const reports = [];
for (const name of (await readdir(dir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const file = join(dir, name, 'report.json');
  if (existsSync(file)) reports.push(JSON.parse(await readFile(file, 'utf8')));
}
if (!reports.length) {
  console.error('Noch keine Berichte. Erst node analyze.mjs ausführen.');
  process.exit(1);
}

const n = reports.length;
const count = (items) => {
  const m = new Map();
  items.flat().filter(Boolean).forEach((x) => m.set(x, (m.get(x) || 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};
const share = ([name, c]) => `${name} (${c}/${n})`;
const median = (xs) => {
  const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};
const px = (v) => (v ? Math.round(parseFloat(v)) : null);

const rows = reports.map((r) => {
  const d = r.desktop;
  const m = r.mobile;
  return {
    slug: r.slug,
    framework: d.tech.framework.join(', ') || '–',
    motion: libs(d).join(', ') || '–',
    display: d.typography.h1?.family || '–',
    text: d.typography.body?.family || '–',
    h1: px(d.typography.h1?.size),
    h1m: px(m.typography.h1?.size),
    body: px(d.typography.body?.size),
    theme: d.layout.darkTheme ? 'dunkel' : 'hell',
    palette: [d.colors.pageBackground, ...d.colors.backgrounds.filter((c) => c !== d.colors.pageBackground).slice(0, 2), ...d.colors.text.slice(0, 1)],
    length: d.layout.pageHeightViewports,
    sections: d.layout.sections,
    pinned: d.motion.pinSpacers,
    sticky: d.motion.sticky,
    video: d.motion.videos.some((v) => v.autoplay),
    webgl: d.tech.webgl > 0,
    cursor: d.motion.cursorFollower,
    marquee: d.motion.marquee,
    reduced: d.css.reducedMotionRules,
    lcp: d.perf.lcpMs,
    js: d.perf.jsKB,
    kb: d.perf.transferKB,
    radii: d.layout.radii,
  };
});

const yes = (b) => (b ? '●' : '·');
const md = `# Vergleich der Referenzen

${n} Seiten · erzeugt ${new Date().toISOString().slice(0, 10)} mit \`tools/analyze\`. Die Messwerte sind Rohdaten; die Deutung steht in \`docs/GRUNDLAGE.md\`.

## Übersicht

| Seite | Technik | Bewegung | Display-Schrift | Text-Schrift | H1 px (mobil) | Text px | Thema | Länge (Bildschirme) | Pins | Video | WebGL | Cursor | Laufband | LCP ms | JS KB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${rows.map((r) => `| [${r.slug}](${r.slug}/report.md) | ${r.framework} | ${r.motion} | ${r.display} | ${r.text} | ${r.h1 ?? '–'} (${r.h1m ?? '–'}) | ${r.body ?? '–'} | ${r.theme} | ${r.length} | ${r.pinned} | ${yes(r.video)} | ${yes(r.webgl)} | ${yes(r.cursor)} | ${yes(r.marquee)} | ${r.lcp} | ${r.js} |`).join('\n')}

## Paletten

${rows.map((r) => `- **${r.slug}**: ${r.palette.map((c) => `\`${c}\``).join(' ')}`).join('\n')}

## Häufigkeiten

- **Bewegungs-Bibliotheken:** ${count(rows.map((r) => r.motion.split(', ').filter((x) => x !== '–'))).map(share).join(', ') || '–'}
- **Technik/CMS:** ${count(rows.map((r) => r.framework.split(', ').filter((x) => x !== '–'))).map(share).join(', ') || '–'}
- **Display-Schriften:** ${count(rows.map((r) => r.display)).map(share).join(', ')}
- **Text-Schriften:** ${count(rows.map((r) => r.text)).map(share).join(', ')}
- **Thema:** ${count(rows.map((r) => r.theme)).map(share).join(', ')}
- **Eckenradien:** ${count(rows.map((r) => r.radii)).slice(0, 6).map(share).join(', ') || 'eckig'}
- **Angeheftete Szenen:** ${rows.filter((r) => r.pinned > 0).length}/${n} · **sticky:** ${rows.filter((r) => r.sticky > 0).length}/${n} · **Autoplay-Video:** ${rows.filter((r) => r.video).length}/${n} · **WebGL:** ${rows.filter((r) => r.webgl).length}/${n} · **eigener Cursor:** ${rows.filter((r) => r.cursor).length}/${n} · **Laufband:** ${rows.filter((r) => r.marquee).length}/${n}
- **reduced-motion berücksichtigt (CSS):** ${rows.filter((r) => r.reduced > 0).length}/${n}

## Mediane

- H1 Desktop ${median(rows.map((r) => r.h1))} px · H1 mobil ${median(rows.map((r) => r.h1m))} px · Fließtext ${median(rows.map((r) => r.body))} px
- Seitenlänge ${median(rows.map((r) => r.length))} Bildschirmhöhen · ${median(rows.map((r) => r.sections))} Abschnitte
- LCP ${median(rows.map((r) => r.lcp))} ms · JS ${median(rows.map((r) => r.js))} KB · gesamt ${median(rows.map((r) => r.kb))} KB
`;

await writeFile(join(dir, 'VERGLEICH.md'), md);
console.log(`referenzen/VERGLEICH.md geschrieben (${n} Seiten)`);
