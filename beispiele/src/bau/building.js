import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 3D-Bühne der Baufirma: ein Gebäude, das beim Scrollen Geschoss für Geschoss wächst, plus Turmdrehkran.
// Die Colorway steuert den Zustand: „beton“ = Rohbau im Tageslicht, „bauplan“ = Linienmodell wie eine Zeichnung,
// „abend“ = fertig, Fenster leuchten.
//
// HTML: [data-build-end] markiert den Abschnitt, an dessen Ende das Gebäude vollständig steht.

const FLOORS = 9;
const FLOOR_H = 0.34;
const W = 2.6; // Länge (x)
const D = 1.5; // Tiefe (z)
const BAYS = 5;
const settle = gsap.parseEase('power3.out');

export function initBuilding(stage, { reduced }) {
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.6;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const target = new THREE.Vector3(0, 1.2, 0);

  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-4, 7, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 6, bottom: -3, near: 1, far: 20 });
  sun.shadow.radius = 4;
  scene.add(sun);
  const hemi = new THREE.HemisphereLight(0xe8ecf0, 0x6b655c, 0.9);
  scene.add(hemi);

  // ---------- Materialien (Blaupausen-Modus blendet die Flächen aus, Linien ein)
  const concrete = new THREE.MeshStandardMaterial({ color: 0xcfcbc3, roughness: 0.92, transparent: true });
  const darkConcrete = new THREE.MeshStandardMaterial({ color: 0x9a968e, roughness: 0.9, transparent: true });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x9fb2bd,
    metalness: 0.2,
    roughness: 0.06,
    transparent: true,
    opacity: 0.38,
    envMapIntensity: 1.6,
  });
  const steel = new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.55, metalness: 0.2, transparent: true });
  const lineMat = new THREE.LineBasicMaterial({ color: 0x6fd3ff, transparent: true, opacity: 0 });
  const roomMats = [0xffd38a, 0xffe2b0, 0xffc56b].map(
    (c) => new THREE.MeshStandardMaterial({ color: 0x77736c, emissive: c, emissiveIntensity: 0, roughness: 1 }),
  );
  const solids = [concrete, darkConcrete, glass, steel];
  const dayConcrete = new THREE.Color(0xcfcbc3);
  const nightConcrete = new THREE.Color(0x3b3a38);
  const dayDark = new THREE.Color(0x9a968e);
  const nightDark = new THREE.Color(0x2a2927);
  const dayRoom = new THREE.Color(0x77736c);
  const nightRoom = new THREE.Color(0x111111);

  const addEdges = (mesh, parent) => {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 20), lineMat);
    edges.position.copy(mesh.position);
    edges.rotation.copy(mesh.rotation);
    parent.add(edges);
  };
  const box = (w, h, d, mat, x, y, z, parent, { edges = true, shadow = true } = {}) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = shadow;
    m.receiveShadow = shadow;
    parent.add(m);
    if (edges) addEdges(m, parent);
    return m;
  };

  // ---------- Gebäude: Geschosse als Gruppen, damit sie einzeln „eingehoben“ werden können
  const building = new THREE.Group();
  scene.add(building);
  const floors = [];
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  for (let i = 0; i < FLOORS; i++) {
    const g = new THREE.Group();
    const top = i === FLOORS - 1;
    box(W + 0.1, 0.07, D + 0.1, concrete, 0, 0.035, 0, g); // Decke
    // Stützen im Raster
    for (let b = 0; b <= BAYS; b++) {
      const x = -W / 2 + (b * W) / BAYS;
      for (const z of [-D / 2 + 0.04, D / 2 - 0.04]) box(0.07, FLOOR_H - 0.07, 0.07, darkConcrete, x, FLOOR_H / 2 + 0.035, z, g);
    }
    // Treppenhauskern
    box(0.5, FLOOR_H - 0.07, 0.6, darkConcrete, W / 2 - 0.45, FLOOR_H / 2 + 0.035, 0, g);
    // Räume hinter der Fassade (leuchten am Abend) und Glas davor
    for (let b = 0; b < BAYS; b++) {
      const x = -W / 2 + ((b + 0.5) * W) / BAYS;
      for (const side of [-1, 1]) {
        if (rand() > 0.22) {
          const room = box(W / BAYS - 0.1, FLOOR_H - 0.12, 0.02, roomMats[Math.floor(rand() * 3)], x, FLOOR_H / 2 + 0.035, side * (D / 2 - 0.12), g, { edges: false, shadow: false });
          room.userData.room = true;
        }
      }
    }
    for (const side of [-1, 1]) {
      box(W - 0.02, FLOOR_H - 0.08, 0.012, glass, 0, FLOOR_H / 2 + 0.04, side * (D / 2 - 0.02), g, { shadow: false });
    }
    box(0.012, FLOOR_H - 0.08, D - 0.06, glass, -W / 2 + 0.02, FLOOR_H / 2 + 0.04, 0, g, { shadow: false });
    if (top) {
      box(W + 0.1, 0.07, D + 0.1, concrete, 0, FLOOR_H + 0.035, 0, g); // Dach
      box(W + 0.1, 0.12, 0.04, concrete, 0, FLOOR_H + 0.13, D / 2 + 0.03, g); // Attika
      box(W + 0.1, 0.12, 0.04, concrete, 0, FLOOR_H + 0.13, -D / 2 - 0.03, g);
    }
    g.position.y = i * FLOOR_H;
    g.userData.baseY = g.position.y;
    building.add(g);
    floors.push(g);
  }

  // Bodenplatte
  box(W + 0.5, 0.06, D + 0.5, darkConcrete, 0, -0.03, 0, building);

  // ---------- Turmdrehkran
  const crane = new THREE.Group();
  const mastH = FLOORS * FLOOR_H + 1.1;
  box(0.12, mastH, 0.12, steel, 0, mastH / 2, 0, crane);
  const jib = new THREE.Group();
  box(3.2, 0.08, 0.1, steel, 1.1, 0, 0, jib);
  box(1.0, 0.08, 0.1, steel, -0.75, 0, 0, jib);
  box(0.35, 0.22, 0.22, darkConcrete, -1.1, -0.12, 0, jib); // Gegengewicht
  box(0.2, 0.18, 0.18, steel, 0, 0.12, 0, jib); // Führerhaus
  const hookLine = box(0.008, 1.4, 0.008, darkConcrete, 2.2, -0.7, 0, jib, { edges: false });
  jib.position.y = mastH;
  crane.add(jib);
  crane.position.set(W / 2 + 0.7, 0, -1.3);
  scene.add(crane);

  // ---------- Boden: Schattenfänger + Raster (Raster nur im Bauplan sichtbar)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.18 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(24, 48, 0x6fd3ff, 0x6fd3ff);
  grid.material.transparent = true;
  grid.material.opacity = 0;
  scene.add(grid);

  // ---------- Zustände
  const state = { build: reduced ? FLOORS : 1.2, blue: 0, night: 0, orbit: 0, jib: 0.4 };
  const apply = () => {
    floors.forEach((f, i) => {
      const p = gsap.utils.clamp(0, 1, state.build - i);
      f.visible = p > 0.001;
      f.position.y = f.userData.baseY + (1 - settle(p)) * 1.6;
    });
    solids.forEach((m) => {
      const base = m === glass ? 0.38 : 1;
      m.opacity = base * (1 - state.blue * 0.92);
    });
    lineMat.opacity = state.blue;
    grid.material.opacity = state.blue * 0.35;
    ground.material.opacity = 0.18 * (1 - state.blue) * (1 - state.night * 0.5);
    roomMats.forEach((m) => {
      m.emissiveIntensity = state.night * 2.4;
      m.color.lerpColors(dayRoom, nightRoom, state.night);
    });
    concrete.color.lerpColors(dayConcrete, nightConcrete, state.night);
    darkConcrete.color.lerpColors(dayDark, nightDark, state.night);
    sun.intensity = 2.2 * (1 - state.night * 0.85);
    hemi.intensity = 0.9 * (1 - state.night * 0.7);
    scene.environmentIntensity = 0.6 * (1 - state.night * 0.6);
    jib.rotation.y = state.jib;
    hookLine.scale.y = 1 - Math.min(1, state.build / FLOORS) * 0.5;
    hookLine.position.y = -0.7 * hookLine.scale.y;
  };

  // Colorway → Zustand
  const modes = { beton: { blue: 0, night: 0 }, bauplan: { blue: 1, night: 0 }, abend: { blue: 0, night: 1 } };
  const toMode = (name, instant) => modes[name] && gsap.to(state, { ...modes[name], duration: instant || reduced ? 0 : 1.4, ease: 'signature', overwrite: 'auto' });
  document.addEventListener('colorway', (e) => toMode(e.detail.name));
  toMode(document.documentElement.dataset.colorway || 'beton', true);

  // ---------- Größe und Bildausschnitt: am Desktop sitzt das Gebäude rechts, mobil oben
  let desktop = matchMedia('(min-width: 900px)').matches;
  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    desktop = w >= 900;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (desktop) camera.setViewOffset(w, h, -w * 0.27, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.24, w, h);
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(stage);

  // ---------- Scroll: Gebäude wächst bis [data-build-end], Kamera umkreist es über die ganze Seite
  if (!reduced) {
    gsap.to(state, { build: 2.2, duration: 2, ease: 'expo.out', delay: 0.3 });
    gsap.to(state, {
      build: FLOORS,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: '10% top',
        endTrigger: document.querySelector('[data-build-end]') || document.body,
        end: 'bottom bottom',
        scrub: 1,
      },
    });
    gsap.to(state, {
      orbit: 1,
      jib: 2.6,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.5 },
    });
  }

  const clock = new THREE.Clock();
  gsap.ticker.add(() => {
    if (document.hidden) return;
    const t = clock.getElapsedTime();
    apply();
    const a = -0.75 + state.orbit * 1.5 + (reduced ? 0 : Math.sin(t * 0.15) * 0.03);
    const r = desktop ? 9.6 : 17;
    const camY = 2.4 + state.orbit * 1.6;
    camera.position.set(Math.sin(a) * r, camY, Math.cos(a) * r);
    target.y = 0.4 + Math.min(state.build, FLOORS) * FLOOR_H * 0.5;
    camera.lookAt(target);
    renderer.render(scene, camera);
  });

  ScrollTrigger.refresh();
}
