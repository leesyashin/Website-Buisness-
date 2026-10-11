# Website-Business – Arbeitsweise für Claude

Hier entstehen Websites für Kunden: animiert, schnell, barrierearm, rechtssicher für Deutschland. Sprache im Repo und mit Vincent: **Deutsch**.

## Aufbau

| Ordner | Inhalt |
|---|---|
| `starter/` | Grundgerüst jeder Kundenseite: Vite, GSAP (ScrollTrigger, SplitText), Lenis, View Transitions, Bewegung per `data-`-Attribut |
| `beispiele/` | Beispielseiten pro Branche (Produkt/3D-Dose, Baufirma/3D-Gebäude, Restaurant/Reservierung), nutzen `@starter/…` direkt |
| `video/` | Remotion: Hero-Loops, Reels, 3D-Produktvideo (`@remotion/three`, gleicher Dosen-Code wie `beispiele/`) |
| `projekte/<kunde>/` | Kundenprojekte, jeweils Kopie von `starter/` mit eigener `PRODUCT.md` und `DESIGN.md` |
| `referenzen/` | vermessene Vorbild-Websites (`sites.txt`, Berichte, `VERGLEICH.md`) |
| `tools/analyze/` | Referenz-Analyse mit Playwright |
| `docs/` | `GRUNDLAGE.md` (Bauplan), `ANIMATION.md` (Remotion vs. JS, Attribut-Tabelle), `REFERENZ-RASTER.md` |

## Skills

- `/impeccable` – Design bauen, prüfen, verfeinern (`init`, `shape`, `critique`, `audit`, `polish`, `animate` …). Vor UI-Arbeit `.claude/skills/impeccable/scripts/impeccable context --target <projektordner>` ausführen.
- `/design-taste-frontend` – Design-Read und Anti-Template-Regeln für Landingpages, Portfolios, Redesigns.
- `/referenz-analyse` – Vorbild-Websites vermessen und auswerten.

Herkunft: Impeccable v4.5.0 (Apache-2.0, pbakaus/impeccable) und Taste-Skill v2 (MIT, Leonxlnx/taste-skill), übernommen aus `leesyashin/Webseiten-Optimierung`.

## Regeln

- **Bewegung nur über das Motion-System** in `src/motion/`: neues Muster = eigene Datei + Registrierung in `motion/index.js` + Zeile in `docs/ANIMATION.md`. Nur `transform`/`opacity`/`clip-path` animieren.
- **Ohne JS und bei reduzierter Bewegung** muss jede Seite statisch vollständig sein.
- **Tokens zuerst:** Farben, Schriften, Abstände, Kurven in `tokens.css` (und `video/src/lib/theme.ts`), nie hart in Komponenten.
- **Schriften selbst hosten** (Fontsource), keine Google-Fonts-CDN.
- **Prüfen vor „fertig“:** `npm run build`, dann Desktop 1440 × 900 und Handy 390 × 844 mit Playwright durchscrollen: keine JS-Fehler, kein seitliches Überlaufen, reduzierte Bewegung vollständig. Screenshots selbst ansehen.
- Referenzseiten liefern Muster, keine Inhalte: nichts 1:1 kopieren.

## Cloud-Umgebung

- Chromium für Playwright: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- Remotion rendern: `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell npm run render:hero`; 3D-Kompositionen mit `--gl=swangle`.
- WebGL-Screenshots mit Playwright: Chromium mit `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` starten.
- Fremde Domains nur erreichbar, wenn in der Umgebung freigegeben.
