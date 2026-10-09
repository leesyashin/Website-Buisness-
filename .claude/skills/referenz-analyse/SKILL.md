---
name: referenz-analyse
description: Referenz-Websites vermessen und auswerten – Screenshots, Scroll-Video, Schriften, Farben, Animations-Technik, Performance – und daraus ableiten, was gute Seiten gemeinsam haben. Aufrufen mit /referenz-analyse [url …] oder wenn Vincent Websites als Vorbild nennt, „schau dir diese Seiten an“ sagt oder fragt, was eine Seite gut macht.
user-invocable: true
argument-hint: "[url …]  (ohne Argument: alle aus referenzen/sites.txt)"
---

# Referenz-Analyse

Ziel: nicht „schöne Seite“, sondern **benennbare Muster**, die wir in `starter/` und `docs/GRUNDLAGE.md` übernehmen können.

## 1. Erreichbarkeit prüfen

```bash
for u in $(grep -v '^#' referenzen/sites.txt | sed '/^$/d'); do
  case $u in http*) ;; *) u=https://$u;; esac
  echo "$u $(curl -s -o /dev/null -w '%{http_code}' -m 15 "$u")"
done
```

`000` oder `403` vom Proxy heißt: Domain ist in der Cloud-Umgebung nicht freigegeben. Vincent sagen, welche Domains fehlen (Umgebung → Edit → Network access → Allowed domains), mit dem Rest weitermachen. Nie Ergebnisse für nicht erreichbare Seiten erfinden.

## 2. Messen

```bash
cd tools/analyze && npm install          # einmalig
node analyze.mjs [url …]                 # ohne Argument: referenzen/sites.txt
node summarize.mjs                       # → referenzen/VERGLEICH.md
```

Pro Seite ~40–90 s. Ergebnis unter `referenzen/<domain>/`.

## 3. Ansehen – Messwerte reichen nicht

- Screenshots mit dem Read-Tool ansehen: `desktop-00.jpg` (erster Eindruck), dann die Scroll-Folge, dann `mobile-*`.
- Bewegung sichtbar machen: aus dem Scroll-Video Einzelbilder ziehen und als Kontaktbogen ansehen:
  ```bash
  ffmpeg -v error -i referenzen/<domain>/scroll.webm -vf "fps=2,scale=360:-1,tile=6x4" -frames:v 1 referenzen/<domain>/motion-sheet.jpg
  ```
  Achten auf: Text-Reveals, angeheftete Abschnitte, Bildwechsel, Parallax, Seitwärtsfahrten, Farbwechsel zwischen Kapiteln.
- Bei Bedarf feiner: `fps=6` über einen Ausschnitt (`-ss 10 -t 5`).

## 4. Bewerten

Pro Seite das Raster aus `docs/REFERENZ-RASTER.md` in `referenzen/<domain>/report.md` unter „Qualitative Bewertung“ ausfüllen: je Punkt ein Satz + Note, am Ende max. 3 Dinge zum Übernehmen und was wir vermeiden.

## 5. Verdichten

`docs/GRUNDLAGE.md`, Teil A füllen:
- Nur Muster, die auf mindestens der Hälfte der Seiten vorkommen, gelten als „gemeinsam“; Häufigkeit dazuschreiben (z. B. „Lenis 5/7“).
- Jedes Muster mit konkreter Umsetzung im Starter verknüpfen (vorhandenes `data-`-Attribut oder neuer Vorschlag).
- Auffällige Einzelideen getrennt aufführen.

## 6. Vorschlagen, nicht still umbauen

Neue Bewegungsmuster oder Token-Änderungen für `starter/` als Liste vorschlagen; umsetzen, wenn Vincent zustimmt. Muster nachbauen, nie Inhalte, Bilder, Texte oder Marken der Referenzseiten kopieren.
