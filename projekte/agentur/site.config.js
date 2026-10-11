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

export function preis(key) {
  const v = site.preise[key];
  return v == null ? 'ab ‹Preis› €' : `ab ${v.toLocaleString('de-DE')} €`;
}
