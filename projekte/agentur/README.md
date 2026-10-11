# Agenturseite

Website der eigenen Agentur: Weiche **Neu bauen / Renovieren**, Fragebogen mit Live-Skizze, Schnell-Check mit Vorher/Nachher, Referenzen aus `beispiele/`.

```bash
npm install
npm run build      # baut zuerst die Prototypen nach public/beispiele, dann die Seite
npm run dev        # http://localhost:5173 (Referenz-Links brauchen einmal npm run beispiele)
```

| Seite | Inhalt |
|---|---|
| `index.html` | Weiche (geteilter Hero), Referenzen (Stapel), Ablauf, Preise, Köln vor Ort, Über uns, FAQ, Abschluss |
| `neu.html` | Fragebogen in 5 Schritten + Live-Skizze, Zusammenfassung, Anfrage |
| `renovieren.html` | URL-Schnell-Check (PageSpeed), Vorher/Nachher, Leistungen, Anfrage „Was stört Sie?“ |
| `impressum.html`, `datenschutz.html` | Gliederung mit Platzhaltern |

- **Stammdaten** (Name, Telefon, Preise, Mail-Endpunkt, PLZ-Umkreis): `site.config.js`. In HTML als `{{name}}`, `{{preis:neubau}}` usw., eingesetzt von `vite.config.js`.
- **Kopf, Fuß, Head:** `src/partials/`, eingebunden per `<!-- include:header -->`.
- **Referenzen:** die sieben Prototypen stehen in `site.config.js` (`referenzen`). Daraus entstehen beim Build die Galerie (`<!-- galerie -->`) und die Stilkarten im Fragebogen (`<!-- stile -->`). Bilder neu erzeugen: `node tools/aufnehmen.mjs` (siehe Kopf der Datei), Herkunft in `public/media/HERKUNFT.md`.
- **Farben und Schrift:** `src/styles/tokens.css`. Kalkweiß und Marine-Tinte, Bereich Neu bauen = Marine, Renovieren = Tannengrün, **Messing ist die einzige Akzentfarbe** (alle Hauptknöpfe). Schibsted Grotesk, selbst gehostet. Rundungen: 6 px für Anklickbares, 14 px für Bilder und Flächen.
- **Bewegung:** nur über `src/motion/`. Agentur-Muster stehen in `docs/ANIMATION.md` unter „Muster der Agenturseite“.

## Stand: Design überarbeitet, Animationen ausgebaut

Gestaltet nach dem Taste-Skill: eine Sans-Schrift mit Haltung statt Serife, echte Bilder statt nachgebauter Platzhalter, höchstens zwei kleine Labels pro Seite, acht unterschiedliche Abschnittsformen auf der Startseite.

| Wo | Bewegung |
|---|---|
| Start, Weiche | Flächen öffnen sich, echte Seiten fliegen in einen 3D-Fächer (fächert beim Zeigen auf), Vorher/Nachher-Naht fährt einmal durch und ist danach ziehbar |
| Start, Referenzen | angeheftete Seitwärts-Galerie der 7 Prototypen, in jeder Karte scrollt die Seite mit; „Live ansehen“ öffnet den Prototyp im Dialog |
| Start, Ablauf | Linie füllt sich, Schritte leuchten nacheinander auf |
| Start, Preise / Köln | Handy-Ansichten mit Parallax, Foto zoomt, Rhein zeichnet sich, Umkreis wächst |
| Neu bauen | Schritte gleiten in Laufrichtung, Fortschrittsbalken füllt sich, Skizze nimmt Farben und Form des gewählten Prototyps an, Bausteine tauchen auf, Haken beim Danke |
| Renovieren | Messringe füllen sich mit Zahl; Vorher/Nachher als angeheftete Szene in vier Schritten (Desktop), sonst Regler und Handy-Vergleich |

Mobil eigene Regie (keine Anheftungen, Wischleiste), bei reduzierter Bewegung und ohne JavaScript vollständig und ruhig.

### Offen (vor dem Livegang)

- Agenturname, Domain, Telefon, E-Mail, Impressum, Datenschutztext
- „Ab“-Preise in `site.config.js`
- Mailversand: Serverless-Funktion o. Ä. (`anfrageEndpunkt`), sonst öffnet sich das Mailprogramm; ohne JS bräuchte das Formular eine `action`
- Optional PageSpeed-API-Schlüssel (`pagespeedKey`), ohne Schlüssel nur wenige Abfragen pro Tag
- Foto und Namen für „Über uns“
- Foto im Köln-Abschnitt ist ein KI-Symbolbild (gekennzeichnet), später durch eigene Aufnahmen ersetzen
- Aussagen bestätigen: „meist innerhalb von zwei Werktagen“, „Hosting in Deutschland“, „kleine Änderungen inklusive“, „Domain läuft auf Ihren Namen“
