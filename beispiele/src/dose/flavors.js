// Die drei Sorten. Jede Sorte ist zugleich eine Colorway der Seite (dose.css) und ein Etikett (label.js).
// Farben als Hex, weil das Etikett auf ein Canvas gemalt wird; dose.css nutzt dieselben Werte.
export const flavors = {
  yuzu: {
    no: '01',
    name: 'Yuzu & Ingwer',
    short: 'Yuzu',
    can: '#e4dc4f',
    ink: '#16341f',
    accent: '#2f6b3c',
    dots: '#f3ee8f',
    notes: { Säure: 0.8, Süße: 0.35, Schärfe: 0.55 },
  },
  hibiskus: {
    no: '02',
    name: 'Hibiskus & Beere',
    short: 'Hibiskus',
    can: '#8c1d4a',
    ink: '#fbe9df',
    accent: '#f29ab8',
    dots: '#a8325f',
    notes: { Säure: 0.6, Süße: 0.55, Schärfe: 0.1 },
  },
  minze: {
    no: '03',
    name: 'Gurke & Minze',
    short: 'Minze',
    can: '#173f47',
    ink: '#d8f3e6',
    accent: '#7fd1b0',
    dots: '#21545d',
    notes: { Säure: 0.3, Süße: 0.2, Schärfe: 0.05 },
  },
};
