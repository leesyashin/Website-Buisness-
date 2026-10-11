# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Wie die Prototypen: Vite (mehrseitig, ohne Framework) + GSAP (ScrollTrigger, SplitText …) + Lenis + View Transitions, Motion-System aus `starter/src/motion/`. three.js nur, wo 3D die Aussage trägt. Prototypen aus `beispiele/` werden unverändert unter `/beispiele/` mitgebaut.

## Users

Inhaberinnen und Inhaber lokaler Betriebe (Handwerk, Gastronomie, Praxen, Läden, Dienstleister), oft mit veralteter oder ohne Webseite, wenig Zeit, wenig Technikwissen. Sie wollen verstehen, was es kostet, wie es abläuft und was sie selbst tun müssen. Anrede: **Sie**.

## Product Purpose

Website der eigenen Agentur. Zwei Wege, gleich am Anfang wählbar:
1. **Neu bauen** („Von der Idee bis zum fertigen Ergebnis“): kurzer Fragebogen (5 Schritte) mit Live-Skizze, am Ende Zusammenfassung + Anfrage per Mail.
2. **Renovieren**: URL eingeben, echter Schnell-Check (Google PageSpeed), Vorher/Nachher, Anfrage „Was stört Sie?“.

Erfolg: qualifizierte Anfragen; der Besucher muss nie überlegen, was der nächste Schritt ist.

## Positioning

Wir bauen animierte, schnelle, rechtssichere Seiten wie die eigenen Prototypen, und in Köln und Umgebung zusätzlich eigene Foto- und Videoaufnahmen vor Ort.

## Capabilities and Constraints

- „Ab“-Preise je Bereich (Neu bauen, Renovieren, Pflege & Hosting monatlich), Werte noch offen.
- Zusatzleistung: Pflege & Hosting. (Kein SEO-Paket, kein Google-Profil, kein Social Media als eigene Leistung.)
- Foto/Video vor Ort: PLZ-Abfrage im Fragebogen und eigener Abschnitt; Umkreis vorerst über PLZ-Bereiche (50, 51, 53 inklusive; 40, 41, 42, 52 auf Anfrage).
- Kontaktwege: Anfrageformular, Telefon, E-Mail (kein WhatsApp).
- Mailversand: noch offen (Endpunkt in `site.config.js`), bis dahin Fallback über das Mailprogramm.
- Offen: Agenturname, Domain, Impressumsangaben, Preise, Foto/Namen für „Über uns“.

## Brand Commitments

- Tonalität: Mischung aus nahbar-direkt und ruhig-hochwertig.
- Farben: ruhig, seriös, vertrauensvoll (Vorbild: Ralph-Lauren-Marineblau, Rolex-Grün). Kein Orange, nichts Knalliges.
- Design-Richtung „Ruhige Bühne“: Die Agenturseite ist zurückhaltend, die Prototypen bringen die Farbe. Die beiden Bereiche haben eigene Farbwelten.
- Viel Bewegung, aber dosiert: 3–4 Signature-Sequenzen, sonst ruhige Reveals. 3D, wo es Sinn ergibt. Keine eingebetteten Videodateien.

## Evidence on Hand

- Drei Prototypen in `beispiele/` (perle, Ruland Bau, Mara), Screenshots in `public/media/referenzen/`. Alle Marken darin sind erfunden → als **Konzeptarbeit** gekennzeichnet.
- Keine echten Kundenstimmen, Kundenlogos oder Kennzahlen: nicht erfinden.

## Product Principles

1. An die Hand nehmen: Auf jedem Bildschirm ist der nächste Schritt eindeutig.
2. Zeigen statt behaupten: Live-Skizze, echter Messwert, echte Prototypen.
3. Ruhe vor Effekt: Bewegung erklärt etwas oder bleibt weg.
4. Ehrlich: Platzhalter bleiben sichtbar, bis echte Inhalte da sind; keine erfundenen Belege.

## Accessibility & Inclusion

WCAG 2.1 AA, ohne JavaScript und bei reduzierter Bewegung vollständig, Tastatur durch den ganzen Fragebogen.
