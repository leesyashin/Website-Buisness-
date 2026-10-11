import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createCan } from './can.js';
import { drawLabel } from './label.js';
import { flavors } from './flavors.js';

// 3D-Bühne der Produktseite: eine Dose, die beim Scrollen von Kapitel zu Kapitel wandert,
// beim Sortenwechsel einmal herumwirbelt und im Kapitel „Perlage“ von Kohlensäure umgeben ist.
//
// Kapitel im HTML tragen [data-can="hero|story|sorten|perlage|finale"]. Die Haltung je Kapitel steht unten in POSES.
// Sortenwechsel kommt über das Colorway-Ereignis: heißt die neue Colorway wie eine Sorte, bekommt die Dose deren Etikett.

// x: Anteil der halben sichtbaren Breite (0,5 = Mitte der rechten Bildhälfte), damit die Dose bei jedem
// Seitenverhältnis in ihrer Hälfte bleibt und nie in die Textspalte rutscht.
const POSES = {
  desktop: {
    hero: { x: 0.5, y: -0.02, s: 1.12, rx: 0.08, ry: 0.05, rz: 0.14 },
    story: { x: -0.5, y: 0, s: 1, rx: 0.12, ry: 2.3, rz: -0.18 },
    sorten: { x: 0.48, y: 0, s: 1.12, rx: 0.05, ry: 6.38, rz: 0.08 },
    perlage: { x: -0.48, y: 0, s: 1.05, rx: 0.3, ry: 9.2, rz: 0.42 },
    finale: { x: 0.46, y: 0.02, s: 0.95, rx: -0.55, ry: 12.66, rz: 0.22 },
  },
  mobile: {
    hero: { x: 0, y: 0.42, s: 0.72, rx: 0.08, ry: 0.05, rz: 0.12 },
    story: { x: 0, y: 0.45, s: 0.62, rx: 0.12, ry: 2.3, rz: -0.14 },
    sorten: { x: 0, y: 0.45, s: 0.7, rx: 0.05, ry: 6.38, rz: 0.08 },
    perlage: { x: 0, y: 0.42, s: 0.66, rx: 0.3, ry: 9.2, rz: 0.3 },
    finale: { x: 0, y: 0.45, s: 0.62, rx: -0.55, ry: 12.66, rz: 0.18 },
  },
};

export async function initCanScene(stage, { reduced }) {
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  // Etiketten erst malen, wenn die Schrift da ist
  await document.fonts.load('800 100px "Bricolage Grotesque Variable"');
  const labels = Object.fromEntries(Object.keys(flavors).map((k) => [k, drawLabel(document.createElement('canvas'), k)]));
  let current = flavors[document.documentElement.dataset.colorway] ? document.documentElement.dataset.colorway : 'yuzu';

  // ---------- Renderer, Szene, Licht
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.append(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.25, 4.4);
  camera.lookAt(0, 0, 0);

  // Ein hartes Streiflicht von rechts oben gibt dem Metall die typische Kante
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 2);
  scene.add(key);

  // ---------- Dose: rig (Kapitel-Haltung) > tiltGroup (Maus, Schweben) > spinGroup (Sortenwechsel) > Dose
  const can = createCan(labels[current]);
  const rig = new THREE.Group();
  const tiltGroup = new THREE.Group();
  const spinGroup = new THREE.Group();
  spinGroup.add(can.group);
  tiltGroup.add(spinGroup);
  rig.add(tiltGroup);
  scene.add(rig);

  // Weicher Kontaktschatten (Radialverlauf statt echter Schatten – billig und ruhig)
  const shadowCanvas = Object.assign(document.createElement('canvas'), { width: 128, height: 128 });
  const sctx = shadowCanvas.getContext('2d');
  const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.38)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.1),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.78;
  rig.add(shadow);

  // ---------- Kohlensäure: aufsteigende Perlen um die Dose (Instanzen, ein Draw-Call)
  const BUBBLES = 160;
  const bubbleMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.05,
    transparent: true,
    opacity: 0,
    envMapIntensity: 2.2,
  });
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), bubbleMat, BUBBLES);
  const seeds = Array.from({ length: BUBBLES }, () => ({
    a: Math.random() * Math.PI * 2,
    r: 0.45 + Math.random() * 1.5,
    y: Math.random() * 3 - 1.5,
    v: 0.12 + Math.random() * 0.35,
    size: 0.006 + Math.random() ** 3 * 0.035,
    wobble: Math.random() * 10,
  }));
  scene.add(bubbles);
  const fizz = { amount: 0 };
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const updateBubbles = (t, dt) => {
    bubbleMat.opacity = fizz.amount * 0.55;
    bubbles.visible = fizz.amount > 0.01;
    if (!bubbles.visible) return;
    seeds.forEach((b, i) => {
      b.y += b.v * dt * (0.4 + fizz.amount);
      if (b.y > 1.6) b.y = -1.6;
      pos.set(
        rig.position.x * 0.6 + Math.cos(b.a) * b.r + Math.sin(t * 1.3 + b.wobble) * 0.02,
        b.y,
        Math.sin(b.a) * b.r * 0.6 - 0.2,
      );
      const s = b.size * fizz.amount * (0.6 + 0.4 * Math.min(1, (b.y + 1.6) / 1.2));
      scl.setScalar(s);
      m.compose(pos, q, scl);
      bubbles.setMatrixAt(i, m);
    });
    bubbles.instanceMatrix.needsUpdate = true;
  };

  // ---------- Größe
  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(stage);

  // ---------- Haltung je Kapitel, an den Scrollweg gekoppelt
  const pose = { ...POSES.desktop.hero };
  const halfWidth = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
  const applyPose = () => {
    rig.position.set(pose.x * halfWidth(), pose.y, 0);
    rig.scale.setScalar(pose.s);
    tiltGroup.rotation.set(pose.rx, 0, pose.rz);
    spinGroup.rotation.y = pose.ry + spin.y;
  };
  const spin = { y: 0 };

  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (ctx) => {
    const set = ctx.conditions.desktop ? POSES.desktop : POSES.mobile;
    const sections = gsap.utils.toArray('[data-can]');
    Object.assign(pose, set[sections[0]?.dataset.can || 'hero']);
    if (reduced) {
      // Ohne Bewegung: Haltung springt pro Kapitel um, ohne Übergang – die Dose steht nie in der Textspalte
      sections.forEach((section) =>
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => self.isActive && Object.assign(pose, set[section.dataset.can]),
        }),
      );
      return;
    }

    sections.slice(1).forEach((section, i) => {
      const from = set[sections[i].dataset.can];
      const to = set[section.dataset.can];
      gsap.fromTo(pose, { ...from }, {
        ...to,
        ease: 'power1.inOut',
        immediateRender: false,
        // Haltung ist genau dann erreicht, wenn der Abschnitt oben anliegt – dort rastet die Seite ein (data-snap)
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: 0.6 },
      });
    });

    // Perlage: Perlen ein- und wieder ausblenden
    const perlage = document.querySelector('[data-can="perlage"]');
    if (perlage) {
      gsap.timeline({ scrollTrigger: { trigger: perlage, start: 'top 70%', end: 'bottom 30%', scrub: true } })
        .to(fizz, { amount: 1, ease: 'power2.out', duration: 0.3 })
        .to(fizz, { amount: 1, duration: 0.4 })
        .to(fizz, { amount: 0, ease: 'power2.in', duration: 0.3 });
    }
  });

  // Ankommen: Dose steigt beim Laden auf und dreht sich in Position
  if (!reduced) gsap.from(spin, { y: -Math.PI * 1.5, duration: 2.2, ease: 'expo.out' });
  const intro = { lift: reduced ? 0 : -2.4 };
  if (!reduced) gsap.to(intro, { lift: 0, duration: 1.8, ease: 'expo.out' });

  // ---------- Maus: Dose neigt sich leicht zum Zeiger
  const tilt = { x: 0, y: 0 };
  if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tx = gsap.quickTo(tilt, 'x', { duration: 1.2, ease: 'power3.out' });
    const ty = gsap.quickTo(tilt, 'y', { duration: 1.2, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => {
      tx((e.clientY / innerHeight - 0.5) * 0.25);
      ty((e.clientX / innerWidth - 0.5) * 0.5);
    });
  }

  // ---------- Sortenwechsel über Colorway
  document.addEventListener('colorway', (e) => {
    const next = e.detail.name;
    if (!flavors[next] || next === current) return;
    current = next;
    if (reduced) {
      can.setLabel(labels[next]);
      return;
    }
    gsap.killTweensOf(spin);
    const base = Math.round(spin.y / (Math.PI * 2)) * Math.PI * 2;
    gsap.to(spin, {
      y: base + Math.PI * 2,
      duration: 1.3,
      ease: 'signature',
      onUpdate() {
        if (this.progress() > 0.3 && can.label !== next) {
          can.label = next;
          can.setLabel(labels[next]);
        }
      },
    });
  });

  // ---------- Takt: über den GSAP-Ticker, damit Scroll und Bild im selben Frame rechnen
  let visible = true;
  document.addEventListener('visibilitychange', () => (visible = !document.hidden));

  // Ab dem letzten Kapitel scrollt die Dose mit der Seite nach oben weg, statt über Laufband und Fuß zu stehen
  const lastChapter = document.querySelector('[data-can="finale"]');
  const worldPerPx = () => (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z) / innerHeight;

  const clock = new THREE.Clock();
  gsap.ticker.add(() => {
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    applyPose();
    rig.position.y += intro.lift + (reduced ? 0 : Math.sin(t * 0.9) * 0.025);
    if (lastChapter) rig.position.y += Math.max(0, -lastChapter.getBoundingClientRect().top) * worldPerPx();
    tiltGroup.rotation.x += tilt.x;
    tiltGroup.rotation.z += reduced ? 0 : Math.sin(t * 0.6) * 0.015;
    spinGroup.rotation.y += tilt.y;
    shadow.material.opacity = 1 - Math.min(1, Math.abs(intro.lift) / 1.5);
    updateBubbles(t, dt);
    renderer.render(scene, camera);
  });
}
