# Grundlage: So bauen wir Websites

Dieses Dokument ist der Bauplan für jede Kundenseite. Teil A (Gemeinsamkeiten der Referenzen) wird aus der Referenz-Analyse gefüllt, Teil B bis D gelten ab sofort.

---

## A. Was unsere Referenzen gemeinsam haben

> **Stand: begonnen.** landonorris.com ist als HTML ausgewertet ([Notizen](../referenzen/landonorris.com/notizen.md)); Signatur-Kurve, Markierungs-Reveal, Text-Hover und an Abschnitte gekoppelte 3D-Farbwechsel sind bereits im Starter. igloo.inc und die Asset-Domains von landonorris.com sind in dieser Umgebung noch gesperrt. Sobald sie in `referenzen/sites.txt` stehen und erreichbar sind:
> `cd tools/analyze && npm install && node analyze.mjs && node summarize.mjs`, dann pro Seite das [Raster](REFERENZ-RASTER.md) ausfüllen und hier zusammenfassen.

Geplante Gliederung:

1. **Gemeinsamer Nenner:** was auf (fast) allen Seiten vorkommt, mit Häufigkeit aus `referenzen/VERGLEICH.md`.
2. **Typografie-Muster:** Schriftrollen, Größenverhältnis H1/Text, Laufweiten.
3. **Farb- und Flächenmuster.**
4. **Seitenaufbau:** typische Kapitelfolge, Länge, CTA-Positionen.
5. **Bewegungsmuster:** welche Effekte, wie dosiert, Tempo, Mobilverhalten.
6. **Technik:** Baukasten oder eigener Code, Bibliotheken, Performance.
7. **Was davon in den Starter wandert** (konkrete neue `data-`-Muster oder Token-Vorgaben).
8. **Was wir bewusst nicht übernehmen.**

---

## B. Ablauf pro Projekt

| # | Schritt | Werkzeug | Ergebnis |
|---|---|---|---|
| 1 | **Brief verstehen:** Ziel, Publikum, Angebot, vorhandene Marke, 2–3 Referenzen des Kunden | Gespräch, `/impeccable init` | `PRODUCT.md` im Projektordner |
| 2 | **Design-Read:** eine Zeile „Lese das als … für … mit … Sprache“, dazu die drei Regler Varianz / Bewegung / Dichte | `/design-taste-frontend` | Richtung, bevor Code entsteht |
| 3 | **Referenzen vermessen** (die des Kunden + passende aus unserer Sammlung) | `tools/analyze`, Raster | Muster, die wir übernehmen |
| 4 | **Visuelle Welt festlegen:** Tokens (Farbe, Schrift, Abstände, Kurven), ein Schlüsselkapitel als Prototyp | `/impeccable shape`, `starter/src/styles/tokens.css` | `DESIGN.md`, Prototyp |
| 5 | **Kapitelplan + Bewegungsdrehbuch** (Vorlage unten) | dieses Dokument | Tabelle, vom Kunden abgenommen |
| 6 | **Bauen:** Starter kopieren, Kapitel umsetzen, Bewegung über `data-`-Attribute | `starter/` | lauffähige Seite |
| 7 | **Video,** falls der Hero oder Social es braucht | `video/` (Remotion) | `hero-loop.mp4`, Reels |
| 8 | **Prüfen:** Desktop 1440 × 900 und Handy 390 × 844, reduzierte Bewegung, keine JS-Fehler, kein seitliches Überlaufen | `/impeccable audit`, `/impeccable critique`, Playwright | Mängelliste → beheben |
| 9 | **Feinschliff & Übergabe** | `/impeccable polish` | Live-Seite, kurze Pflegeanleitung |

Neues Kundenprojekt anlegen:

```bash
cp -r starter projekte/<kunde>
cd projekte/<kunde> && rm -rf node_modules dist && npm install && npm run dev
```

## C. Vorlage: Kapitelplan & Bewegungsdrehbuch

Eine Zeile pro Kapitel. Spalte „Warum“ ist Pflicht, sonst fliegt die Bewegung raus.

| Kapitel | Inhalt / Aussage | Bewegung | Auslöser | Warum | Mobil | Reduziert |
|---|---|---|---|---|---|---|
| Hero | Versprechen in einem Satz, ein CTA | Headline `data-split`, Video-Loop | Laden | Ankommen, Marke spüren | gleich, Video kleiner | statisch, Poster |
| Beweis | Kunden, Zahlen | `data-count-to`, `data-marquee` | Scroll | Vertrauen schnell zeigen | gleich | Zahlen stehen |
| Leistungen | 3–5 Angebote | `data-reveal-stagger` | Scroll | Ordnung zeigen | gleich | sichtbar |
| Arbeiten | Projekte mit Bild | `data-horizontal`, View Transition in Detailseite | Scroll / Klick | Zusammenhang Karte → Projekt | Wischleiste | normale Liste |
| Haltung | ein starker Absatz | `data-scrub-text` | Scroll | Tempo rausnehmen, lesen | gleich | voll sichtbar |
| Kontakt | eine Handlung | `data-magnetic` | Maus | Einladung | ohne Magnet | normal |

## D. Qualitätsboden (gilt für jede Seite)

**Performance**
- LCP unter 2,5 s auf Mobil (Ziel unter 1,5 s), CLS unter 0,1.
- JS unter 150 KB gzip ohne WebGL. Bilder als AVIF/WebP mit `width`/`height`, unterhalb des ersten Bildschirms `loading="lazy"`.
- Hero-Video unter 2 MB, mit Poster.

**Barrierefreiheit**
- Kontrast WCAG AA, sichtbarer Fokus, Sprunglink „Zum Inhalt“, sinnvolle Überschriften-Hierarchie.
- `prefers-reduced-motion` schaltet Bewegung ab, Inhalte bleiben vollständig.
- Texte nie nur im Video oder Canvas.

**Recht (Deutschland)**
- Schriften selbst hosten (Fontsource, wie im Starter), keine Google-Fonts-Einbindung vom Google-Server.
- Impressum und Datenschutzerklärung von jeder Seite aus erreichbar.
- Externe Dienste (Karten, YouTube, Analytics) erst nach Einwilligung laden; cookielose Statistik bevorzugen.

**Handwerk**
- Kein Template-Look: keine KI-Lila-Verläufe, keine drei gleichen Feature-Karten als Standard, keine Effekte ohne Grund (siehe `/design-taste-frontend`, Abschnitt Anti-Default).
- Echte Inhalte vor Gestaltung. Platzhalter (`Bild 4:5`) vor der Übergabe ersetzen.
