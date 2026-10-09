# Animation: Remotion oder JavaScript?

Kurz: **beides, für verschiedene Aufgaben.**

| | JavaScript im Browser (GSAP, Lenis, CSS) | Remotion |
|---|---|---|
| Was es ist | Bewegung, die live auf der Website läuft und auf Scrollen, Maus und Klick reagiert | React-Komponenten, die Bild für Bild zu einem **Video** (MP4/WebM) gerendert werden |
| Ergebnis | interaktive Seite | Videodatei oder eingebetteter Player |
| Typisch | Text-Reveals, Scroll-Szenen, angeheftete Kapitel, Parallax, Seitenwechsel, Hover, Cursor | Hero-Hintergrund-Loop, Produkt-/Projekt-Showreel, Social-Reels, animierte Erklärgrafik, Ads |
| Reagiert auf Nutzer | ja | nein (nur Play/Pause/Scrubben im Player) |
| Kosten auf der Seite | JS-Bundle (~55 KB gz für GSAP + Lenis) | Videodatei (Hero-Loop hier: ~1 MB für 8 s) |
| Ordner | `starter/` | `video/` |

**Faustregel:** Wenn sich etwas *wegen des Nutzers* bewegt → JavaScript. Wenn es *wie ein Film* abläuft und auch außerhalb der Website (Instagram, Präsentation, Ads) gebraucht wird → Remotion. Gemeinsam nutzen beide dieselben Tokens (Farben, Schriften, Kurven), damit Website und Video zusammenpassen.

---

## Teil 1: Website-Bewegung (`starter/`)

### Stack

- **[GSAP](https://gsap.com) 3.15** mit ScrollTrigger und SplitText. Seit 3.13 sind alle Plugins kostenlos, auch für Kundenprojekte (Standard-Lizenz von GSAP/Webflow; nur ein konkurrierender Website-Baukasten wäre ausgeschlossen).
- **[Lenis](https://lenis.darkroom.engineering)**: weiches Scrollen, an den GSAP-Takt gekoppelt.
- **Native Browser-Technik:** View Transitions für Seitenwechsel (kein SPA-Router nötig), `scroll-snap` für mobile Wischleisten, CSS-Übergänge für Hover und Fokus.
- **Vite** als Build: statische Dateien, überall hostbar.

### Bewegung per Attribut

Jedes Muster hängt an einem `data-`-Attribut im HTML. Ohne JavaScript oder bei „Bewegung reduzieren“ bleibt die Seite vollständig und ruhig.

| Attribut | Wirkung | Datei |
|---|---|---|
| `data-reveal` · `="fade"` · `="scale"` · `="clip"` | Einblenden beim Hereinscrollen | `motion/reveal.js` |
| `data-reveal-stagger` (am Eltern-Element) | Kinder erscheinen nacheinander | `motion/reveal.js` |
| `data-split` · `="words"` · `="chars"` + `data-split-now` | Überschrift steigt zeilen-/wort-/zeichenweise aus einer Maske | `motion/split.js` |
| `data-scrub-text` | Absatz hellt sich beim Scrollen Wort für Wort auf | `motion/scrub-text.js` |
| `data-parallax="0.2"` | Ebene wandert langsamer/schneller (−0.3 … 0.3) | `motion/parallax.js` |
| `data-horizontal` + `data-horizontal-track` | Abschnitt anheften, Spur fährt seitwärts (nur Desktop) | `motion/horizontal.js` |
| `data-marquee` · `data-marquee-speed` | Laufband, reagiert auf Scrolltempo | `motion/marquee.js` |
| `data-magnetic="0.3"` | Knopf folgt der Maus (nur feiner Zeiger) | `motion/magnetic.js` |
| `data-count-to="98"` · `data-count-decimals` | Zahl zählt hoch | `motion/counter.js` |
| `data-header` | Kopfzeile versteckt sich beim Runterscrollen | `motion/header.js` |
| `style="view-transition-name: x"` auf zwei Seiten | Element fliegt beim Seitenwechsel von A nach B | `styles/base.css` |

Neue Muster: eigene Datei unter `src/motion/`, in `motion/index.js` innerhalb von `gsap.matchMedia()` registrieren, eine Zeile in diese Tabelle.

### Regeln, damit es hochwertig wirkt (und nicht nach Template)

1. **Jede Bewegung hat einen Grund:** Blick lenken, Zusammenhang zeigen (Bild fliegt in die Detailseite), Rückmeldung geben. Fünf gute Momente schlagen zwanzig Effekte.
2. **Eine Bewegungssprache pro Projekt:** zwei Kurven (`ease.out` zum Ankommen, `ease.inOut` für Wechsel), drei Dauern. Stehen in `motion/config.js` und `tokens.css`.
3. **Nur `transform` und `opacity` animieren** (dazu `clip-path` für Masken). Nie `top/left/width/height`, keine Filter beim Scrollen.
4. **Scroll-gekoppelt (`scrub`) für Erzählung, zeitbasiert für Ankommen.** Text-Reveals laufen einmal (`once: true`) und nicht rückwärts.
5. **Reduzierte Bewegung ist Pflicht:** `gsap.matchMedia` schaltet alles ab, Inhalte stehen statisch und vollständig da, Videos pausieren.
6. **Mobil ist eigene Regie,** kein geschrumpfter Desktop: keine Pins mit Seitwärtsfahrt, stattdessen Wischleisten; kein Magnet-Cursor.
7. **Kein Layout-Springen:** Startzustände nur über die Klasse `motion-pending` (Inline-Skript im `<head>`), mit Sicherheitsnetz nach 3 s.

### Wann mehr als GSAP?

- **WebGL / 3D** (Three.js, OGL, React Three Fiber): Bildverzerrungen, Partikel, 3D-Produkt. Nur wenn das Konzept es trägt; kostet Performance und Zeit.
- **Lottie / Rive:** Illustrationen und Icons aus After Effects bzw. Rive, die ein Designer liefert.
- **Spline:** schnelle 3D-Szenen ohne Code, aber schwer (mehrere MB).
- **CSS Scroll-driven Animations** (`animation-timeline: view()`): für einfache Reveals ganz ohne JS, inzwischen in Chrome, Edge und Safari 26.

---

## Teil 2: Videos aus Code (`video/`)

### Was drin ist

| Komposition | Format | Zweck |
|---|---|---|
| `HeroLoop` | 1920 × 1080, 8 s, nahtlos | Hintergrundvideo für den Website-Hero (`starter/public/media/hero-loop.mp4`) |
| `SocialReel` | 1080 × 1920, 9 s | Reel mit Kinetic Type, Texte per Props austauschbar |

### Befehle

```bash
cd video
npm install
npm run studio          # Remotion Studio im Browser: Vorschau, Zeitleiste, Props live ändern
npm run render:hero     # → out/hero-loop.mp4 + out/hero-poster.jpg
npm run publish:hero    # rendern und in den Starter kopieren
npm run render:reel     # → out/social-reel.mp4

# Reel für einen Kunden
npx remotion render SocialReel out/weingut.mp4 \
  --props='{"kicker":"Neu online","headline":["Weingut","am Hang"],"points":["Lagen","Weine","Hofladen"],"cta":"weingut-am-hang.de"}'
```

In der Cloud-Umgebung zusätzlich `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` setzen (Remotion kann dort kein eigenes Chrome herunterladen). Lokal am Mac ist das nicht nötig.

### Regeln für Website-Videos

- **Hintergrund-Loops ruhig halten**, Text gehört ins HTML darüber (lesbar, übersetzbar, SEO).
- **Nahtlos:** Bewegungen als volle Sinus-Perioden über die Gesamtlänge, dann sind erstes und letztes Bild identisch.
- **Leicht:** H.264 mit `--crf=27` (Loop hier ~1 MB), Filmkorn gegen Farbbänder, Poster-Bild für den ersten Moment.
- **Einbinden:** `<video autoplay muted loop playsinline poster preload="metadata">`, bei reduzierter Bewegung pausiert der Starter das Video automatisch.
- **Interaktiv statt Datei?** `@remotion/player` bettet eine Komposition als React-Player direkt in eine Seite ein (z. B. Konfigurator-Vorschau). Für reine Hintergründe ist die Videodatei leichter.
- **Lizenz:** Remotion ist für Einzelpersonen und Firmen bis 3 Mitarbeitende kostenlos, darüber braucht es eine Company License (remotion.pro).
