// Stammdaten der Agentur – eine Quelle für HTML (Platzhalter {{…}} über vite.config.js) und JavaScript.
// Alles in ‹…› ist noch Platzhalter und muss vor dem Livegang ersetzt werden.
export const site = {
  name: '‹Agenturname›',
  claim: 'Webseiten für Betriebe',
  inhaber: '‹Vorname Nachname›',
  strasse: '‹Straße Nr.›',
  ort: '‹PLZ› Köln',
  telefon: '‹0221 000 00 00›',
  telefonLink: '+492210000000',
  email: 'hallo@‹domain›.de',
  // „Ab“-Preise je Bereich (Zahl in Euro). null = Platzhalter wird angezeigt.
  preise: {
    neubau: null,
    renovieren: null,
    pflege: null, // pro Monat
  },
  // Anfragen gehen per POST (JSON) an diesen Endpunkt, z. B. eine kleine Serverless-Funktion.
  // Leer = Fallback: Zusammenfassung wird als E-Mail im Mailprogramm vorbereitet.
  anfrageEndpunkt: '',
  // Google-PageSpeed-API-Schlüssel (optional, erhöht das Kontingent). Ohne Schlüssel klappen wenige Abfragen pro Tag.
  pagespeedKey: '',
  // Postleitzahlbereiche für Foto- und Videoaufnahmen vor Ort
  vorOrt: {
    inklusive: ['50', '51', '53'], // Köln, Bergisches Land, Bonn/Rhein-Sieg
    aufAnfrage: ['40', '41', '42', '52'], // Düsseldorf, Neuss, Wuppertal/Solingen, Düren/Aachen
  },
};

// Referenzen: die Prototypen aus beispiele/. Daraus entstehen beim Build die Galerie (Startseite) und die
// Stilkarten im Fragebogen. Bilder: public/media/referenzen/<key>*.webp (tools/aufnehmen.mjs).
// farben = Grund, Schrift, Akzent des Prototyps (für die Live-Skizze im Fragebogen).
export const referenzen = [
  {
    key: 'hagedorn', pfad: 'schreinerei', name: 'Hagedorn', branche: 'Möbelwerkstatt',
    satz: 'Ein Stuhl aus vierzehn Teilen, in 3D zerlegt und wieder zusammengesetzt.',
    stil: 'Handwerklich & präzise', stilSatz: 'Klare Schrift, viel Luft, das Material im Mittelpunkt.',
    farben: ['#dfe3e0', '#1d2421', '#1d2421'],
  },
  {
    key: 'rosenplatz', pfad: 'zahnarzt', name: 'Rosenplatz', branche: 'Zahnarztpraxis',
    satz: 'Für Angstpatienten gebaut: Atemübung, erster Termin Schritt für Schritt, Terminanfrage.',
    stil: 'Ruhig & freundlich', stilSatz: 'Helle Flächen, weiche Formen, viel Vertrauen.',
    farben: ['#f2f4f0', '#1f3a33', '#df6a3c'],
  },
  {
    key: 'achse', pfad: 'physio', name: 'Achse', branche: 'Physiotherapie',
    satz: 'Eine Figur hebt beim Scrollen den Arm, Grad für Grad. Dazu Kursplan und Laufanalyse.',
    stil: 'Sportlich & direkt', stilSatz: 'Kräftige Schrift, klare Kanten, ein starker Akzent.',
    farben: ['#ededeb', '#13212b', '#f05a28'],
  },
  {
    key: 'kessler', pfad: 'architektur', name: 'Kessler Vogt', branche: 'Architekturbüro',
    satz: 'Projekte als große Bilder, jedes mit eigener Seite und weichem Übergang.',
    stil: 'Reduziert & edel', stilSatz: 'Große Fotos, wenig Farbe, viel Ruhe.',
    farben: ['#f0efeb', '#1a1a1a', '#1a1a1a'],
  },
  {
    key: 'ruland', pfad: 'bau', name: 'Ruland Bau', branche: 'Bauunternehmen',
    satz: 'Ein Gebäude wächst beim Scrollen, wird zum Bauplan und bekommt abends Licht.',
    stil: 'Handfest & technisch', stilSatz: 'Kantige Schrift, Zahlen, Technik im Vordergrund.',
    farben: ['#dcd9d3', '#1b1c1e', '#f2c200'],
  },
  {
    key: 'mara', pfad: 'restaurant', name: 'Mara', branche: 'Restaurant',
    satz: 'Mittags hell, abends dunkel. Reservierung mit freien Zeiten auf einen Blick.',
    stil: 'Warm & persönlich', stilSatz: 'Elegante Schrift, ruhige Farben, wie gedruckt.',
    farben: ['#dde7cf', '#1f3324', '#7a1f2b'],
  },
  {
    key: 'perle', pfad: 'dose', name: 'perle', branche: 'Getränkemarke',
    satz: 'Eine Dose in echtem 3D, die sich dreht und die ganze Seite umfärbt.',
    stil: 'Kräftig & verspielt', stilSatz: 'Große Farbflächen, viel Bewegung, auffällig.',
    farben: ['#1d3a26', '#f1eda4', '#f1eda4'],
  },
];

export function preis(key) {
  const v = site.preise[key];
  return v == null ? 'ab ‹Preis› €' : `ab ${v.toLocaleString('de-DE')} €`;
}
