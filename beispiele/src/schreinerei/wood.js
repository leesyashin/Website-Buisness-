// Holzmaserung auf Canvas malen und als Textur auf den 3D-Stuhl legen (wie das Dosen-Etikett in dose/label.js).
// Die Textur kachelt nahtlos in beide Richtungen: Wellen nutzen nur ganzzahlige Frequenzen über die Breite,
// Linien am Rand werden oben und unten wiederholt.

export const woods = {
  eiche: { name: 'Eiche', base: '#a98257', dark: '#674626', light: '#d2b083', lines: 120, wave: 1, rays: true },
  nuss: { name: 'Nussbaum', base: '#5e3d28', dark: '#2c1a10', light: '#8a6142', lines: 90, wave: 1.8, rays: false },
  esche: { name: 'Esche', base: '#d6bd93', dark: '#86643a', light: '#eedcbb', lines: 100, wave: 0.7, rays: false },
};

const W = 1024;
const H = 256;

export function drawWood(canvas, key) {
  const wood = woods[key];
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Fester Zufall pro Holzart: jede Seite und jedes Video sieht dieselbe Maserung
  let seed = [...key].reduce((s, c) => s * 31 + c.charCodeAt(0), 7) % 2147483647;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  ctx.fillStyle = wood.base;
  ctx.fillRect(0, 0, W, H);

  const wavy = (y0, amp, k1, k2, p1, p2) => {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 8) {
      const t = (x / W) * Math.PI * 2;
      const y = y0 + Math.sin(t * k1 + p1) * amp + Math.sin(t * k2 + p2) * amp * 0.3;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
  };
  const repeatY = (draw) => [-H, 0, H].forEach((dy) => draw(dy));

  // Breite, weiche Bänder: Früh- und Spätholz
  for (let i = 0; i < 16; i++) {
    const y0 = rand() * H;
    const amp = (4 + rand() * 10) * wood.wave;
    const k1 = 1 + Math.floor(rand() * 2);
    const k2 = 3 + Math.floor(rand() * 4);
    const p1 = rand() * 6.3;
    const p2 = rand() * 6.3;
    const width = 6 + rand() * 18;
    const color = rand() < 0.6 ? wood.dark : wood.light;
    repeatY((dy) => {
      wavy(y0 + dy, amp, k1, k2, p1, p2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.07 + rand() * 0.08;
      ctx.lineWidth = width;
      ctx.stroke();
    });
  }

  // Feine Jahresringe
  for (let i = 0; i < wood.lines; i++) {
    const y0 = rand() * H;
    const amp = (1.5 + rand() * 6) * wood.wave;
    const k1 = 1 + Math.floor(rand() * 3);
    const k2 = 4 + Math.floor(rand() * 6);
    const p1 = rand() * 6.3;
    const p2 = rand() * 6.3;
    const dark = rand() < 0.75;
    const alpha = dark ? 0.12 + rand() * 0.3 : 0.1 + rand() * 0.2;
    const width = 0.6 + rand() * 1.8;
    repeatY((dy) => {
      wavy(y0 + dy, amp, k1, k2, p1, p2);
      ctx.strokeStyle = dark ? wood.dark : wood.light;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.stroke();
    });
  }

  // Eiche: Markstrahlen als kurze helle Spiegel
  if (wood.rays) {
    ctx.fillStyle = wood.light;
    for (let i = 0; i < 220; i++) {
      ctx.globalAlpha = 0.15 + rand() * 0.25;
      const x = rand() * W;
      const y = rand() * H;
      ctx.fillRect(x, y, 6 + rand() * 26, 0.8 + rand() * 1.6);
    }
  }

  ctx.globalAlpha = 1;
  return canvas;
}
