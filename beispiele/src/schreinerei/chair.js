import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Massivholzstuhl aus 14 Teilen, nur mit Zapfen verbunden. Jedes Teil ist eine eigene Gruppe mit Ruheposition
// und Richtung für die Explosionsansicht; die Zapfen stecken im Ruhezustand unsichtbar im Nachbarteil.
// Maße in Metern, Boden bei y = 0, vorne = +z.

const S = 0.036; // Beinquerschnitt
const TENON = 0.016; // Zapfenlänge

// name, Größe [x, y, z], Position, Explosionsrichtung, Zapfen entlang Achse, Verzögerung beim Zerlegen, Pos. in der Stückliste
const PARTS = [
  ['sitz', [0.44, 0.024, 0.37], [0, 0.437, 0.025], [0, 0.3, 0.03], null, 0, 1],
  ['bein-hl', [S, 0.86, S], [-0.2, 0.43, -0.18], [-0.15, 0.03, -0.13], null, 0.25, 2],
  ['bein-hr', [S, 0.86, S], [0.2, 0.43, -0.18], [0.15, 0.03, -0.13], null, 0.25, 2],
  ['bein-vl', [S, 0.425, S], [-0.2, 0.2125, 0.18], [-0.15, -0.02, 0.15], null, 0.25, 3],
  ['bein-vr', [S, 0.425, S], [0.2, 0.2125, 0.18], [0.15, -0.02, 0.15], null, 0.25, 3],
  ['zarge-v', [0.364, 0.06, 0.02], [0, 0.395, 0.18], [0, 0.01, 0.08], 'x', 0.15, 4],
  ['zarge-h', [0.364, 0.06, 0.02], [0, 0.395, -0.18], [0, 0.01, -0.06], 'x', 0.15, 4],
  ['zarge-l', [0.02, 0.06, 0.324], [-0.2, 0.395, 0], [-0.08, 0.01, 0], 'z', 0.15, 4],
  ['zarge-r', [0.02, 0.06, 0.324], [0.2, 0.395, 0], [0.08, 0.01, 0], 'z', 0.15, 4],
  ['strebe-l', [0.018, 0.026, 0.324], [-0.2, 0.13, 0], [-0.08, -0.02, 0], 'z', 0.3, 5],
  ['strebe-r', [0.018, 0.026, 0.324], [0.2, 0.13, 0], [0.08, -0.02, 0], 'z', 0.3, 5],
  ['strebe-m', [0.364, 0.026, 0.018], [0, 0.13, 0], [0, -0.08, 0.02], 'x', 0.35, 5],
  ['lehne', [0.364, 0.075, 0.022], [0, 0.8, -0.18], [0, 0.1, -0.07], 'x', 0.1, 6],
  ['sprosse', [0.364, 0.035, 0.02], [0, 0.63, -0.18], [0, 0.05, -0.07], 'x', 0.1, 6],
];

export const CHAIR_HEIGHT = 0.86;
const SPREAD = 1.25; // wie weit die Teile auseinanderfahren

// Maserung läuft entlang der längsten Kante; Stirnseiten (Hirnholz) bekommen ein gestauchtes Stück Textur
function woodBox([w, h, d], material, seed) {
  const geometry = new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.14);
  const size = [w, h, d];
  const long = size.indexOf(Math.max(...size));
  const pos = geometry.attributes.position;
  const nor = geometry.attributes.normal;
  const uv = geometry.attributes.uv;
  const ou = (seed * 0.377) % 1;
  const ov = (seed * 0.613) % 1;
  for (let i = 0; i < pos.count; i++) {
    const p = [pos.getX(i), pos.getY(i), pos.getZ(i)];
    const n = [Math.abs(nor.getX(i)), Math.abs(nor.getY(i)), Math.abs(nor.getZ(i))];
    const face = n.indexOf(Math.max(...n));
    if (face !== long) {
      const across = [0, 1, 2].find((a) => a !== face && a !== long);
      uv.setXY(i, p[long] / 0.55 + ou, p[across] / 0.14 + ov);
    } else {
      const [a, b] = [0, 1, 2].filter((x) => x !== face);
      uv.setXY(i, p[a] / 0.5 + ou, p[b] / 0.08 + ov);
    }
  }
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

export function createChair(material) {
  const group = new THREE.Group();
  const parts = PARTS.map(([name, size, home, dir, tenonAxis, delay, pos], i) => {
    const part = new THREE.Group();
    part.add(woodBox(size, material, i + 1));
    if (tenonAxis) {
      // Zapfen an beiden Enden: schmaler und dünner als das Teil
      const [w, h, d] = size;
      const len = tenonAxis === 'x' ? w : d;
      const tenonSize = tenonAxis === 'x' ? [TENON, h * 0.62, d * 0.5] : [w * 0.5, h * 0.62, TENON];
      for (const side of [-1, 1]) {
        const tenon = woodBox(tenonSize, material, i + 20 + side);
        tenon.position[tenonAxis] = side * (len / 2 + TENON / 2 - 0.001);
        part.add(tenon);
      }
    }
    part.position.set(...home);
    part.userData = { name, pos, home: new THREE.Vector3(...home), dir: new THREE.Vector3(...dir).multiplyScalar(SPREAD), delay };
    group.add(part);
    return part;
  });

  const settle = (t) => 1 - (1 - t) ** 3;
  // e = 0 zusammengebaut, 1 vollständig zerlegt; Teile starten versetzt (Sitz zuerst, Streben zuletzt)
  const setExplode = (e) => {
    parts.forEach((part) => {
      const { home, dir, delay } = part.userData;
      const p = Math.min(1, Math.max(0, (e - delay) / 0.65));
      part.position.copy(home).addScaledVector(dir, settle(p));
    });
  };

  const byName = Object.fromEntries(parts.map((p) => [p.userData.name, p]));
  return { group, parts, byName, setExplode };
}
