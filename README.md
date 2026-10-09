# Website-Business

Werkstatt für animierte Kunden-Websites: ein Starter mit Bewegungssystem, Videos aus Code und eine Analyse für Vorbild-Seiten.

## Schnellstart

```bash
# Website-Starter (Demo aller Bewegungsmuster)
cd starter && npm install && npm run dev        # http://localhost:5173

# Videos aus Code (Remotion Studio)
cd video && npm install && npm run studio

# Referenz-Websites vermessen
cd tools/analyze && npm install
node analyze.mjs https://beispiel.de            # oder alle aus referenzen/sites.txt
node summarize.mjs                              # → referenzen/VERGLEICH.md
```

Für die Analyse am Mac einmalig `npx playwright install chromium` im Ordner `tools/analyze`.

## Was wo liegt

| | |
|---|---|
| [`starter/`](starter) | Vite + GSAP (ScrollTrigger, SplitText) + Lenis + View Transitions. Bewegung per `data-`-Attribut, siehe [docs/ANIMATION.md](docs/ANIMATION.md) |
| [`video/`](video) | Remotion: `HeroLoop` (nahtloser Hintergrund für den Hero) und `SocialReel` (9:16, Texte per Props) |
| [`referenzen/`](referenzen) | Vorbild-Websites: Liste, Messberichte, Screenshots, Vergleich |
| [`tools/analyze/`](tools/analyze) | Playwright-Analyse: Technik, Schriften, Farben, Bewegung, Layout, Performance |
| [`docs/GRUNDLAGE.md`](docs/GRUNDLAGE.md) | Bauplan: Ablauf pro Projekt, Kapitel- und Bewegungsdrehbuch, Qualitätsboden |
| [`docs/ANIMATION.md`](docs/ANIMATION.md) | Remotion oder JavaScript? Stack, Attribute, Regeln |
| [`docs/REFERENZ-RASTER.md`](docs/REFERENZ-RASTER.md) | Bewertungsraster für Vorbild-Seiten |
| `projekte/` | Kundenprojekte (Kopien des Starters) |

## Claude Code Skills

| Skill | Aufruf | Quelle | Lizenz |
|---|---|---|---|
| Impeccable (v4.5.0) | `/impeccable` (z. B. `init`, `shape`, `critique`, `audit`, `polish`, `animate`) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable), über Webseiten-Optimierung | Apache-2.0 |
| Taste-Skill v2 | `/design-taste-frontend` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), über Webseiten-Optimierung | MIT |
| Referenz-Analyse | `/referenz-analyse` | dieses Repo | – |

Die Impeccable-Subagents liegen unter `.claude/agents/`.

## Lizenzen der Bibliotheken

- **GSAP:** seit 3.13 inklusive aller Plugins kostenlos, auch kommerziell.
- **Lenis:** MIT.
- **Remotion:** kostenlos für Einzelpersonen und Firmen bis 3 Mitarbeitende, darüber Company License.
- **Instrument Sans / Serif:** SIL Open Font License.
