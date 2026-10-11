# landonorris.com – erste Notizen (nur HTML ausgewertet)

Stand 09.10.2026. Erreichbar war nur das HTML; Skripte, Bilder, Rive- und WebGL-Dateien liegen auf
`cdn.prod.website-files.com`, `lando.itsoffbrand.io` und `assets.itsoffbrand.io` (in der Umgebung noch gesperrt).
Screenshots, Scroll-Video und Messwerte folgen, sobald diese Domains freigegeben sind (`/referenz-analyse`).

## Technik
- Webflow als CMS, die gesamte Bewegung in eigenen Skripten der Agentur **OFF+BRAND**.
- **Lenis** für weiches Scrollen.
- **Rive** für fast alle Grafik-Animationen (17 Instanzen): Pfeile in Buttons (Hover/Rotation), Burger-Menü,
  Unterschrift, „Phrases“, Helm-Grafik, Schaltkreis-Linien. Rive-Zustände werden per ScrollTrigger gesteuert
  (`data-rive-scrolltrigger-start/end`).
- **WebGL** an drei Stellen (`data-gl="head" | "carousel" | "background"`). Die Szenen **wechseln ihre Farben beim
  Scrollen** (`data-gl-change-from/to`: dunkelgrün → weiß).
- Navigation wechselt je Abschnitt zwischen hell und dunkel (`data-nav-theme-target`).

## Gestaltung und Bewegung
- **Eine Signatur-Kurve für alles:** `cubic-bezier(0.65, 0.05, 0, 1)`, 0,75 s. Übernommen als `signature` im Starter.
- **Fluides Skalieren:** die ganze Seite rechnet in einer Einheit, die sich aus der Fensterbreite ableitet
  (`--design-width: 1728`, `--fluid-font`), Proportionen bleiben bei jeder Breite gleich.
- **Wenige Farben, eine Signalfarbe:** sehr dunkles Grün `#101400`, Neon-Lime `#d2ff00`, helle Grüntöne.
- **Markierungs-Reveals** (`data-anim-high="right, lime"`): Farbfläche wischt hinter Text, mit Richtung und Farbe.
  Übernommen als `data-highlight`.
- **Text-Hover** (`data-anim="text-hover"`, 30×): Linktexte rollen. Übernommen als `data-roll`.
- **SVG-Masken** für Abschnittsformen (Footer, „Track“-Formen) statt rechteckiger Kanten.
- Laufbänder mit Partner-Logos, Seitwärts-Scroll-Abschnitte, Helm-Galerie mit Hover-Reveal, Video beim Hover.

## Was wir daraus übernehmen
1. Signatur-Kurve und Markierungs-Reveal (erledigt).
2. Farbwechsel von 3D-Szenen an Abschnitte koppeln (erledigt: Colorway-Ereignis).
3. Rive für Icons und Button-Animationen prüfen (offen; Rive-Dateien liefert ein Designer).
4. Fluides Skalieren als optionales Token-Set (offen).
