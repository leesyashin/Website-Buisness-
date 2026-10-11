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
- **Farben & Schrift:** `src/styles/tokens.css` (Kalk/Marine-Tinte, Bereich Neu = Marine, Renovieren = Tannengrün, Messing für Details; Bodoni Moda + Mona Sans, selbst gehostet).
- **Bewegung:** nur über `src/motion/` (Kopie aus dem Starter).

## Stand: Grundgerüst

Fertig: alle Seiten, Inhalte, Fragebogen-Logik (Schritte, Prüfung, Zusammenfassung, Ändern), Live-Skizze, PLZ-Logik für Foto/Video vor Ort, PageSpeed-Check, Versand (Endpunkt oder Mailprogramm), mobil und ohne JS vollständig. Bewegung bisher nur Grundmuster (Split, Reveal, Stapel).

### Nächste Phase: Animationen

| # | Sequenz | Wo | Technik |
|---|---|---|---|
| 1 | Geteilter Hero: links baut sich eine Seite aus Linien und Blöcken auf, rechts schiebt sich die Naht über die alte Seite und renoviert sie; Hover/Tippen gibt einer Seite mehr Raum | Start | GSAP-Timelines, `clip-path`, Endlosschleife nur sichtbar |
| 2 | Live-Skizze: Bausteine fliegen ein (Flip), Farbwechsel beim Stil, Seiten-Name tippt sich | Neu bauen | GSAP Flip |
| 3 | Vorher/Nachher als angeheftete Scroll-Verwandlung in 4 Schritten | Renovieren | ScrollTrigger `scrub`, Desktop gepinnt, mobil Schritt-Karten |
| 4 | Messwerte zählen hoch, Ringe füllen sich | Renovieren | `data-count-to`, SVG |
| 5 | Referenzen: Stapel + Live-Vorschau im Rahmen auf Klick | Start | `data-stack`, lazy iframe |
| 6 | Köln-Karte: Rhein zeichnet sich, Radius pulsiert, Sucher-Rahmen | Start | `data-draw` |
| 7 | 3D (optional, wo es trägt): z. B. Browser-Fenster aus Ebenen im Hero | Start | three.js nachgeladen |

### Offen (vor dem Livegang)

- Agenturname, Domain, Telefon, E-Mail, Impressum, Datenschutztext
- „Ab“-Preise in `site.config.js`
- Mailversand: Serverless-Funktion o. Ä. (`anfrageEndpunkt`), sonst öffnet sich das Mailprogramm; ohne JS bräuchte das Formular eine `action`
- Optional PageSpeed-API-Schlüssel (`pagespeedKey`), ohne Schlüssel nur wenige Abfragen pro Tag
- Foto und Namen für „Über uns“
- Aussagen bestätigen: „meist innerhalb von zwei Werktagen“, „Hosting in Deutschland“, „kleine Änderungen inklusive“, „Domain läuft auf Ihren Namen“
