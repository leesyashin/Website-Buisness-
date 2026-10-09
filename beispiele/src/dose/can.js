import * as THREE from 'three';

// 330-ml-Dose aus einem Drehprofil (Maße in Dezimetern: Ø 6,6 cm, Höhe 11,5 cm).
// Aufbau: Aluminium-Körper (Lathe), darüber der bedruckte Mantel (offener Zylinder mit Etikett-Textur),
// oben Deckel mit Lasche. Gibt { group, setLabel } zurück.
export const CAN = { radius: 0.33, height: 1.15, labelBottom: 0.075, labelTop: 1.0 };

export function createCan(labelCanvas) {
  const group = new THREE.Group();

  const profile = [
    [0, 0.06], [0.12, 0.055], [0.22, 0.035], [0.27, 0.004], [0.295, 0], [0.31, 0.012], [0.33, 0.07],
    [0.33, 1.0], [0.315, 1.05], [0.29, 1.085], [0.278, 1.1], [0.282, 1.112], [0.276, 1.122],
    [0.265, 1.118], [0.258, 1.1], [0, 1.1],
  ].map(([x, y]) => new THREE.Vector2(x, y));

  const metal = new THREE.MeshPhysicalMaterial({ color: 0xd9dde2, metalness: 1, roughness: 0.26 });
  const shell = new THREE.Mesh(new THREE.LatheGeometry(profile, 128), metal);
  group.add(shell);

  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const labelMat = new THREE.MeshPhysicalMaterial({
    map: texture,
    metalness: 0.45,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const h = CAN.labelTop - CAN.labelBottom;
  const label = new THREE.Mesh(new THREE.CylinderGeometry(CAN.radius + 0.0015, CAN.radius + 0.0015, h, 160, 1, true), labelMat);
  label.position.y = CAN.labelBottom + h / 2;
  label.rotation.y = Math.PI; // Bildmitte (u = 0,5) zur Kamera
  group.add(label);

  // Lasche: flache, abgerundete Form mit Loch, leicht über dem Deckel
  const tabShape = new THREE.Shape();
  roundedRect(tabShape, -0.06, -0.1, 0.12, 0.2, 0.05);
  const hole = new THREE.Path();
  roundedRect(hole, -0.035, 0.01, 0.07, 0.06, 0.025);
  tabShape.holes.push(hole);
  const tab = new THREE.Mesh(new THREE.ExtrudeGeometry(tabShape, { depth: 0.006, bevelEnabled: false }), metal);
  tab.rotation.x = -Math.PI / 2;
  tab.position.set(0, 1.104, 0.05);
  group.add(tab);
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 24), metal);
  rivet.position.set(0, 1.108, 0);
  group.add(rivet);

  // Mittelpunkt der Dose in den Ursprung, damit sie sich um sich selbst dreht
  group.children.forEach((c) => (c.position.y -= CAN.height / 2));

  return {
    group,
    setLabel(canvas) {
      texture.image = canvas;
      texture.needsUpdate = true;
    },
    dispose() {
      group.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose?.();
      });
      texture.dispose();
    },
  };
}

function roundedRect(s, x, y, w, h, r) {
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
}
