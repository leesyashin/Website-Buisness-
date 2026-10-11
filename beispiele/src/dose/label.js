import { flavors } from './flavors.js';

// Malt das Etikett einer Sorte auf ein Canvas. Breite = Umfang der Dose, Höhe = bedruckte Fläche.
// Die Mitte des Bildes (x = 50 %) zeigt später zur Kamera.
// Wird auch vom Remotion-Video benutzt (video/src/compositions/CanReel.tsx) – keine DOM-Abhängigkeit außer Canvas.
export const LABEL_W = 2048;
export const LABEL_H = 1024;

export function drawLabel(canvas, key, fontFamily = 'Bricolage Grotesque Variable, sans-serif') {
  const f = flavors[key];
  const ctx = canvas.getContext('2d');
  canvas.width = LABEL_W;
  canvas.height = LABEL_H;
  const W = LABEL_W;
  const H = LABEL_H;

  // Grund
  ctx.fillStyle = f.can;
  ctx.fillRect(0, 0, W, H);

  // Perlen: Kreise, die nach oben kleiner werden (aufsteigende Kohlensäure)
  let seed = key.length * 97;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = f.dots;
  for (let i = 0; i < 260; i++) {
    const x = rand() * W;
    const y = rand() ** 0.7 * H;
    const r = 3 + (y / H) * 22 * rand();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wortmarke, groß über die Vorderseite
  ctx.fillStyle = f.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `800 440px ${fontFamily}`;
  ctx.save();
  ctx.translate(W / 2, H * 0.62);
  ctx.scale(0.82, 1.18);
  ctx.fillText('perle', 0, 0);
  ctx.restore();

  // Sorte und Angaben
  ctx.font = `600 64px ${fontFamily}`;
  ctx.fillText(f.name, W / 2, H * 0.78);
  ctx.font = `500 34px ${fontFamily}`;
  ctx.globalAlpha = 0.85;
  ctx.fillText('SPRITZIGE LIMONADE · OHNE ZUCKERZUSATZ', W / 2, H * 0.86);
  ctx.globalAlpha = 1;

  // Kopfband mit Sortennummer
  ctx.fillStyle = f.ink;
  ctx.fillRect(0, 70, W, 6);
  ctx.font = `700 40px ${fontFamily}`;
  ctx.textAlign = 'left';
  ctx.fillText(`No. ${f.no}`, W / 2 - 360, 150);
  ctx.textAlign = 'right';
  ctx.fillText('330 ml', W / 2 + 360, 150);

  // Rückseite: Zutaten und Nährwerte (zeigt sich, wenn die Dose sich dreht)
  ctx.textAlign = 'left';
  ctx.font = `600 38px ${fontFamily}`;
  const back = W * 0.04;
  ctx.fillText('Zutaten', back, H * 0.3);
  ctx.font = `400 30px ${fontFamily}`;
  wrap(ctx, `Wasser, Kohlensäure, ${f.name.replace(' & ', ', ')}-Saft (8 %), Zitronensaft, natürliches Aroma.`, back, H * 0.36, 420, 40);
  ctx.font = `600 38px ${fontFamily}`;
  ctx.fillText('pro 100 ml', back, H * 0.62);
  ctx.font = `400 30px ${fontFamily}`;
  ['Energie 15 kJ / 4 kcal', 'Kohlenhydrate 0,9 g', 'davon Zucker 0,9 g', 'Kohlensäure 4,2 g/l'].forEach((t, i) =>
    ctx.fillText(t, back, H * 0.68 + i * 40),
  );

  // Naht der Dose (dünne Linie am Rand)
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 0, 3, H);
  return canvas;
}

function wrap(ctx, text, x, y, maxW, lh) {
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lh;
    } else line = test;
  }
  ctx.fillText(line, x, y);
}
